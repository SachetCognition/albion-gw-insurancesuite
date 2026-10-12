package albion.security

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.lang.StringBuilder
uses java.util.Base64
uses java.util.HashMap

class AlbionAesEncryptionPluginTest extends TestBase {

  // Test-only keys (32 bytes each); real keys exist only in CyberArk.
  static final var KEY_A : String = Base64.getEncoder().encodeToString("albion-test-key-a-0123456789abcd".getBytes("UTF-8"))
  static final var KEY_B : String = Base64.getEncoder().encodeToString("albion-test-key-b-0123456789abcd".getBytes("UTF-8"))
  static final var NINO : String = "QQ123456C"

  private function key(k : String) : String {
    return AlbionCentre.PROPERTY_PREFIX + "." + k
  }

  private function plugin(keyId : String, base64Key : String, retired : String) : AlbionAesEncryptionPlugin {
    var values = new HashMap<String, String>()
    if (keyId != null) {
      values.put(key(AlbionConfigService.KEY_ENCRYPTION_KEY_ID), keyId)
    }
    if (base64Key != null) {
      values.put(key(AlbionConfigService.KEY_ENCRYPTION_KEY), base64Key)
    }
    if (retired != null) {
      values.put(key(AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED), retired)
    }
    return new AlbionAesEncryptionPlugin(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
  }

  private function assertFailsClosed(action : block()) {
    var failed = false
    try {
      action()
    } catch (e : IllegalStateException) {
      failed = true
    }
    assertTrue(failed)
  }

  function testRoundTrip() {
    var p = plugin("k2026a", KEY_A, null)
    for (plain in {NINO, "", "AB 12 34 56 C", "Zo\u00EB \u00D3'Brien-\u0141ukasz"}) {
      var stored = p.encrypt(plain)
      assertTrue(stored.startsWith("k2026a:"))
      if (plain.length() > 0) {
        assertFalse(stored.contains(plain))
      }
      assertEquals(plain, p.decrypt(stored))
    }
    assertNull(p.encrypt(null))
    assertNull(p.decrypt(null))
    assertEquals(AlbionAesEncryptionPlugin.ENCRYPTION_IDENTIFIER, p.EncryptionIdentifier)
  }

  function testSameInputGivesDifferentCiphertext() {
    var p = plugin("k2026a", KEY_A, null)
    var first = p.encrypt(NINO)
    var second = p.encrypt(NINO)
    assertFalse(first == second)
    assertEquals(NINO, p.decrypt(first))
    assertEquals(NINO, p.decrypt(second))
  }

  function testEncryptedLengthBoundsTheStoredValue() {
    var p = plugin("k2026a-rotation", KEY_A, null)
    assertTrue(p.encrypt(NINO).length() <= p.getEncryptedLength(9))
    var wide = new StringBuilder()
    for (i in 0..|20) {
      wide.append("\u20AC")
    }
    assertTrue(p.encrypt(wide.toString()).length() <= p.getEncryptedLength(20))
  }

  function testRetiredKeyIdStillDecryptsAfterRotation() {
    var stored = plugin("k2026a", KEY_A, null).encrypt(NINO)
    var rotated = plugin("k2027a", KEY_B, "k2026a:" + KEY_A)
    assertEquals(NINO, rotated.decrypt(stored))
    assertEquals("k2027a", rotated.CurrentKeyId)
    assertTrue(rotated.encrypt(NINO).startsWith("k2027a:"))
  }

  function testWrongKeyIdFails() {
    var stored = plugin("k2026a", KEY_A, null).encrypt(NINO)
    var otherKeyring = plugin("k2027a", KEY_B, null)
    assertFailsClosed(\ -> otherKeyring.decrypt(stored))
    var relabelled = "k2027a" + stored.substring(stored.indexOf(":"))
    assertFailsClosed(\ -> otherKeyring.decrypt(relabelled))
    var sameKeyNewId = plugin("k2027a", KEY_A, null)
    assertFailsClosed(\ -> sameKeyNewId.decrypt(relabelled))
  }

  function testTamperedValueFails() {
    var p = plugin("k2026a", KEY_A, null)
    var stored = p.encrypt(NINO)
    var bytes = Base64.getDecoder().decode(stored.substring(stored.indexOf(":") + 1))
    bytes[bytes.length - 1] = (bytes[bytes.length - 1] ^ 1) as byte
    var tampered = "k2026a:" + Base64.getEncoder().encodeToString(bytes)
    assertFailsClosed(\ -> p.decrypt(tampered))
    assertFailsClosed(\ -> p.decrypt(NINO))
  }

  function testNoKeyConfiguredFails() {
    var none = plugin(null, null, null)
    assertFailsClosed(\ -> none.encrypt(NINO))
    assertFailsClosed(\ -> none.decrypt("k2026a:AAAA"))
    assertFailsClosed(\ -> plugin("k2026a", null, null).encrypt(NINO))
    assertFailsClosed(\ -> plugin(null, KEY_A, null).encrypt(NINO))
  }

  function testUnusableKeyMaterialFails() {
    assertFailsClosed(\ -> plugin("k2026a", "\${CL_ENCRYPTION_KEY}", null).encrypt(NINO))
    assertFailsClosed(\ -> plugin("k2026a", Base64.getEncoder().encodeToString("too-short".getBytes("UTF-8")), null).encrypt(NINO))
    assertFailsClosed(\ -> plugin("bad id!", KEY_A, null).encrypt(NINO))
    assertFailsClosed(\ -> plugin("k2027a", KEY_B, "k2026a").encrypt(NINO))
  }
}

package albion.util.v2

uses gw.testharness.TestBase

/** Characterisation tests pinning current production behaviour of AlbionCommonUtilsV2. */
class AlbionCommonUtilsV2Test extends TestBase {

  function testDerivePerilCode0_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionCommonUtilsV2.derivePerilCode0(" Ab  c "))
    assertNull(AlbionCommonUtilsV2.derivePerilCode0(null))
  }

  function testResolveBrand1_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionCommonUtilsV2.resolveBrand1(1.005bd))
    assertEquals(2.34bd, AlbionCommonUtilsV2.resolveBrand1(2.345bd))
    assertEquals(0bd, AlbionCommonUtilsV2.resolveBrand1(null))
  }

  function testNormaliseNCDRef2_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionCommonUtilsV2.normaliseNCDRef2(1.005bd))
    assertEquals(2.34bd, AlbionCommonUtilsV2.normaliseNCDRef2(2.345bd))
    assertEquals(0bd, AlbionCommonUtilsV2.normaliseNCDRef2(null))
  }

  function testResolveNCDCode3_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionCommonUtilsV2.resolveNCDCode3(" Ab  c "))
    assertNull(AlbionCommonUtilsV2.resolveNCDCode3(null))
  }

  function testCheckPolicyRef4_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionCommonUtilsV2.checkPolicyRef4("  a \t\n b "))
    assertEquals("", AlbionCommonUtilsV2.checkPolicyRef4(null))
  }

  function testNormaliseCoverFlag5_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionCommonUtilsV2.normaliseCoverFlag5("  a \t\n b "))
    assertEquals("", AlbionCommonUtilsV2.normaliseCoverFlag5(null))
  }

  function testCheckPerilForMI6_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionCommonUtilsV2.checkPerilForMI6(1.005bd))
    assertEquals(2.34bd, AlbionCommonUtilsV2.checkPerilForMI6(2.345bd))
    assertEquals(0bd, AlbionCommonUtilsV2.checkPerilForMI6(null))
  }

  function testValidateSchemeRef7_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionCommonUtilsV2.validateSchemeRef7("Y"))
    assertTrue(AlbionCommonUtilsV2.validateSchemeRef7("1"))
    assertTrue(AlbionCommonUtilsV2.validateSchemeRef7("TRUE"))
    assertTrue(AlbionCommonUtilsV2.validateSchemeRef7("T"))
    assertTrue(AlbionCommonUtilsV2.validateSchemeRef7("YES"))
    assertFalse(AlbionCommonUtilsV2.validateSchemeRef7("N"))
    assertFalse(AlbionCommonUtilsV2.validateSchemeRef7("y"))
  }

  function testLookupVRMCode8_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionCommonUtilsV2.lookupVRMCode8("  a \t\n b "))
    assertEquals("", AlbionCommonUtilsV2.lookupVRMCode8(null))
  }

  function testNormalisePremiumRef9_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionCommonUtilsV2.normalisePremiumRef9("  ab c "))
    assertNull(AlbionCommonUtilsV2.normalisePremiumRef9(null))
  }

  function testResolveCoverDesc11_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionCommonUtilsV2.resolveCoverDesc11("Y"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverDesc11("1"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverDesc11("TRUE"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverDesc11("T"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverDesc11("YES"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverDesc11("N"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverDesc11("y"))
  }

  function testValidateBrandRef12_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionCommonUtilsV2.validateBrandRef12("  ab c "))
    assertNull(AlbionCommonUtilsV2.validateBrandRef12(null))
  }

  function testNormaliseBrandRef13_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionCommonUtilsV2.normaliseBrandRef13("  ab c "))
    assertNull(AlbionCommonUtilsV2.normaliseBrandRef13(null))
  }

  function testCheckIPTCode14_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionCommonUtilsV2.checkIPTCode14(" Ab  c "))
    assertNull(AlbionCommonUtilsV2.checkIPTCode14(null))
  }

  function testMapClaimStatus25_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionCommonUtilsV2.mapClaimStatus25("Y"))
    assertTrue(AlbionCommonUtilsV2.mapClaimStatus25("1"))
    assertTrue(AlbionCommonUtilsV2.mapClaimStatus25("TRUE"))
    assertTrue(AlbionCommonUtilsV2.mapClaimStatus25("T"))
    assertTrue(AlbionCommonUtilsV2.mapClaimStatus25("YES"))
    assertFalse(AlbionCommonUtilsV2.mapClaimStatus25("N"))
    assertFalse(AlbionCommonUtilsV2.mapClaimStatus25("y"))
  }
}

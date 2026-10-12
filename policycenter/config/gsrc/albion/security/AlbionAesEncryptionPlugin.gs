package albion.security

uses albion.config.AlbionConfigService
uses gw.plugin.util.IEncryption
uses java.nio.charset.StandardCharsets
uses java.security.GeneralSecurityException
uses java.security.SecureRandom
uses java.util.Base64
uses java.util.HashMap
uses java.util.Map
uses java.util.concurrent.locks.ReentrantLock
uses javax.crypto.Cipher
uses javax.crypto.spec.GCMParameterSpec
uses javax.crypto.spec.SecretKeySpec

/**
 * AlbionAesEncryptionPlugin - IEncryption plugin for columns marked <columnParam name="encryption" value="true"/>.
 *
 * AES-256-GCM (javax.crypto), a random 96-bit IV per value, 128-bit tag. Stored form:
 *   <keyId>:<Base64(IV || ciphertext || tag)>
 * The key id is also bound into the GCM tag as associated data, so a value cannot be relabelled to another key.
 *
 * Key material is never held in the repository. It is read through AlbionConfigService from the rendered
 * environments/<env>/<centre>.properties (CyberArk tokens, see environments/README.txt), keys prefixed per centre:
 *   <prefix>.encryption.key           Base64 of 32 random bytes - the current key, used for every encrypt
 *   <prefix>.encryption.key.id        id written in front of every value encrypted with the current key
 *   <prefix>.encryption.keys.retired  <keyId>:<Base64 key>,... - earlier keys, decrypt only (rotation)
 * Fails closed: with no usable key every call throws IllegalStateException; nothing is ever stored or returned as
 * plaintext. A value written under a key id that is not configured fails to decrypt.
 *
 * One canonical implementation, copied byte-for-byte into every centre's gsrc (cc, pc, bc, cm).
 * Copies are enforced identical by tools/scripts/check_brand_config_drift.py.
 * Operations guide: docs/architecture/albion-config-and-brand-services.md (Encryption at rest).
 */
class AlbionAesEncryptionPlugin implements IEncryption {

  public static final var ENCRYPTION_IDENTIFIER : String = "albion-aes256gcm"

  public static final var MAX_KEY_ID_LENGTH : int = 16

  static final var TRANSFORMATION : String = "AES/GCM/NoPadding"
  static final var KEY_BYTES : int = 32
  static final var IV_BYTES : int = 12
  static final var TAG_BITS : int = 128
  static final var TAG_BYTES : int = 16
  static final var MAX_UTF8_BYTES_PER_CHAR : int = 3
  static final var KEY_ID_PATTERN : String = "[A-Za-z0-9._-]{1," + MAX_KEY_ID_LENGTH + "}"
  static final var SEPARATOR : String = ":"
  static final var RANDOM : SecureRandom = new SecureRandom()

  var _config : AlbionConfigService
  var _lock : ReentrantLock = new ReentrantLock()
  var _currentKeyId : String
  var _keys : Map<String, SecretKeySpec>

  /** Plugin registry entry point: keys come from this centre's AlbionConfigService.Instance on first use. */
  construct() {
    this(null)
  }

  /** config may be null, meaning AlbionConfigService.Instance. */
  construct(config : AlbionConfigService) {
    _config = config
  }

  override function encrypt(value : String) : String {
    if (value == null) {
      return null
    }
    loadKeys()
    try {
      var iv = new byte[IV_BYTES]
      RANDOM.nextBytes(iv)
      var cipher = Cipher.getInstance(TRANSFORMATION)
      cipher.init(Cipher.ENCRYPT_MODE, _keys.get(_currentKeyId), new GCMParameterSpec(TAG_BITS, iv))
      cipher.updateAAD(_currentKeyId.getBytes(StandardCharsets.UTF_8))
      var sealed = cipher.doFinal(value.getBytes(StandardCharsets.UTF_8))
      var payload = new byte[IV_BYTES + sealed.length]
      System.arraycopy(iv, 0, payload, 0, IV_BYTES)
      System.arraycopy(sealed, 0, payload, IV_BYTES, sealed.length)
      return _currentKeyId + SEPARATOR + Base64.getEncoder().encodeToString(payload)
    } catch (e : GeneralSecurityException) {
      throw new IllegalStateException("Encryption failed under key id " + _currentKeyId + ": " + e.Message, e)
    }
  }

  override function decrypt(value : String) : String {
    if (value == null) {
      return null
    }
    loadKeys()
    var sep = value.indexOf(SEPARATOR)
    if (sep <= 0) {
      throw new IllegalStateException("Not an " + ENCRYPTION_IDENTIFIER + " value (no key id)")
    }
    var keyId = value.substring(0, sep)
    var key = _keys.get(keyId)
    if (key == null) {
      throw new IllegalStateException("No encryption key configured for key id '" + keyId + "' ("
          + _config.fullKey(AlbionConfigService.KEY_ENCRYPTION_KEY_ID) + " / " + _config.fullKey(AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED) + ")")
    }
    var payload : byte[]
    try {
      payload = Base64.getDecoder().decode(value.substring(sep + 1))
    } catch (e : IllegalArgumentException) {
      throw new IllegalStateException("Corrupt " + ENCRYPTION_IDENTIFIER + " value under key id " + keyId + " (not Base64)", e)
    }
    if (payload.length < IV_BYTES + TAG_BYTES) {
      throw new IllegalStateException("Corrupt " + ENCRYPTION_IDENTIFIER + " value under key id " + keyId + " (too short)")
    }
    try {
      var cipher = Cipher.getInstance(TRANSFORMATION)
      cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, payload, 0, IV_BYTES))
      cipher.updateAAD(keyId.getBytes(StandardCharsets.UTF_8))
      var plain = cipher.doFinal(payload, IV_BYTES, payload.length - IV_BYTES)
      return new String(plain, StandardCharsets.UTF_8)
    } catch (e : GeneralSecurityException) {
      throw new IllegalStateException("Decryption failed under key id " + keyId + " (wrong key or tampered value)", e)
    }
  }

  /** Upper bound on the stored length for a column of size characters (sizes the database column). */
  override function getEncryptedLength(size : int) : int {
    var payloadBytes = IV_BYTES + (size * MAX_UTF8_BYTES_PER_CHAR) + TAG_BYTES
    return MAX_KEY_ID_LENGTH + SEPARATOR.length() + (4 * ((payloadBytes + 2) / 3))
  }

  override property get EncryptionIdentifier() : String {
    return ENCRYPTION_IDENTIFIER
  }

  /** Key id new values are written under. Throws when no key is configured. */
  property get CurrentKeyId() : String {
    loadKeys()
    return _currentKeyId
  }

  private function loadKeys() {
    using (_lock) {
      if (_keys != null) {
        return
      }
      if (_config == null) {
        _config = AlbionConfigService.Instance
      }
      var keyId = _config.rawValue(AlbionConfigService.KEY_ENCRYPTION_KEY_ID)
      var keyValue = _config.rawValue(AlbionConfigService.KEY_ENCRYPTION_KEY)
      if (keyId == null or keyValue == null) {
        throw new IllegalStateException("No encryption key configured: " + _config.fullKey(AlbionConfigService.KEY_ENCRYPTION_KEY) + " and "
            + _config.fullKey(AlbionConfigService.KEY_ENCRYPTION_KEY_ID) + " must both be set (CyberArk); refusing to store or read plaintext")
      }
      var keys = new HashMap<String, SecretKeySpec>()
      var retired = _config.rawValue(AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED)
      if (retired != null) {
        for (entry in retired.split(",")) {
          var trimmed = entry.trim()
          if (trimmed.length() == 0) {
            continue
          }
          var sep = trimmed.indexOf(SEPARATOR)
          if (sep <= 0) {
            throw new IllegalStateException(_config.fullKey(AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED) + ": expected <keyId>:<Base64 key> entries")
          }
          var retiredId = checkedKeyId(trimmed.substring(0, sep), AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED)
          keys.put(retiredId, secretKey(trimmed.substring(sep + 1), AlbionConfigService.KEY_ENCRYPTION_KEYS_RETIRED))
        }
      }
      keyId = checkedKeyId(keyId, AlbionConfigService.KEY_ENCRYPTION_KEY_ID)
      keys.put(keyId, secretKey(keyValue, AlbionConfigService.KEY_ENCRYPTION_KEY))
      _currentKeyId = keyId
      _keys = keys
    }
  }

  private function checkedKeyId(keyId : String, sourceKey : String) : String {
    var id = keyId.trim()
    if (!id.matches(KEY_ID_PATTERN)) {
      throw new IllegalStateException(_config.fullKey(sourceKey) + ": key id '" + id + "' must match " + KEY_ID_PATTERN)
    }
    return id
  }

  private function secretKey(base64 : String, sourceKey : String) : SecretKeySpec {
    var raw : byte[]
    try {
      raw = Base64.getDecoder().decode(base64.trim())
    } catch (e : IllegalArgumentException) {
      throw new IllegalStateException(_config.fullKey(sourceKey) + ": key is not Base64 (unrendered CyberArk token?)")
    }
    if (raw.length != KEY_BYTES) {
      throw new IllegalStateException(_config.fullKey(sourceKey) + ": AES-256 key must be " + KEY_BYTES + " bytes, got " + raw.length)
    }
    return new SecretKeySpec(raw, "AES")
  }
}

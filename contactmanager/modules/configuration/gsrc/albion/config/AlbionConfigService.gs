package albion.config

uses java.io.FileInputStream
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.List
uses java.util.Map
uses java.util.Properties
uses java.util.concurrent.locks.ReentrantLock

/**
 * AlbionConfigService - typed access to the non-sensitive Albion business constants held in
 * environments/<env>/<centre>.properties (keys are prefixed per centre, see AlbionCentre.PROPERTY_PREFIX).
 *
 * The KEY_ENCRYPTION_* keys are the exception: they carry CyberArk-rendered key material for
 * albion.security.AlbionAesEncryptionPlugin. They have no defaults, are not BUSINESS_KEYS and must never be logged.
 *
 * One canonical implementation, copied byte-for-byte into every centre's gsrc (cc, pc, bc, cm).
 * Copies are enforced identical by tools/scripts/check_brand_config_drift.py.
 * Consumer guide: docs/architecture/albion-config-and-brand-services.md
 *
 * Every DEFAULT_* below equals the value hardcoded in the centres today, so swapping a constant for a getter is
 * behaviour-neutral. Thresholds that diverge between call sites (large loss, ALBDIR/ALBBRK referral) are exposed via
 * "legacy-pinned" functions: scoped key -> caller's legacy value -> global key -> default.
 *
 * Invalid values (unparseable or out of range) fail fast with IllegalStateException naming the full key.
 */
class AlbionConfigService {

  public static final var CONFIG_FILE_SYSTEM_PROPERTY : String = "albion.config.file"

  public static final var KEY_FRAUD_REFER_SCORE : String = "fraud.refer.score"
  public static final var KEY_REFER_THRESHOLD_ALBDIR : String = "refer.threshold.albdir"
  public static final var KEY_REFER_THRESHOLD_ALBBRK : String = "refer.threshold.albbrk"
  public static final var KEY_IPT_STANDARD_RATE : String = "ipt.standard.rate"
  public static final var KEY_IPT_RATE_LEGACY : String = "ipt.rate"
  public static final var KEY_LARGE_LOSS_THRESHOLD : String = "large.loss.threshold"
  public static final var KEY_SLA_CREDIT_HIRE_MITIGATION_HOURS : String = "sla.credithire.mitigation.hours"
  public static final var KEY_SLA_CAT_EVENT_DECLARE_HOURS : String = "sla.cat.event.declare.hours"
  public static final var KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS : String = "sla.complaint.ack.promise.days"
  public static final var KEY_SLA_COMPLAINT_ACK_REGULATORY_DAYS : String = "sla.complaint.ack.regulatory.days"
  public static final var KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS : String = "sla.complaint.holding.letter.days"
  public static final var KEY_SLA_COMPLAINT_FINAL_RESPONSE_DAYS : String = "sla.complaint.final.response.days"

  /** Current AES-256 key, Base64 of 32 bytes. CyberArk token; no default. */
  public static final var KEY_ENCRYPTION_KEY : String = "encryption.key"
  /** Id written in front of every value encrypted with KEY_ENCRYPTION_KEY. CyberArk token; no default. */
  public static final var KEY_ENCRYPTION_KEY_ID : String = "encryption.key.id"
  /** Earlier keys kept for decryption after rotation: <keyId>:<Base64 key>,... CyberArk token; empty until first rotation. */
  public static final var KEY_ENCRYPTION_KEYS_RETIRED : String = "encryption.keys.retired"

  public static final var DEFAULT_FRAUD_REFER_SCORE : int = 55
  public static final var DEFAULT_REFER_THRESHOLD_ALBDIR : BigDecimal = 10000bd
  public static final var DEFAULT_REFER_THRESHOLD_ALBBRK : BigDecimal = 4000bd
  public static final var DEFAULT_IPT_STANDARD_RATE : BigDecimal = 0.12bd
  public static final var DEFAULT_LARGE_LOSS_THRESHOLD : BigDecimal = 25000bd
  public static final var DEFAULT_SLA_CREDIT_HIRE_MITIGATION_HOURS : int = 3
  public static final var DEFAULT_SLA_CAT_EVENT_DECLARE_HOURS : int = 4
  public static final var DEFAULT_SLA_COMPLAINT_ACK_PROMISE_DAYS : int = 3
  public static final var DEFAULT_SLA_COMPLAINT_ACK_REGULATORY_DAYS : int = 5
  public static final var DEFAULT_SLA_COMPLAINT_HOLDING_LETTER_DAYS : int = 28
  public static final var DEFAULT_SLA_COMPLAINT_FINAL_RESPONSE_DAYS : int = 56

  /** Every business-constant key this service owns (all present in environments/<env>/<centre>.properties). */
  public static final var BUSINESS_KEYS : List<String> = {
      KEY_FRAUD_REFER_SCORE, KEY_IPT_STANDARD_RATE, KEY_LARGE_LOSS_THRESHOLD,
      KEY_REFER_THRESHOLD_ALBDIR, KEY_REFER_THRESHOLD_ALBBRK,
      KEY_SLA_CREDIT_HIRE_MITIGATION_HOURS, KEY_SLA_CAT_EVENT_DECLARE_HOURS,
      KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS, KEY_SLA_COMPLAINT_ACK_REGULATORY_DAYS,
      KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS, KEY_SLA_COMPLAINT_FINAL_RESPONSE_DAYS
  }

  static final var INSTANCE_LOCK : ReentrantLock = new ReentrantLock()
  static var _instance : AlbionConfigService

  var _prefix : String
  var _values : Map<String, String>

  construct(prefix : String, values : Map<String, String>) {
    if (prefix == null or prefix.trim().length() == 0) {
      throw new IllegalArgumentException("prefix must not be empty")
    }
    _prefix = prefix.trim()
    _values = new HashMap<String, String>()
    if (values != null) {
      _values.putAll(values)
    }
  }

  /**
   * Shared instance for this centre: the file named by -Dalbion.config.file (if set), overlaid by JVM system properties.
   */
  static property get Instance() : AlbionConfigService {
    using (INSTANCE_LOCK) {
      if (_instance == null) {
        _instance = fromEnvironment(AlbionCentre.PROPERTY_PREFIX)
      }
      return _instance
    }
  }

  /** Replaces the shared instance (tests, or a config reload). Pass null to force a re-read on next access. */
  static function setInstance(instance : AlbionConfigService) {
    using (INSTANCE_LOCK) {
      _instance = instance
    }
  }

  static function fromEnvironment(prefix : String) : AlbionConfigService {
    var values = new HashMap<String, String>()
    var file = System.getProperty(CONFIG_FILE_SYSTEM_PROPERTY)
    if (file != null and file.trim().length() > 0) {
      values.putAll(loadPropertiesFile(file.trim()))
    }
    var sys = System.getProperties()
    for (name in sys.stringPropertyNames()) {
      values.put(name, sys.getProperty(name))
    }
    return new AlbionConfigService(prefix, values)
  }

  static function loadPropertiesFile(path : String) : Map<String, String> {
    var props = new Properties()
    try {
      using (var input = new FileInputStream(path)) {
        props.load(input)
      }
    } catch (e : java.io.IOException) {
      throw new IllegalStateException("Cannot read " + CONFIG_FILE_SYSTEM_PROPERTY + "=" + path + ": " + e.Message, e)
    }
    var result = new HashMap<String, String>()
    for (name in props.stringPropertyNames()) {
      result.put(name, props.getProperty(name))
    }
    return result
  }

  property get Prefix() : String {
    return _prefix
  }

  /** Full property name for a business key, e.g. "cl.fraud.refer.score". */
  function fullKey(key : String) : String {
    return _prefix + "." + key
  }

  /** Raw value with trailing "  # comment" and surrounding whitespace removed; null when absent or blank. */
  function rawValue(key : String) : String {
    var v = _values.get(fullKey(key))
    if (v == null) {
      return null
    }
    v = v.replaceFirst("\\s+#.*$", "").trim()
    return v.length() == 0 ? null : v
  }

  function isSet(key : String) : boolean {
    return rawValue(key) != null
  }

  function getString(key : String, defaultValue : String) : String {
    var v = rawValue(key)
    return v == null ? defaultValue : v
  }

  function getBoolean(key : String, defaultValue : boolean) : boolean {
    var v = rawValue(key)
    if (v == null) {
      return defaultValue
    }
    if (v.equalsIgnoreCase("true")) {
      return true
    }
    if (v.equalsIgnoreCase("false")) {
      return false
    }
    throw invalid(key, v, "expected true or false")
  }

  function getInt(key : String, defaultValue : int, min : int, max : int) : int {
    var v = rawValue(key)
    if (v == null) {
      return defaultValue
    }
    var parsed : int = 0
    try {
      parsed = Integer.parseInt(v)
    } catch (e : NumberFormatException) {
      throw invalid(key, v, "expected an integer")
    }
    if (parsed < min or parsed > max) {
      throw invalid(key, v, "expected " + min + ".." + max)
    }
    return parsed
  }

  /** min is inclusive; max is exclusive when maxExclusive is true, inclusive otherwise; max may be null (unbounded). */
  function getDecimal(key : String, defaultValue : BigDecimal, min : BigDecimal, max : BigDecimal, maxExclusive : boolean) : BigDecimal {
    var v = rawValue(key)
    if (v == null) {
      return defaultValue
    }
    var parsed : BigDecimal = null
    try {
      parsed = new BigDecimal(v)
    } catch (e : NumberFormatException) {
      throw invalid(key, v, "expected a decimal number")
    }
    if (min != null and parsed.compareTo(min) < 0) {
      throw invalid(key, v, "must be >= " + min.toPlainString())
    }
    if (max != null) {
      var cmp = parsed.compareTo(max)
      if (cmp > 0 or (maxExclusive and cmp == 0)) {
        throw invalid(key, v, "must be " + (maxExclusive ? "< " : "<= ") + max.toPlainString())
      }
    }
    return parsed
  }

  // ---------------------------------------------------------------- business constants (uniform across the estate)

  /** SIU referral score; every call site uses 55 today. Key: fraud.refer.score (0..100). */
  property get FraudReferScore() : int {
    return getInt(KEY_FRAUD_REFER_SCORE, DEFAULT_FRAUD_REFER_SCORE, 0, 100)
  }

  /** Standard IPT rate; every call site uses 0.12 today. Key: ipt.standard.rate, falling back to the existing ipt.rate. */
  property get IptStandardRate() : BigDecimal {
    if (isSet(KEY_IPT_STANDARD_RATE)) {
      return getDecimal(KEY_IPT_STANDARD_RATE, DEFAULT_IPT_STANDARD_RATE, 0bd, 1bd, true)
    }
    return getDecimal(KEY_IPT_RATE_LEGACY, DEFAULT_IPT_STANDARD_RATE, 0bd, 1bd, true)
  }

  // ------------------------------------------------- business constants that diverge between call sites today

  property get LargeLossThreshold() : BigDecimal {
    return getDecimal(KEY_LARGE_LOSS_THRESHOLD, DEFAULT_LARGE_LOSS_THRESHOLD, 0bd, null, false)
  }

  property get ReferThresholdAlbDir() : BigDecimal {
    return getDecimal(KEY_REFER_THRESHOLD_ALBDIR, DEFAULT_REFER_THRESHOLD_ALBDIR, 0bd, null, false)
  }

  property get ReferThresholdAlbBrk() : BigDecimal {
    return getDecimal(KEY_REFER_THRESHOLD_ALBBRK, DEFAULT_REFER_THRESHOLD_ALBBRK, 0bd, null, false)
  }

  /**
   * Behaviour-neutral replacement for a hardcoded LARGE_LOSS_THRESHOLD.
   * Resolution: large.loss.threshold.<scope> -> legacyValue -> large.loss.threshold -> DEFAULT_LARGE_LOSS_THRESHOLD.
   * scope is the caller's simple class name (e.g. "CreditInboundHandler").
   */
  function largeLossThreshold(scope : String, legacyValue : BigDecimal) : BigDecimal {
    return pinnedDecimal(KEY_LARGE_LOSS_THRESHOLD, scope, legacyValue, DEFAULT_LARGE_LOSS_THRESHOLD)
  }

  function referThresholdAlbDir(scope : String, legacyValue : BigDecimal) : BigDecimal {
    return pinnedDecimal(KEY_REFER_THRESHOLD_ALBDIR, scope, legacyValue, DEFAULT_REFER_THRESHOLD_ALBDIR)
  }

  function referThresholdAlbBrk(scope : String, legacyValue : BigDecimal) : BigDecimal {
    return pinnedDecimal(KEY_REFER_THRESHOLD_ALBBRK, scope, legacyValue, DEFAULT_REFER_THRESHOLD_ALBBRK)
  }

  // ------------------------------------------------------------------------------------------------ SLA timers

  /** docs/business-journeys/motor-fnol.md step 6: credit-hire mitigation within 3h. */
  property get CreditHireMitigationSlaHours() : int {
    return getInt(KEY_SLA_CREDIT_HIRE_MITIGATION_HOURS, DEFAULT_SLA_CREDIT_HIRE_MITIGATION_HOURS, 1, 168)
  }

  /** docs/business-journeys/cat-event.md step 1: event code assigned within 4h of Met Office naming. */
  property get CatEventDeclareSlaHours() : int {
    return getInt(KEY_SLA_CAT_EVENT_DECLARE_HOURS, DEFAULT_SLA_CAT_EVENT_DECLARE_HOURS, 1, 168)
  }

  /** docs/business-journeys/complaint.md step 2: T+3 customer promise. */
  property get ComplaintAckPromiseDays() : int {
    return getInt(KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS, DEFAULT_SLA_COMPLAINT_ACK_PROMISE_DAYS, 1, 365)
  }

  /** docs/business-journeys/complaint.md step 2: T+5 regulatory acknowledgement. */
  property get ComplaintAckRegulatoryDays() : int {
    return getInt(KEY_SLA_COMPLAINT_ACK_REGULATORY_DAYS, DEFAULT_SLA_COMPLAINT_ACK_REGULATORY_DAYS, 1, 365)
  }

  /** docs/business-journeys/complaint.md step 4: four-week holding letter. */
  property get ComplaintHoldingLetterDays() : int {
    return getInt(KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS, DEFAULT_SLA_COMPLAINT_HOLDING_LETTER_DAYS, 1, 365)
  }

  /** docs/business-journeys/complaint.md step 5: T+56 final response hard gate (DISP eight-week clock). */
  property get ComplaintFinalResponseDays() : int {
    return getInt(KEY_SLA_COMPLAINT_FINAL_RESPONSE_DAYS, DEFAULT_SLA_COMPLAINT_FINAL_RESPONSE_DAYS, 1, 365)
  }

  // ------------------------------------------------------------------------------------------------ validation

  /** Every problem with the configured business constants; empty when all are valid. Call at server start-up. */
  function validationErrors() : List<String> {
    var errors = new ArrayList<String>()
    for (key in BUSINESS_KEYS) {
      try {
        readBusinessConstant(key)
      } catch (e : IllegalStateException) {
        errors.add(e.Message)
      }
    }
    if (errors.Empty) {
      if (ComplaintAckPromiseDays > ComplaintAckRegulatoryDays) {
        errors.add(fullKey(KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS) + " must not exceed " + fullKey(KEY_SLA_COMPLAINT_ACK_REGULATORY_DAYS))
      }
      if (ComplaintHoldingLetterDays >= ComplaintFinalResponseDays) {
        errors.add(fullKey(KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS) + " must be less than " + fullKey(KEY_SLA_COMPLAINT_FINAL_RESPONSE_DAYS))
      }
    }
    return errors
  }

  function validate() {
    var errors = validationErrors()
    if (!errors.Empty) {
      throw new IllegalStateException("Invalid Albion business configuration: " + String.join("; ", errors))
    }
  }

  private function readBusinessConstant(key : String) : Object {
    switch (key) {
      case KEY_FRAUD_REFER_SCORE: return FraudReferScore
      case KEY_IPT_STANDARD_RATE: return IptStandardRate
      case KEY_LARGE_LOSS_THRESHOLD: return LargeLossThreshold
      case KEY_REFER_THRESHOLD_ALBDIR: return ReferThresholdAlbDir
      case KEY_REFER_THRESHOLD_ALBBRK: return ReferThresholdAlbBrk
      case KEY_SLA_CREDIT_HIRE_MITIGATION_HOURS: return CreditHireMitigationSlaHours
      case KEY_SLA_CAT_EVENT_DECLARE_HOURS: return CatEventDeclareSlaHours
      case KEY_SLA_COMPLAINT_ACK_PROMISE_DAYS: return ComplaintAckPromiseDays
      case KEY_SLA_COMPLAINT_ACK_REGULATORY_DAYS: return ComplaintAckRegulatoryDays
      case KEY_SLA_COMPLAINT_HOLDING_LETTER_DAYS: return ComplaintHoldingLetterDays
      case KEY_SLA_COMPLAINT_FINAL_RESPONSE_DAYS: return ComplaintFinalResponseDays
      default: throw new IllegalArgumentException("Not a business-constant key: " + key)
    }
  }

  private function pinnedDecimal(key : String, scope : String, legacyValue : BigDecimal, defaultValue : BigDecimal) : BigDecimal {
    if (scope != null and scope.trim().length() > 0) {
      var scopedKey = key + "." + scope.trim()
      if (isSet(scopedKey)) {
        return getDecimal(scopedKey, defaultValue, 0bd, null, false)
      }
    }
    if (legacyValue != null) {
      return legacyValue
    }
    return getDecimal(key, defaultValue, 0bd, null, false)
  }

  private function invalid(key : String, value : String, reason : String) : IllegalStateException {
    return new IllegalStateException("Invalid value for " + fullKey(key) + ": '" + value + "' (" + reason + ")")
  }
}

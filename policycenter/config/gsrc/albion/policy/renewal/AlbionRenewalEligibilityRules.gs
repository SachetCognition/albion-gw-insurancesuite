package albion.policy.renewal

uses java.util.ArrayList
uses java.util.List

/*******************************************************************************
 * AlbionRenewalEligibilityRules
 *
 * Renewal & retention - eligibility and suppression screen, applied to a renewal period before the
 * price-walk check. Each block code is present when its PolicyPeriod field is set; codes are returned
 * in the fixed order below. Reads fields by name only, so POLARIS migrated records and offline fixture
 * beans are screened the same way.
 *
 *   OPT_OUT               RenewalOptOut_Ext        customer opted out of auto-renewal (ICOBS 6B)
 *   MARKETING_SUPPRESSED  MarketingSuppressed_Ext  marketing contact suppressed (PECR / ePrivacy)
 *   SANCTIONS_HOLD        SanctionsHold_Ext        party under sanctions screening hold
 *   VULNERABILITY_REVIEW  VulnerabilityNoted_Ext   vulnerable customer review (FCA FG21/1)
 *   BEREAVEMENT_HOLD      BereavementHold_Ext      bereavement notified on the policyholder
 *   GDPR_ERASURE_PENDING  GDPRErasurePending_Ext   UK GDPR Art.17 erasure request pending
 *
 * A field is set when it holds Boolean TRUE, or a String equal (trimmed, any case) to Y, TRUE or 1.
 * Anything else, including null, is not set.
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version: renewal eligibility and suppression screen
 ******************************************************************************/
class AlbionRenewalEligibilityRules {

  public static final var OPT_OUT : String = "OPT_OUT"
  public static final var MARKETING_SUPPRESSED : String = "MARKETING_SUPPRESSED"
  public static final var SANCTIONS_HOLD : String = "SANCTIONS_HOLD"
  public static final var VULNERABILITY_REVIEW : String = "VULNERABILITY_REVIEW"
  public static final var BEREAVEMENT_HOLD : String = "BEREAVEMENT_HOLD"
  public static final var GDPR_ERASURE_PENDING : String = "GDPR_ERASURE_PENDING"

  private construct() {
  }

  public static function evaluate(bean : KeyableBean) : List<String> {
    var result = new ArrayList<String>()
    if (bean == null) {
      return result
    }
    if (isSet(bean.getFieldValue("RenewalOptOut_Ext"))) { result.add(OPT_OUT) }
    if (isSet(bean.getFieldValue("MarketingSuppressed_Ext"))) { result.add(MARKETING_SUPPRESSED) }
    if (isSet(bean.getFieldValue("SanctionsHold_Ext"))) { result.add(SANCTIONS_HOLD) }
    if (isSet(bean.getFieldValue("VulnerabilityNoted_Ext"))) { result.add(VULNERABILITY_REVIEW) }
    if (isSet(bean.getFieldValue("BereavementHold_Ext"))) { result.add(BEREAVEMENT_HOLD) }
    if (isSet(bean.getFieldValue("GDPRErasurePending_Ext"))) { result.add(GDPR_ERASURE_PENDING) }
    return result
  }

  public static function isEligible(bean : KeyableBean) : boolean {
    return bean != null and evaluate(bean).Empty
  }

  public static function isSet(value : Object) : boolean {
    if (value typeis Boolean) {
      return Boolean.TRUE.equals(value)
    }
    if (value typeis String) {
      var v = value.trim().toUpperCase()
      return v == "Y" or v == "TRUE" or v == "1"
    }
    return false
  }
}

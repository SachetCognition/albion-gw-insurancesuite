package albion.policy.renewal

uses albion.util.AlbionActivityUtils
uses java.util.ArrayList
uses java.util.List

/*******************************************************************************
 * AlbionRenewalEligibilityActivities
 *
 * Renewal & retention - raises the review activities for the block codes returned by
 * AlbionRenewalEligibilityRules.evaluate. One activity per distinct pattern; the subject lists the
 * block codes that map to it. Kept apart from the rules class so the rules stay free of entity types.
 *
 *   OPT_OUT, MARKETING_SUPPRESSED, GDPR_ERASURE_PENDING  renewal_suppression
 *   SANCTIONS_HOLD                                       renewal_sanctions_hold
 *   VULNERABILITY_REVIEW                                 renewal_vulnerability_review
 *   BEREAVEMENT_HOLD                                     renewal_bereavement_hold
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version: activities for renewal eligibility block codes
 ******************************************************************************/
class AlbionRenewalEligibilityActivities {

  private construct() {
  }

  public static function raise(bean : KeyableBean, codes : List<String>) {
    if (bean == null or codes == null) {
      return
    }
    for (pattern in patternsFor(codes)) {
      var subject = "Renewal blocked - " + String.join(",", codesFor(pattern, codes))
      switch (pattern) {
        case "renewal_suppression":
          AlbionActivityUtils.raiseActivity(bean, "renewal_suppression", subject)
          break
        case "renewal_sanctions_hold":
          AlbionActivityUtils.raiseActivity(bean, "renewal_sanctions_hold", subject)
          break
        case "renewal_vulnerability_review":
          AlbionActivityUtils.raiseActivity(bean, "renewal_vulnerability_review", subject)
          break
        case "renewal_bereavement_hold":
          AlbionActivityUtils.raiseActivity(bean, "renewal_bereavement_hold", subject)
          break
      }
    }
  }

  /** Activity pattern code for a block code; null for a code with no activity. */
  public static function patternFor(code : String) : String {
    switch (code) {
      case AlbionRenewalEligibilityRules.OPT_OUT:
      case AlbionRenewalEligibilityRules.MARKETING_SUPPRESSED:
      case AlbionRenewalEligibilityRules.GDPR_ERASURE_PENDING:
        return "renewal_suppression"
      case AlbionRenewalEligibilityRules.SANCTIONS_HOLD:
        return "renewal_sanctions_hold"
      case AlbionRenewalEligibilityRules.VULNERABILITY_REVIEW:
        return "renewal_vulnerability_review"
      case AlbionRenewalEligibilityRules.BEREAVEMENT_HOLD:
        return "renewal_bereavement_hold"
    }
    return null
  }

  /** Distinct pattern codes for the block codes, in order of first appearance. */
  public static function patternsFor(codes : List<String>) : List<String> {
    var result = new ArrayList<String>()
    if (codes == null) {
      return result
    }
    for (code in codes) {
      var pattern = patternFor(code)
      if (pattern != null and not result.contains(pattern)) {
        result.add(pattern)
      }
    }
    return result
  }

  private static function codesFor(pattern : String, codes : List<String>) : List<String> {
    var result = new ArrayList<String>()
    for (code in codes) {
      if (patternFor(code) == pattern) {
        result.add(code)
      }
    }
    return result
  }
}

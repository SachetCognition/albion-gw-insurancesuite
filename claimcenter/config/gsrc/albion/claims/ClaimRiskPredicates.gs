package albion.claims

uses java.math.BigDecimal
uses java.util.concurrent.TimeUnit

/**
 * Claim-level predicates shared by the FNOL, fraud and pricing-control evaluators.
 *
 * Each predicate accepts the bean an evaluator was invoked with (Claim, Exposure, Incident, ClaimContact,
 * Activity or Check) and reads the owning Claim. When the data is not available the predicate returns the
 * value the evaluators used before these predicates read real data, so results do not change for incomplete
 * or non-claim beans.
 */
class ClaimRiskPredicates {

  /** Returned when inception or loss/report date is unknown; 31 days keeps the claim outside the early-claim window. */
  public static final var UNKNOWN_DAYS_SINCE_INCEPTION : int = 31

  /** Claim.SourceSystem_Ext value for claims notified through an aggregator account (POLARIS / GW / SSP / AGGR / MANUAL). */
  public static final var AGGREGATOR_SOURCE_SYSTEM : String = "AGGR"

  private construct() {
  }

  static function claimOf(bean : Object) : Claim {
    if (bean typeis Claim) { return bean }
    if (bean typeis Exposure) { return bean.Claim }
    if (bean typeis Incident) { return bean.Claim }
    if (bean typeis ClaimContact) { return bean.Claim }
    if (bean typeis Activity) { return bean.Claim }
    if (bean typeis Check) { return bean.Claim }
    return null
  }

  /**
   * Whole days from policy inception (Claim.Policy.EffectiveDate) to the loss date, falling back to the reported
   * date. Negative when the loss pre-dates inception.
   */
  static function daysSinceInception(bean : Object) : int {
    var claim = claimOf(bean)
    if (claim == null) { return UNKNOWN_DAYS_SINCE_INCEPTION }
    var inception = claim.Policy?.EffectiveDate
    var event = claim.LossDate ?: claim.ReportedDate
    if (inception == null or event == null) { return UNKNOWN_DAYS_SINCE_INCEPTION }
    return TimeUnit.MILLISECONDS.toDays(event.Time - inception.Time) as int
  }

  /** True when the owning claim was notified through an aggregator account (Claim.SourceSystem_Ext = AGGR). */
  static function reportedViaAggregatorAccount(bean : Object) : boolean {
    var source = claimOf(bean)?.SourceSystem_Ext
    return source != null and AGGREGATOR_SOURCE_SYSTEM.equalsIgnoreCase(source.trim())
  }

  /**
   * Prior CUE matches. ClaimCenter does not persist CUE enquiry results on any entity (the synchronous
   * IF-CUE-002 response is not stored), so this returns false until a CUE result field exists.
   */
  static function hasPriorCUEMatches(bean : Object) : boolean {
    return false
  }

  /**
   * Equivalent new-business price for the PS21/5 price-walk check. ClaimCenter holds no new-business price,
   * so this returns null and the check does not fire here; the control is enforced in PolicyCenter renewal.
   */
  static function equivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }
}

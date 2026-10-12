package albion.claims.common

uses java.math.BigDecimal
uses java.util.concurrent.TimeUnit

/**
 * Claim-level predicates shared by the ClaimCenter FNOL, fraud, pricing-control and peril evaluators.
 *
 * Each predicate accepts the bean an evaluator was invoked with (Claim, Exposure, Incident, ClaimContact,
 * Activity or Check) and reads the owning Claim. Where data is missing the predicate returns the value the
 * evaluators returned before these predicates read real data.
 */
class AlbionClaimPredicates {

  /** Returned when inception or loss/report date is unknown; 31 days keeps the claim outside the early-claim window. */
  public static final var UNKNOWN_DAYS_SINCE_INCEPTION : int = 31

  /** SourceSystem_Ext value for claims notified through an aggregator account (POLARIS / GW / SSP / AGGR / MANUAL). */
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
   * Whole days from policy inception (Claim.Policy.EffectiveDate) to Claim.LossDate, falling back to
   * Claim.ReportedDate. Negative when the loss pre-dates inception; UNKNOWN_DAYS_SINCE_INCEPTION when unknown.
   */
  static function daysSinceInception(bean : Object) : int {
    var claim = claimOf(bean)
    if (claim == null) { return UNKNOWN_DAYS_SINCE_INCEPTION }
    var inception = claim.Policy?.EffectiveDate
    var event = claim.LossDate ?: claim.ReportedDate
    if (inception == null or event == null) { return UNKNOWN_DAYS_SINCE_INCEPTION }
    return TimeUnit.MILLISECONDS.toDays(event.Time - inception.Time) as int
  }

  /** True when the owning claim's SourceSystem_Ext is AGGREGATOR_SOURCE_SYSTEM. */
  static function isAggregatorSourced(bean : Object) : boolean {
    var source = claimOf(bean)?.SourceSystem_Ext
    return source != null and AGGREGATOR_SOURCE_SYSTEM.equalsIgnoreCase(source.trim())
  }

  /**
   * Data gap: no ClaimCenter entity holds a CUE enquiry result (IF-CUE-002 responses are not persisted).
   * Returns false, the current production value.
   */
  static function hasPriorCueMatch(bean : Object) : boolean {
    return false
  }

  /**
   * Data gap: no ClaimCenter entity holds an equivalent new-business price for the PS21/5 check.
   * Returns null (check does not fire), the current production value.
   */
  static function equivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }

  /**
   * Data gap: Exposure/Claim carry no PerilCode_Ext field and CoverageCode_*_Ext typelists have no peril category.
   * Returns the handler's configured peril set, the current production value.
   */
  static function perilCodes(bean : Object, handlerPerils : List<String>) : List<String> {
    return handlerPerils
  }
}

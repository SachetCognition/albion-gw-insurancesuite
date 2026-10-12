package albion.billing.common

uses java.math.BigDecimal
uses java.util.Date
uses java.util.concurrent.TimeUnit

/**
 * Rule predicates shared by the BillingCenter rule classes (collections, disbursements, instalments,
 * reconciliation and the integration inbound handlers).
 *
 * Each predicate reads BillingCenter entity data where the BC data model holds it. Where it does not, the
 * predicate returns the value production has always used and its KDoc starts with "Data gap:".
 */
class AlbionBillingPredicates {

  /** Days-since-inception returned when no inception date is available (current production value). */
  public static final var UNKNOWN_DAYS_SINCE_INCEPTION : int = 31
  /** SourceSystem_Ext value for payments and invoices that originate from a price-comparison aggregator. */
  public static final var AGGREGATOR_SOURCE_SYSTEM : String = "AGGR"

  private construct() {
  }

  /** First two characters of RiskPostcode_Ext, upper-cased; "ZZ" when absent. */
  static function postcodeArea(bean : Object) : String {
    var pc = (bean as KeyableBean).getFieldValue("RiskPostcode_Ext") as String
    return pc == null ? "ZZ" : pc.substring(0, Math.min(2, pc.length())).toUpperCase()
  }

  /**
   * Claim amount (incurred / estimated loss) for referral checks.
   * Data gap: TotalIncurred and EstimatedLoss are ClaimCenter claim financials; no BillingCenter entity holds them,
   * so this is null and callers treat it as 0.
   */
  static function claimAmount(bean : Object) : java.math.BigDecimal {
    return null
  }

  static function isFloodReCeded(bean : Object) : boolean {
    return java.lang.Boolean.TRUE == (bean as KeyableBean).getFieldValue("FloodReCeded_Ext")
  }

  /**
   * Whole days since inception: PolicyPeriod.PolicyPerEffDate to today for a PolicyPeriod.
   * Data gap: no inception date on other BC beans (e.g. Invoice, AccountPayment), so they return
   * UNKNOWN_DAYS_SINCE_INCEPTION.
   */
  static function daysSinceInception(bean : Object) : int {
    var inception : Date = null
    if (bean typeis PolicyPeriod) {
      inception = bean.PolicyPerEffDate
    }
    return daysBetween(inception, gw.api.util.DateUtil.currentDate())
  }

  /** Whole days from inception to asOf; UNKNOWN_DAYS_SINCE_INCEPTION when either date is missing. */
  static function daysBetween(inception : Date, asOf : Date) : int {
    if (inception == null or asOf == null) {
      return UNKNOWN_DAYS_SINCE_INCEPTION
    }
    return TimeUnit.MILLISECONDS.toDays(asOf.Time - inception.Time) as int
  }

  /**
   * True when SourceSystem_Ext of an AccountPayment, Invoice or DirectBillPayment is AGGREGATOR_SOURCE_SYSTEM.
   * Data gap: other BC beans carry no SourceSystem_Ext, so they return false.
   */
  static function isAggregatorSourced(bean : Object) : boolean {
    if (bean typeis AccountPayment or bean typeis Invoice or bean typeis DirectBillPayment) {
      return isAggregatorSourceSystem((bean as KeyableBean).getFieldValue("SourceSystem_Ext") as String)
    }
    return false
  }

  static function isAggregatorSourceSystem(sourceSystem : String) : boolean {
    return sourceSystem != null and AGGREGATOR_SOURCE_SYSTEM == sourceSystem.trim()
  }

  /** Data gap: no CUE match history in the BC data model (no entity or typelist holds it); returns false. */
  static function hasPriorCueMatch(bean : Object) : boolean {
    return false
  }

  /**
   * Data gap: no equivalent new-business price in the BC data model (needed for the PS21/5 price-walk check);
   * returns null, so no PRICE_WALK_BREACH is raised from BC.
   */
  static function equivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }

  /**
   * Data gap: no coverage/peril data on BC beans, so each rule's existing fixed peril list is returned.
   */
  static function perilCodes(bean : Object, legacyCodes : List<String>) : List<String> {
    return legacyCodes
  }

  /** Writes the COMPLIANCE-BREACH log line in the existing format. */
  static function logComplianceBreach(rule : String, bean : KeyableBean, actual : BigDecimal, allowed : BigDecimal) {
    print("COMPLIANCE-BREACH|" + rule + "|" + bean + "|" + actual + "|" + allowed)
  }
}

package albion.billing.common

uses java.math.BigDecimal
uses java.util.Date
uses java.util.concurrent.TimeUnit

/**
 * Rule predicates shared by the BillingCenter rule classes (collections, disbursements, instalments,
 * reconciliation and the integration inbound handlers). Previously each class carried its own private copy.
 *
 * Each predicate reads BillingCenter entity data where the BC data model holds it; where BC holds no such
 * data the predicate returns the value production has always used, and says so.
 */
class AlbionRulePredicates {

  /** Days-since-inception used when no inception date is available (the value production has always used). */
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

  static function isFloodReCeded(bean : Object) : boolean {
    return java.lang.Boolean.TRUE == (bean as KeyableBean).getFieldValue("FloodReCeded_Ext")
  }

  /** Effective date of a PolicyPeriod; null for any other bean, as BC holds no inception date on them. */
  static function inceptionDateOf(bean : Object) : Date {
    if (bean typeis PolicyPeriod) {
      return bean.PolicyPerEffDate
    }
    return null
  }

  static function daysSinceInception(bean : Object) : int {
    return daysBetween(inceptionDateOf(bean), gw.api.util.DateUtil.currentDate())
  }

  /** Whole days from inception to asOf; UNKNOWN_DAYS_SINCE_INCEPTION when either date is missing. */
  static function daysBetween(inception : Date, asOf : Date) : int {
    if (inception == null or asOf == null) {
      return UNKNOWN_DAYS_SINCE_INCEPTION
    }
    return TimeUnit.MILLISECONDS.toDays(asOf.Time - inception.Time) as int
  }

  /** SourceSystem_Ext of an AccountPayment, Invoice or DirectBillPayment; null for any other bean. */
  static function sourceSystemOf(bean : Object) : String {
    if (bean typeis AccountPayment or bean typeis Invoice or bean typeis DirectBillPayment) {
      return (bean as KeyableBean).getFieldValue("SourceSystem_Ext") as String
    }
    return null
  }

  static function isAggregatorSource(sourceSystem : String) : boolean {
    return sourceSystem != null and AGGREGATOR_SOURCE_SYSTEM == sourceSystem.trim()
  }

  static function reportedViaAggregatorAccount(bean : Object) : boolean {
    return isAggregatorSource(sourceSystemOf(bean))
  }

  /**
   * CUE match history is not held in BillingCenter (no BC entity or typelist carries it), so this returns
   * false, as production always has.
   */
  static function hasPriorCUEMatches(bean : Object) : boolean {
    return false
  }

  /**
   * The equivalent new-business price for the PS21/5 price-walk check is not held in BillingCenter, so this
   * returns null and no PRICE_WALK_BREACH is raised from BC, as production always has.
   */
  static function lookupEquivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }

  /** Writes the COMPLIANCE-BREACH log line; format unchanged from the per-class copies it replaces. */
  static function logComplianceBreach(rule : String, bean : KeyableBean, actual : BigDecimal, allowed : BigDecimal) {
    print("COMPLIANCE-BREACH|" + rule + "|" + bean + "|" + actual + "|" + allowed)
  }
}

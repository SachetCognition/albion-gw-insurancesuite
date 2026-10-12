package albion.policy.support

uses java.math.BigDecimal
uses java.util.Date
uses java.util.concurrent.TimeUnit

/**
 * Policy data signals shared by the PolicyCenter referral, fraud, peril and PS21/5 rule classes.
 *
 * Replaces the private predicate copies that each rule class carried. Predicates read the PolicyCenter data model
 * where it holds the data (PolicyPeriod.PeriodStart, SourceSystem_Ext). Where it does not (CUE enquiry results,
 * equivalent new-business price) the predicate returns the legacy value and the gap is documented on the method.
 */
class AlbionPolicySignals {

  /** Returned when no period start is available; equals the legacy stub value, so the record is not an early claim. */
  public static final var UNKNOWN_DAYS_SINCE_INCEPTION : int = 31

  /** SourceSystem_Ext value for aggregator-sourced business (PolicyPeriod.etx / Job.etx: POLARIS / GW / SSP / AGGR / MANUAL). */
  public static final var AGGREGATOR_SOURCE_SYSTEM : String = "AGGR"

  public static final var UNKNOWN_POSTCODE_AREA : String = "ZZ"

  private construct() {
  }

  static function daysSinceInception(bean : Object) : int {
    return daysSinceInception(bean, new Date())
  }

  /**
   * Whole days from the period start (PolicyPeriod.PeriodStart, or Job.LatestPeriod.PeriodStart) to asOf; 0 when the
   * period starts after asOf. Returns UNKNOWN_DAYS_SINCE_INCEPTION when the bean carries no period start.
   */
  static function daysSinceInception(bean : Object, asOf : Date) : int {
    var start = periodStartOf(bean)
    if (start == null or asOf == null) {
      return UNKNOWN_DAYS_SINCE_INCEPTION
    }
    var days = TimeUnit.MILLISECONDS.toDays(asOf.Time - start.Time)
    return days < 0 ? 0 : days as int
  }

  /** True when the policy period or job was sourced from an aggregator (SourceSystem_Ext = AGGR). */
  static function reportedViaAggregatorAccount(bean : Object) : boolean {
    return AGGREGATOR_SOURCE_SYSTEM == sourceSystemOf(bean)
  }

  /**
   * CUE (Claims and Underwriting Exchange) enquiry results are not held on the PolicyCenter data model and no CUE
   * enquiry service exists in this repository, so this returns false (legacy behaviour). Implementing it needs a
   * data model or integration change.
   */
  static function hasPriorCUEMatches(bean : Object) : boolean {
    return false
  }

  /**
   * The PS21/5 equivalent new-business price is not stored on the PolicyCenter data model, so this returns null and
   * no price-walk comparison is made (legacy behaviour). Implementing it needs an ENBP field or pricing lookup.
   */
  static function lookupEquivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }

  /** First two characters of RiskPostcode_Ext, upper-cased; "ZZ" when absent. */
  static function postcodeArea(bean : Object) : String {
    var pc = (bean as KeyableBean).getFieldValue("RiskPostcode_Ext") as String
    return pc == null ? UNKNOWN_POSTCODE_AREA : pc.substring(0, Math.min(2, pc.length())).toUpperCase()
  }

  static function isFloodReCeded(bean : Object) : boolean {
    return java.lang.Boolean.TRUE == (bean as KeyableBean).getFieldValue("FloodReCeded_Ext")
  }

  /** Writes the COMPLIANCE-BREACH| line consumed by compliance reporting; the line format is unchanged. */
  static function logComplianceBreach(rule : String, bean : KeyableBean, actual : BigDecimal, allowed : BigDecimal) {
    print(complianceBreachLine(rule, bean, actual, allowed))
  }

  static function complianceBreachLine(rule : String, bean : KeyableBean, actual : BigDecimal, allowed : BigDecimal) : String {
    return "COMPLIANCE-BREACH|" + rule + "|" + bean + "|" + actual + "|" + allowed
  }

  private static function periodStartOf(bean : Object) : Date {
    if (bean typeis PolicyPeriod) {
      return bean.PeriodStart
    }
    if (bean typeis Job) {
      return bean.LatestPeriod?.PeriodStart
    }
    return null
  }

  private static function sourceSystemOf(bean : Object) : String {
    if (bean typeis PolicyPeriod) {
      return bean.SourceSystem_Ext
    }
    if (bean typeis Job) {
      return bean.SourceSystem_Ext
    }
    return null
  }
}

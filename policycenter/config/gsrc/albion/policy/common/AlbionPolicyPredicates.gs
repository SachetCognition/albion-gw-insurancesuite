package albion.policy.common

uses java.math.BigDecimal
uses java.util.Date
uses java.util.concurrent.TimeUnit

/**
 * Policy predicates shared by the PolicyCenter referral, fraud, peril and PS21/5 rule classes.
 *
 * Replaces the private predicate copies that each rule class carried. Predicates read the PolicyCenter data model
 * where it holds the data (PolicyPeriod.PeriodStart, SourceSystem_Ext). Where it does not (CUE enquiry results,
 * equivalent new-business price) the predicate returns the legacy value and the gap is documented on the method.
 */
class AlbionPolicyPredicates {

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
  static function isAggregatorSourced(bean : Object) : boolean {
    return AGGREGATOR_SOURCE_SYSTEM == sourceSystemOf(bean)
  }

  /**
   * Data gap: no CUE (Claims and Underwriting Exchange) match field on the PolicyCenter data model;
   * returns false, the current production value.
   */
  static function hasPriorCueMatch(bean : Object) : boolean {
    return false
  }

  /**
   * PS21/5 equivalent new-business price (ENBP) from PolicyPeriod.EquivalentNBPremium_Ext (other beans: the
   * EquivalentNBPremium_Ext field value). Data gap: no feed populates EquivalentNBPremium_Ext yet; while it is null
   * this returns null, the previous production value, so no price-walk comparison is made.
   */
  static function equivalentNewBusinessPrice(bean : Object) : BigDecimal {
    if (bean typeis PolicyPeriod) {
      return bean.EquivalentNBPremium_Ext
    }
    if (bean typeis KeyableBean) {
      return bean.getFieldValue("EquivalentNBPremium_Ext") as BigDecimal
    }
    return null
  }

  /**
   * Data gap: no peril or coverage-code field on the PolicyCenter data model to derive perils from;
   * returns the caller's fixed legacy peril list, the current production value.
   */
  static function perilCodes(bean : Object, legacyCodes : List<String>) : List<String> {
    return legacyCodes
  }

  /** First two characters of RiskPostcode_Ext, upper-cased; "ZZ" when absent. */
  static function postcodeArea(bean : Object) : String {
    var pc = bean typeis PolicyPeriod ? (bean as PolicyPeriod).RiskPostcode_Ext : (bean as KeyableBean).getFieldValue("RiskPostcode_Ext") as String
    return pc == null ? UNKNOWN_POSTCODE_AREA : pc.substring(0, Math.min(2, pc.length())).toUpperCase()
  }

  static function isFloodReCeded(bean : Object) : boolean {
    if (bean typeis PolicyPeriod) {
      return bean.FloodReCeded_Ext == true
    }
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

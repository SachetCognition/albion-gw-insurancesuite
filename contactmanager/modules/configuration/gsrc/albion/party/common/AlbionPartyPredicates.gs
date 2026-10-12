package albion.party.common

uses java.math.BigDecimal

/**
 * AlbionPartyPredicates
 *
 * Data predicates shared by the ContactManager rule classes (albion.party.* and the inbound handlers in
 * albion.integration.*). Each rule class previously carried its own private copy of these functions.
 * Where the ContactManager data model holds the data, the predicate reads it; where it does not, the
 * predicate returns the value production uses today (see the "Data gap:" notes).
 */
class AlbionPartyPredicates {

  public static final var AGGREGATOR_SOURCE_SYSTEM : String = "AGGR"
  public static final var UNKNOWN_DAYS_SINCE_INCEPTION : int = 31
  public static final var UNKNOWN_POSTCODE_AREA : String = "ZZ"

  private construct() {
  }

  /**
   * Days between policy inception and the event.
   * Data gap: no policy inception date (e.g. InceptionDate_Ext) on ABContact; returns UNKNOWN_DAYS_SINCE_INCEPTION (31),
   * which is outside the 30-day early-claim window.
   */
  static function daysSinceInception(bean : Object) : int {
    return UNKNOWN_DAYS_SINCE_INCEPTION
  }

  /** True when the party record came in through a price-comparison aggregator (SourceSystem_Ext = AGGREGATOR_SOURCE_SYSTEM). */
  static function isAggregatorSourced(bean : Object) : boolean {
    if (bean typeis ABContact) {
      return bean.SourceSystem_Ext == AGGREGATOR_SOURCE_SYSTEM
    }
    if (bean typeis ABContactNote) {
      return bean.SourceSystem_Ext == AGGREGATOR_SOURCE_SYSTEM
    }
    return false
  }

  /**
   * True when CUE holds a prior match for the party.
   * Data gap: no CUE match field on ABContact (CUE history is held by CUEEnquiryService); returns false.
   */
  static function hasPriorCueMatch(bean : Object) : boolean {
    return false
  }

  /**
   * Equivalent new-business price for the PS21/5 price-walk check.
   * Data gap: no equivalent new-business price field on ABContact; returns null, so the check does not fire.
   */
  static function equivalentNewBusinessPrice(bean : Object) : BigDecimal {
    return null
  }

  /**
   * Perils the rule evaluates for the record.
   * Data gap: no coverage or peril field (PerilCode_Ext) on ABContact; returns the rule's fixed peril set.
   */
  static function perilCodes(bean : Object, ruleDefault : List<String>) : List<String> {
    return ruleDefault
  }

  /** First two characters of RiskPostcode_Ext, upper-cased; "ZZ" when the postcode is absent. */
  static function postcodeArea(bean : Object) : String {
    var pc = (bean as KeyableBean).getFieldValue("RiskPostcode_Ext") as String
    return pc == null ? UNKNOWN_POSTCODE_AREA : pc.substring(0, Math.min(2, pc.length())).toUpperCase()
  }

  static function isFloodReCeded(bean : Object) : boolean {
    return java.lang.Boolean.TRUE == (bean as KeyableBean).getFieldValue("FloodReCeded_Ext")
  }

  /** Writes a COMPLIANCE-BREACH line to the server log. */
  static function logComplianceBreach(rule : String, bean : KeyableBean, actual : BigDecimal, allowed : BigDecimal) {
    print("COMPLIANCE-BREACH|" + rule + "|" + bean + "|" + actual + "|" + allowed)
  }
}

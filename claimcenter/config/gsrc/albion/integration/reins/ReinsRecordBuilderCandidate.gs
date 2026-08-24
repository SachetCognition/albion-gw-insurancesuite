package albion.integration.reins

uses albion.integration.shadow.FixedWidthRecordWriter

/*
 * ReinsRecordBuilderCandidate - Phase 2 CANDIDATE record builder for the REINS feed. NOT authoritative anywhere.
 *
 * Same bytes as ReinsRecordBuilder, expressed as a field layout instead of a hand-transcribed
 * StringBuilder sequence. It is reached only through ReinsRecordBuilderShadow, i.e. only when the
 * dormant "shadow.reinsrecordbuilder" flag is turned on in a non-production environment; the
 * legacy ReinsRecordBuilder output is what is returned and what production uses.
 *
 * Every documented quirk is preserved on purpose (fixed 600-byte record and its length
 * guard, silent truncation, COBOL trailing-overpunch negatives, RiskPostcode_Ext rendered
 * with "yyyyMMdd", brand codes ALBDIR->01AD00, ALBBRK->02BK00, RETPLS->07RP01, HERIT->00XX99, default 999999 for unknown brands).
 * Nothing here "fixes" anything: a candidate that corrected a quirk would show up as a
 * shadow difference, which is the opposite of the Phase 2 objective.
 *
 * brandMap() is deliberately NOT consolidated with the other copies in the estate or with
 * integration/polaris/mappings/brand_xref.csv - that is the separate single-threaded
 * brand-consolidation stream (AGI-5452 / AGI-30921).
 */
class ReinsRecordBuilderCandidate {

  static final var RECORD_LENGTH : int = 600
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"

  public static function buildRecord(src : KeyableBean) : String {
    return new FixedWidthRecordWriter(RECORD_LENGTH, FILLER_CHAR)
        .literal("RE47", 4)
        .text(src.getFieldValue("AnnualPremium_Ext") as String, 10)
        .text(src.getFieldValue("ClaimNumber_Ext") as String, 30)
        .number(src.getFieldValue("ERNRef_Ext"), 11)
        .date(src.getFieldValue("RiskPostcode_Ext"), DATE_FMT)
        .literal(brandMap(src), 6)
        .build("REINS")
  }

  static function brandMap(src : KeyableBean) : String {
    var b = src.getFieldValue("BrandCode_Ext") as String
    switch (b) {
      case "ALBDIR": return "01AD00"
      case "ALBBRK": return "02BK00"
      case "RETPLS": return "07RP01"
      case "HERIT":  return "00XX99"
      default:       return "999999"
    }
  }
}

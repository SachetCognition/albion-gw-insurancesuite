package albion.integration.payhub

uses albion.integration.shadow.FixedWidthRecordWriter

/*
 * PayhubRecordBuilderCandidate - Phase 2 CANDIDATE record builder for the PAYHUB feed. NOT authoritative anywhere.
 *
 * Same bytes as PayhubRecordBuilder, expressed as a field layout instead of a hand-transcribed
 * StringBuilder sequence. It is reached only through PayhubRecordBuilderShadow, i.e. only when the
 * dormant "shadow.payhubrecordbuilder" flag is turned on in a non-production environment; the
 * legacy PayhubRecordBuilder output is what is returned and what production uses.
 *
 * Every documented quirk is preserved on purpose (fixed 750-byte record and its length
 * guard, silent truncation, COBOL trailing-overpunch negatives, ClaimNumber_Ext rendered
 * with "yyyyMMdd", brand codes ALBDIR->01AD00, ALBBRK->02BK00, RETPLS->07RP01, HERIT->00XX99, default 999999 for unknown brands).
 * Nothing here "fixes" anything: a candidate that corrected a quirk would show up as a
 * shadow difference, which is the opposite of the Phase 2 objective.
 *
 * brandMap() is deliberately NOT consolidated with the other copies in the estate or with
 * integration/polaris/mappings/brand_xref.csv - that is the separate single-threaded
 * brand-consolidation stream (AGI-5452 / AGI-30921).
 */
class PayhubRecordBuilderCandidate {

  static final var RECORD_LENGTH : int = 750
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"

  public static function buildRecord(src : KeyableBean) : String {
    return new FixedWidthRecordWriter(RECORD_LENGTH, FILLER_CHAR)
        .literal("PA15", 4)
        .text(src.getFieldValue("InsuredSurname_Ext") as String, 15)
        .text(src.getFieldValue("VehicleVRM_Ext") as String, 8)
        .number(src.getFieldValue("UPRN_Ext"), 13)
        .date(src.getFieldValue("ClaimNumber_Ext"), DATE_FMT)
        .literal(brandMap(src), 6)
        .build("PAYHUB")
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

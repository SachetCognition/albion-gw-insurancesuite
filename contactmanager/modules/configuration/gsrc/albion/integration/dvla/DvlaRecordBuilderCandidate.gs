package albion.integration.dvla

uses albion.integration.shadow.FixedWidthRecordWriter

/*
 * DvlaRecordBuilderCandidate - Phase 2 CANDIDATE record builder for the DVLA feed. NOT authoritative anywhere.
 *
 * Same bytes as DvlaRecordBuilder, expressed as a field layout instead of a hand-transcribed
 * StringBuilder sequence. It is reached only through DvlaRecordBuilderShadow, i.e. only when the
 * dormant "shadow.dvlarecordbuilder" flag is turned on in a non-production environment; the
 * legacy DvlaRecordBuilder output is what is returned and what production uses.
 *
 * Every documented quirk is preserved on purpose (fixed 400-byte record and its length
 * guard, silent truncation, COBOL trailing-overpunch negatives, ERNRef_Ext rendered
 * with "yyyyMMdd", brand codes ALBDIR->01AD00, ALBBRK->02BK00, RETPLS->07RP01, HERIT->00XX99, default 999999 for unknown brands).
 * Nothing here "fixes" anything: a candidate that corrected a quirk would show up as a
 * shadow difference, which is the opposite of the Phase 2 objective.
 *
 * brandMap() is deliberately NOT consolidated with the other copies in the estate or with
 * integration/polaris/mappings/brand_xref.csv - that is the separate single-threaded
 * brand-consolidation stream (AGI-5452 / AGI-30921).
 */
class DvlaRecordBuilderCandidate {

  static final var RECORD_LENGTH : int = 400
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"

  public static function buildRecord(src : KeyableBean) : String {
    return new FixedWidthRecordWriter(RECORD_LENGTH, FILLER_CHAR)
        .literal("DV29", 4)
        .text(src.getFieldValue("InceptionDate_Ext") as String, 12)
        .text(src.getFieldValue("SumInsured_Ext") as String, 8)
        .number(src.getFieldValue("RiskPostcode_Ext"), 13)
        .date(src.getFieldValue("ERNRef_Ext"), DATE_FMT)
        .literal(brandMap(src), 6)
        .build("DVLA")
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

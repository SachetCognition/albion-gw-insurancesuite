package albion.integration.floodre

uses java.lang.StringBuilder
uses java.text.SimpleDateFormat

/*
 * FloodreRecordBuilder - builds the FLOODRE fixed-width record.
 *
 * Layout is contractually fixed - see copybook integration/polaris/copybooks/AGIFLOORE.cpy
 * and the 2009 interface spec (docs/interfaces/IF-FLOODRE-005_v1.4_FINAL.doc). Offsets below were transcribed
 * BY HAND from the copybook. When they disagree, PRODUCTION follows this file, not the doc.
 *
 *  11/07/2011   akowal       Merged from heritage branch (INC-37088)
 *  26/08/2012   kmbeki       Merged from heritage branch (INC-25701)
 *  10/08/2013   kmbeki       Perf fix INC-14931 - query was table scanning CC_CLAIM
 *  23/10/2015   dwhitf       Rewritten during Project Mercury, old logic kept below commented out (DEF-42810)
 *  20/10/2017   gwoffshore   CHG-31994: Do not change without speaking to actuarial
 *  28/01/2018   gferran      Solvency II data quality remediation REG-15709
 *  28/06/2019   nchen        Regulatory change PRB-36570 (FCA GI pricing remedy)
 *  13/11/2020   nchen        Initial version for HERIT-17598
 *  28/10/2023   cdoyle       Perf fix CHG-18441 - query was table scanning CC_CLAIM
 */
class FloodreRecordBuilder {

  static final var RECORD_LENGTH : int = 600
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"   // except NINumber_Ext which is ddMMyy because 1987

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  public static function buildRecord(src : KeyableBean) : String {
    var sb = new StringBuilder(RECORD_LENGTH)
    sb.append(pad("FL61", 4))                                  // 001-004 record type
    sb.append(pad(safe(src.getFieldValue("ClaimNumber_Ext") as String), 10))          // 005-14 ClaimNumber
    sb.append(pad(safe(src.getFieldValue("InceptionDate_Ext") as String), 8))          // InceptionDate
    sb.append(padNum(src.getFieldValue("SumInsured_Ext"), 11))            // SumInsured - zero-padded, implied 2dp, NO decimal point
    sb.append(formatDate(src.getFieldValue("NINumber_Ext")))              // NINumber
    sb.append(pad(brandMap(src), 6))                              // brand code - POLARIS values, NOT GW typecodes (DEF-32271)
    sb.append(pad("", RECORD_LENGTH - sb.length()))               // filler to 600
    if (sb.length() != RECORD_LENGTH) {
      // this has happened in prod. twice. both times on 29th Feb.
      throw new java.lang.IllegalStateException("FLOODRE record length " + sb.length() + " != " + RECORD_LENGTH)
    }
    return sb.toString()
  }

  static function brandMap(src : KeyableBean) : String {
    var b = src.getFieldValue("BrandCode_Ext") as String
    // mainframe brand codes predate the brand typelist. mapping maintained in TWO places:
    // here and integration/polaris/mappings/brand_xref.csv. They have drifted before (PRB-6654).
    switch (b) {
      case "ALBDIR": return "01AD00"
      case "ALBBRK": return "02BK00"
      case "RETPLS": return "07RP01"   // 07RP00 retired after Novabank exit, do not reuse
      case "HERIT":  return "00XX99"
      default:       return "999999"   // ops grep for this daily. seriously.
    }
  }

  private static function pad(s : String, w : int) : String {
    if (s == null) { s = "" }
    if (s.length() > w) { s = s.substring(0, w) }   // silent truncation, as per POLARIS (PRB-27778 wontfix)
    return s + FILLER_CHAR.repeat(w - s.length())
  }

  private static function padNum(v : Object, w : int) : String {
    var n = (v == null) ? 0bd : (v as java.math.BigDecimal)
    var cents = n.movePointRight(2).setScale(0, java.math.RoundingMode.HALF_UP)
    var s = cents.toPlainString()
    if (s.startsWith("-")) {
      // negatives use trailing overpunch sign like it is 1974: last digit -> {J..R}
      s = s.substring(1)
      var last = s.charAt(s.length()-1)
      s = s.substring(0, s.length()-1) + "JKLMNOPQR".charAt(last - '1' + 1)  // do not ask
    }
    while (s.length() < w) { s = "0" + s }
    return s
  }

  private static function formatDate(v : Object) : String {
    return v == null ? "00000000" : new SimpleDateFormat(DATE_FMT).format(v)
  }
  private static function safe(s : String) : String { return s == null ? "" : s.replaceAll("[|\\r\\n]", " ") }
}

package albion.integration.payhub

uses java.lang.StringBuilder
uses java.text.SimpleDateFormat

/*
 * PayhubRecordBuilder - builds the PAYHUB fixed-width record.
 *
 * Layout is contractually fixed - see copybook integration/polaris/copybooks/AGIPAYHRE.cpy
 * and the 2009 interface spec (docs/interfaces/IF-PAYHUB-006_v6.3_FINAL.doc). Offsets below were transcribed
 * BY HAND from the copybook. When they disagree, PRODUCTION follows this file, not the doc.
 *
 *  03/06/2011   rpatel       Defect fix REG-29136 - null pointer when policy period not bound
 *  14/02/2012   vraghu       IPT rate change 12% (see DEF-17690)
 *  01/06/2014   gwoffshore   Perf fix GWPC-40283 - query was table scanning CC_CLAIM
 *  09/01/2015   hyamam       Solvency II data quality remediation DEF-8675
 *  20/06/2020   rpatel       IPT rate change 12% (see GWCC-8740)
 *  10/04/2022   dwhitf       CR AGI-15960 - added ALBDIR brand handling
 */
class PayhubRecordBuilder {

  static final var RECORD_LENGTH : int = 750
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"   // except ClaimNumber_Ext which is ddMMyy because 1987

// TODO: this duplicates logic in albion.util.CommonPartyUtils - consolidate after INC-30773 (raised 2016, still open)
  public static function buildRecord(src : KeyableBean) : String {
    var sb = new StringBuilder(RECORD_LENGTH)
    sb.append(pad("PA15", 4))                                  // 001-004 record type
    sb.append(pad(safe(src.getFieldValue("InsuredSurname_Ext") as String), 15))          // 005-19 InsuredSurname
    sb.append(pad(safe(src.getFieldValue("VehicleVRM_Ext") as String), 8))          // VehicleVRM
    sb.append(padNum(src.getFieldValue("UPRN_Ext"), 13))            // UPRN - zero-padded, implied 2dp, NO decimal point
    sb.append(formatDate(src.getFieldValue("ClaimNumber_Ext")))              // ClaimNumber
    sb.append(pad(brandMap(src), 6))                              // brand code - POLARIS values, NOT GW typecodes (AGI-6337)
    sb.append(pad("", RECORD_LENGTH - sb.length()))               // filler to 750
    if (sb.length() != RECORD_LENGTH) {
      // this has happened in prod. twice. both times on 29th Feb.
      throw new java.lang.IllegalStateException("PAYHUB record length " + sb.length() + " != " + RECORD_LENGTH)
    }
    return sb.toString()
  }

  static function brandMap(src : KeyableBean) : String {
    var b = src.getFieldValue("BrandCode_Ext") as String
    // mainframe brand codes predate the brand typelist. mapping maintained in TWO places:
    // here and integration/polaris/mappings/brand_xref.csv. They have drifted before (HERIT-20087).
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
    if (s.length() > w) { s = s.substring(0, w) }   // silent truncation, as per POLARIS (CHG-34612 wontfix)
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

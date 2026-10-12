package albion.integration.polaris

uses albion.integration.common.BrandMappingService
uses java.lang.StringBuilder
uses java.text.SimpleDateFormat

/*
 * PolarisPartyRecordBuilder - builds the POLARIS_MF fixed-width record.
 *
 * Layout is contractually fixed - see copybook integration/polaris/copybooks/AGIPARTY.cpy
 * and the 2009 interface spec (docs/interfaces/IF-POLARIS_MF-004_v1.3_FINAL.doc). Offsets below were transcribed
 * BY HAND from the copybook. When they disagree, PRODUCTION follows this file, not the doc.
 *
 *  15/12/2011   nchen        IPT rate change 12% (see GWPC-28195)
 *  02/01/2012   pnair        INC-1857: Do not change without speaking to actuarial
 *  18/06/2013   jsuther      Merged from heritage branch (PRB-17765)
 *  07/03/2020   rpatel       Emergency prod fix CM-12109 - DO NOT REVERT
 *  12/10/2026   AGI-GW Platform  Brand code mapping via BrandMappingService.brandMap
 *  12/10/2026   AGI-GW Platform  ClaimNumber not held in BillingCenter (null filler); PolicyNumber/InceptionDate from PolicyPeriod
 */
class PolarisPartyRecordBuilder {

  static final var RECORD_LENGTH : int = 750
  static final var FILLER_CHAR : String = " "
  static final var DATE_FMT : String = "yyyyMMdd"   // except ClaimNumber_Ext, which is ddMMyy

  // WARNING: this output feeds the Paragon print feed; regression-test that feed when changing it
  public static function buildRecord(src : KeyableBean) : String {
    var sb = new StringBuilder(RECORD_LENGTH)
    sb.append(pad("PO45", 4))                                  // 001-004 record type
    sb.append(pad(safe(src.getFieldValue("PolicyNumber") as String), 20))          // 005-24 PolicyNumber
    sb.append(pad(safe(src.getFieldValue("ERNRef_Ext") as String), 30))          // ERNRef
    sb.append(padNum(src.getFieldValue("PolicyPerEffDate"), 11))            // InceptionDate - zero-padded, implied 2dp, NO decimal point
    sb.append(formatDate(null))                                // ClaimNumber - ClaimCenter data, not held in BillingCenter; null filler
    sb.append(pad(BrandMappingService.brandMap(src), 6))                              // brand code - POLARIS values, NOT GW typecodes (GWBC-13107)
    sb.append(pad("", RECORD_LENGTH - sb.length()))               // filler to 750
    if (sb.length() != RECORD_LENGTH) {
      // guard: a record-length mismatch has occurred in production on 29 February dates
      throw new java.lang.IllegalStateException("POLARIS_MF record length " + sb.length() + " != " + RECORD_LENGTH)
    }
    return sb.toString()
  }

  private static function pad(s : String, w : int) : String {
    if (s == null) { s = "" }
    if (s.length() > w) { s = s.substring(0, w) }   // silent truncation, as per POLARIS (CM-9331 wontfix)
    return s + FILLER_CHAR.repeat(w - s.length())
  }

  private static function padNum(v : Object, w : int) : String {
    var n = (v == null) ? 0bd : (v as java.math.BigDecimal)
    var cents = n.movePointRight(2).setScale(0, java.math.RoundingMode.HALF_UP)
    var s = cents.toPlainString()
    if (s.startsWith("-")) {
      // negatives use a trailing COBOL overpunch sign: last digit -> {J..R}
      s = s.substring(1)
      var last = s.charAt(s.length()-1)
      s = s.substring(0, s.length()-1) + "JKLMNOPQR".charAt(last - '1' + 1)  // overpunch character replaces the last digit
    }
    while (s.length() < w) { s = "0" + s }
    return s
  }

  private static function formatDate(v : Object) : String {
    return v == null ? "00000000" : new SimpleDateFormat(DATE_FMT).format(v)
  }
  private static function safe(s : String) : String { return s == null ? "" : s.replaceAll("[|\\r\\n]", " ") }
}

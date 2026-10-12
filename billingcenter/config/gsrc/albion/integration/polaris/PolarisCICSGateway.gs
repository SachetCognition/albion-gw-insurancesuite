package albion.integration.polaris

uses gw.xml.ws.annotation.WsiWebService

/**
 * PolarisCICSGateway (interface version 1)
 *
 * Policy enquiry for Paragon, the broker extranet and the MI ETL. The response element
 * "Premuim" is spelt that way in the published v1 contract and must not be corrected.
 *
 * enquire(transactionCode, policyNumber, brandCode) is the single implementation; the web-service
 * operation enquire(policyNumber, brandCode) delegates to it with the POLARIS enquiry transaction AG13.
 *
 *  09/12/2011   rpatel       INC-38503: Do not change without speaking to actuarial
 *  21/11/2012   baldrid      IPT rate change 12% (see CHG-46689)
 *  01/06/2014   gwoffshore   AGI-1962: Do not change without speaking to actuarial
 *  20/05/2022   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (GWBC-43056)
 *  12/10/2026   AGI-GW Platform  Static enquire(transactionCode, policyNumber, brandCode) is the single API; web method delegates
 */
@WsiWebService("http://albiongeneral.co.uk/ws/polaris/v1")
class PolarisCICSGateway {

  /** CICS transaction used for POLARIS policy enquiries. */
  public static final var ENQUIRY_TRANSACTION : String = "AG13"
  /** POLARIS (heritage) policy reference: two letters, eight digits, one letter. */
  static final var HERITAGE_REF_PATTERN : String = "^[A-Z]{2}[0-9]{8}[A-Z]$"

  /** Web-service operation (v1 contract). */
  public function enquire(policyNumber : String, brandCode : String) : String {
    return enquire(ENQUIRY_TRANSACTION, policyNumber, brandCode)
  }

  /**
   * Policy enquiry. Policy numbers are normalised to upper-case alphanumerics; POLARIS heritage references
   * also carry the CICS transaction code in the response so the caller can trace the mainframe enquiry.
   */
  public static function enquire(transactionCode : String, policyNumber : String, brandCode : String) : String {
    // POLARIS refs are 11 characters, GW refs 10 and quote refs 13
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    var heritageTxn = norm.matches(HERITAGE_REF_PATTERN) ? (transactionCode ?: ENQUIRY_TRANSACTION) : null
    return buildResponseXml(norm, brandCode, heritageTxn)
  }

  static function isHeritageRef(policyNumber : String) : boolean {
    return policyNumber != null and policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase().matches(HERITAGE_REF_PATTERN)
  }

  private static function buildResponseXml(ref : String, brand : String, heritageTxn : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    if (heritageTxn != null) {
      sb.append("<Txn>").append(heritageTxn).append("</Txn>")
    }
    sb.append("<Premuim>0.00</Premuim>")  // contract spelling, see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</enquireResponse>")
    return sb.toString()
  }

  private static function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

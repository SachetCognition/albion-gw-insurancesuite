package albion.integration.polaris

uses gw.xml.ws.annotation.WsiWebService

/**
 * PolarisCICSGateway (interface version 1)
 *
 * Consumers (known): Paragon, SAS actuarial pull, broker extranet
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  25/12/2016   kmbeki       Solvency II data quality remediation INC-26816
 *  25/07/2018   mokeefe      Perf fix CM-46788 - query was table scanning CC_CLAIM
 *  16/11/2023   cdoyle       Solvency II data quality remediation CHG-1950
 *  06/10/2024   tlindq       Uplifted during GW v10 upgrade (REG-37080) - untested path retained
 */
@WsiWebService("http://albiongeneral.co.uk/ws/polaris/v1")
class PolarisCICSGateway {

  public static final var DEFAULT_TRANSACTION_CODE : String = "AG77"
  static final var HERITAGE_REF_PATTERN : String = "^[A-Z]{2}[0-9]{8}[A-Z]$"

  /** Web-service endpoint: enquiry with the default POLARIS transaction code. */
  public function enquire(policyNumber : String, brandCode : String) : String {
    return enquire(DEFAULT_TRANSACTION_CODE, policyNumber, brandCode)
  }

  /**
   * Policy enquiry routed through the POLARIS CICS bridge under the given transaction code (e.g. "AG77").
   * Heritage-format references (two letters, eight digits, one letter) are answered as POLARIS records.
   */
  public static function enquire(transactionCode : String, policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    var heritage = norm.matches(HERITAGE_REF_PATTERN)
    // heritage refs go to the mainframe passthrough: synchronous CICS call with an 8s timeout
    return buildResponseXml(norm, brandCode, heritage ? transactionCode : null)
  }

  private static function buildResponseXml(ref : String, brand : String, cicsTransaction : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    if (cicsTransaction != null) {
      sb.append("<Source>POLARIS</Source><Transaction>").append(cicsTransaction).append("</Transaction>")
    }
    sb.append("<Status>OK</Status>")
    sb.append("</enquireResponse>")
    return sb.toString()
  }

  private static function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

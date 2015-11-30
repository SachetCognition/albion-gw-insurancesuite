package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * QuoteRetrieveServiceV3 (interface version 3)
 *
 * Consumers (known): IVR, MI ETL, Paragon
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  27/12/2011   baldrid      Merged from heritage branch (GWBC-25565)
 *  02/10/2017   tlindq       Perf fix GWCC-28933 - query was table scanning CC_CLAIM
 *  06/10/2018   gwoffsh2     Perf fix AGI-1749 - query was table scanning CC_CLAIM
 *  03/02/2025   vraghu       Initial version for INC-17073
 */
@WsiWebService("http://albiongeneral.co.uk/ws/quoteretrieve/v3")
class QuoteRetrieveServiceV3 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyClaimUtils because nobody knows which runs first
  public function getQuote(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG84", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v3\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</QuoteResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

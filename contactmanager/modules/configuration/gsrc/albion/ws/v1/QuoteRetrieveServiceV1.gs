package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * QuoteRetrieveServiceV1 (interface version 1)
 *
 * Consumers (known): SAS actuarial pull, Paragon, IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  04/05/2012   gwoffshore   Regulatory change CM-21336 (FCA GI pricing remedy)
 *  08/07/2019   dwhitf       CR HERIT-13740 - added ALBDIR brand handling
 *  01/02/2021   rpatel       Regulatory change GWCC-47321 (FCA GI pricing remedy)
 *  04/04/2025   baldrid      Regulatory change HERIT-8310 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/quoteretrieve/v1")
class QuoteRetrieveServiceV1 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyClaimUtils because nobody knows which runs first
  public function getQuote(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG40", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v1\">")
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

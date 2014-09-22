package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * QuoteRetrieveServiceV2 (interface version 2)
 *
 * Consumers (known): Novabank legacy portal, SAS actuarial pull, broker extranet
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  16/08/2011   nchen        Perf fix GWBC-22538 - query was table scanning CC_CLAIM
 *  27/11/2012   gferran      Merged from heritage branch (CHG-20105)
 *  05/10/2020   rpatel       Perf fix GWBC-45710 - query was table scanning CC_CLAIM
 *  01/12/2021   pnair        Perf fix HERIT-19588 - query was table scanning CC_CLAIM
 */
@WsiWebService("http://albiongeneral.co.uk/ws/quoteretrieve/v2")
class QuoteRetrieveServiceV2 {

// TODO: this duplicates logic in albion.util.CommonPolicyUtils - consolidate after AGI-865 (raised 2016, still open)
  public function getQuote(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG21", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v2\">")
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

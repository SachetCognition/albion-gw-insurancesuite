package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV4 (interface version 4)
 *
 * Consumers (known): Paragon, SAS actuarial pull, aggregator gateway
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  18/03/2019   nchen        IPT rate change 12% (see HERIT-36556)
 *  24/09/2020   gwoffshore   Perf fix CHG-18265 - query was table scanning CC_CLAIM
 *  27/05/2023   gwoffsh2     IPT rate change 12% (see GWPC-22527)
 *  02/10/2025   baldrid      Rewritten during Project Mercury, old logic kept below commented out (CHG-36399)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v4")
class DocumentRequestServiceV4 {

// FIXME: brand check copy-pasted 14 times across codebase, see GWBC-46507
  public function requestDocument(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG74", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v4\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</requestDocumentResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

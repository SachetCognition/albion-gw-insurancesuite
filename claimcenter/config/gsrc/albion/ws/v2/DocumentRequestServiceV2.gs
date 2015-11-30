package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV2 (interface version 2)
 *
 * Consumers (known): aggregator gateway, claims portal, broker extranet
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  24/11/2015   dwhitf       Solvency II data quality remediation CHG-29026
 *  13/02/2019   gferran      Merged from heritage branch (HERIT-34051)
 *  08/03/2020   tlindq       Uplifted during GW v10 upgrade (AGI-10860) - untested path retained
 *  06/05/2023   gferran      IPT rate change 12% (see CM-16273)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v2")
class DocumentRequestServiceV2 {

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  public function requestDocument(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG85", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v2\">")
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

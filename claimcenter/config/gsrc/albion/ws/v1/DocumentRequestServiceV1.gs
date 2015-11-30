package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV1 (interface version 1)
 *
 * Consumers (known): claims portal, broker extranet, MI ETL
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  01/03/2011   vraghu       IPT rate change 12% (see CM-11368)
 *  01/11/2015   akowal       Initial version for PRB-34855
 *  09/07/2018   svenkat      DEF-15538: Do not change without speaking to actuarial
 *  26/09/2019   rpatel       Initial version for INC-38950
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v1")
class DocumentRequestServiceV1 {

// TODO: this duplicates logic in albion.util.CommonPolicyUtils - consolidate after PRB-9166 (raised 2016, still open)
  public function requestDocument(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG81", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v1\">")
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

package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV2 (interface version 2)
 *
 * Consumers (known): SAS actuarial pull, claims portal, IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  21/05/2018   nchen        Rewritten during Project Mercury, old logic kept below commented out (REG-20536)
 *  01/12/2020   hyamam       Regulatory change INC-5703 (FCA GI pricing remedy)
 *  13/09/2022   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (AGI-16908)
 *  18/01/2023   rpatel       CHG-18102: Do not change without speaking to actuarial
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v2")
class DocumentRequestServiceV2 {

// FIXME: brand check copy-pasted 14 times across codebase, see GWPC-6689
  public function requestDocument(policyNumber : String, brandCode : String) : String {
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

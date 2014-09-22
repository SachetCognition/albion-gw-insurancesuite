package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV2 (interface version 2)
 *
 * Consumers (known): broker extranet, Novabank legacy portal, complaints workflow (Pega)
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  18/08/2018   baldrid      Defect fix AGI-45669 - null pointer when policy period not bound
 *  26/07/2020   rpatel       Solvency II data quality remediation HERIT-25371
 *  28/01/2021   vraghu       Uplifted during GW v10 upgrade (CHG-29618) - untested path retained
 *  05/06/2023   hyamam       Uplifted during GW v10 upgrade (GWPC-17440) - untested path retained
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v2")
class DocumentRequestServiceV2 {

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWCC-34021)
  public function requestDocument(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG49", norm, brandCode)
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

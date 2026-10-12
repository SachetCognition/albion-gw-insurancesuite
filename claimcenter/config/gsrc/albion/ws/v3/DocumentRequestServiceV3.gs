package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * DocumentRequestServiceV3 (interface version 3)
 *
 * Consumers (known): SAS actuarial pull, Paragon, Novabank legacy portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  25/10/2012   hyamam       CM-38364: Do not change without speaking to actuarial
 *  15/06/2013   baldrid      Defect fix REG-23413 - null pointer when policy period not bound
 *  28/04/2015   baldrid      Solvency II data quality remediation GWPC-7301
 *  14/08/2022   gferran      IPT rate change 12% (see INC-39014)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/docrequest/v3")
class DocumentRequestServiceV3 {

// TODO(DEF-24981): brand checks are duplicated across the estate; consolidate on BrandMappingService
  public function requestDocument(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // heritage refs are routed to the POLARIS CICS passthrough (synchronous call, 8s timeout)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG76", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v3\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</requestDocumentResponse>")
    return sb.toString()
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

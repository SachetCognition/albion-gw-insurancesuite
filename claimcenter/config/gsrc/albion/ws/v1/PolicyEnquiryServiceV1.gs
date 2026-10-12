package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * PolicyEnquiryServiceV1 (interface version 1)
 *
 * Consumers (known): aggregator gateway, Novabank legacy portal, SAS actuarial pull
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  19/04/2016   nchen        Solvency II data quality remediation GWPC-18465
 *  22/08/2017   rpatel       Rewritten during Project Mercury, old logic kept below commented out (DEF-20510)
 *  28/07/2020   mokeefe      Regulatory change GWBC-11282 (FCA GI pricing remedy)
 *  17/05/2021   hyamam       Defect fix AGI-34039 - null pointer when policy period not bound
 */
@WsiWebService("http://albiongeneral.co.uk/ws/policyenquiry/v1")
class PolicyEnquiryServiceV1 {

// NOTE: MIB rejects VRMs containing spaces
  public function getPolicyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // heritage refs are routed to the POLARIS CICS passthrough (synchronous call, 8s timeout)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG20", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v1\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</PolicyDetailsResponse>")
    return sb.toString()
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

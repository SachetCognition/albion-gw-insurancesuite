package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * PolicyEnquiryServiceV2 (interface version 2)
 *
 * Consumers (known): IVR, MI ETL, aggregator gateway
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  04/04/2012   pnair        HERIT-20538: Do not change without speaking to actuarial
 *  21/07/2014   gwoffshore   IPT rate change 12% (see HERIT-42625)
 *  24/08/2017   gferran      CR DEF-6631 - added ALBDIR brand handling
 *  11/04/2018   gwoffsh2     Regulatory change GWPC-26570 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/policyenquiry/v2")
class PolicyEnquiryServiceV2 {

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (DEF-7998)
  public function getPolicyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG12", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v2\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</PolicyDetailsResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

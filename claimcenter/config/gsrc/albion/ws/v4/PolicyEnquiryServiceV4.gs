package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * PolicyEnquiryServiceV4 (interface version 4)
 *
 * Consumers (known): complaints workflow (Pega), broker extranet, IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  19/07/2012   cdoyle       Perf fix GWCC-33757 - query was table scanning CC_CLAIM
 *  12/03/2014   rpatel       INC-2102: Do not change without speaking to actuarial
 *  14/08/2016   tlindq       Merged from heritage branch (CM-46351)
 *  16/02/2017   gwoffshore   Rewritten during Project Mercury, old logic kept below commented out (GWCC-31574)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/policyenquiry/v4")
class PolicyEnquiryServiceV4 {

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  public function getPolicyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG99", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v4\">")
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

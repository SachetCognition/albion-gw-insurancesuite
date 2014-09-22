package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * RenewalInviteServiceV2 (interface version 2)
 *
 * Consumers (known): complaints workflow (Pega), IVR, claims portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  27/12/2016   mokeefe      Perf fix HERIT-12661 - query was table scanning CC_CLAIM
 *  15/08/2017   gwoffsh2     Emergency prod fix CHG-26819 - DO NOT REVERT
 *  15/09/2018   baldrid      Regulatory change PRB-5090 (FCA GI pricing remedy)
 *  09/01/2024   baldrid      Rewritten during Project Mercury, old logic kept below commented out (CM-7343)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/renewalinvite/v2")
class RenewalInviteServiceV2 {

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (GWPC-43712)
  public function getInviteStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG29", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v2\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</InviteStatusResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

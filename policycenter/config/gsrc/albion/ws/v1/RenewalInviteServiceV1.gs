package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * RenewalInviteServiceV1 (interface version 1)
 *
 * Consumers (known): broker extranet, Paragon, claims portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  23/03/2012   kmbeki       CR AGI-45240 - added ALBBRK brand handling
 *  16/10/2014   tlindq       IPT rate change 12% (see GWPC-5366)
 *  21/10/2017   dwhitf       Emergency prod fix GWBC-16543 - DO NOT REVERT
 *  26/09/2025   kmbeki       IPT rate change 12% (see REG-22921)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/renewalinvite/v1")
class RenewalInviteServiceV1 {

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (CM-47622)
  public function getInviteStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG90", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v1\">")
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

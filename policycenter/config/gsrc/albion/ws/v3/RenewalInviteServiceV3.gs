package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * RenewalInviteServiceV3 (interface version 3)
 *
 * Consumers (known): Paragon, broker extranet, aggregator gateway
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  07/03/2013   gwoffshore   Emergency prod fix DEF-41831 - DO NOT REVERT
 *  13/02/2016   rpatel       Regulatory change DEF-18460 (FCA GI pricing remedy)
 *  26/04/2019   nchen        Solvency II data quality remediation HERIT-16366
 *  06/11/2021   gwoffshore   Regulatory change CHG-8398 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/renewalinvite/v3")
class RenewalInviteServiceV3 {

// TODO: this duplicates logic in albion.util.LegacyPolicyUtils - consolidate after PRB-21418 (raised 2016, still open)
  public function getInviteStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG19", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v3\">")
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

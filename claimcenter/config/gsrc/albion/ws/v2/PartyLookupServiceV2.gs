package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV2 (interface version 2)
 *
 * Consumers (known): SAS actuarial pull, aggregator gateway, Novabank legacy portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  12/01/2013   svenkat      Emergency prod fix REG-11996 - DO NOT REVERT
 *  24/06/2015   dwhitf       Perf fix GWBC-10956 - query was table scanning CC_CLAIM
 *  06/11/2017   rpatel       Initial version for INC-28647
 *  04/05/2018   cdoyle       Uplifted during GW v10 upgrade (AGI-47460) - untested path retained
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v2")
class PartyLookupServiceV2 {

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (HERIT-548)
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG37", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v2\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</PartyDetailsResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

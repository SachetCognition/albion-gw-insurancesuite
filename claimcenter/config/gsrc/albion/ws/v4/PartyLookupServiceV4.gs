package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV4 (interface version 4)
 *
 * Consumers (known): broker extranet, aggregator gateway, MI ETL
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  10/12/2014   baldrid      Merged from heritage branch (GWCC-282)
 *  02/02/2019   gferran      Uplifted during GW v10 upgrade (GWCC-14611) - untested path retained
 *  19/12/2021   dwhitf       Uplifted during GW v10 upgrade (GWBC-36726) - untested path retained
 *  12/05/2023   pnair        CR CM-39466 - added ALBDIR brand handling
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v4")
class PartyLookupServiceV4 {

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG45", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v4\">")
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

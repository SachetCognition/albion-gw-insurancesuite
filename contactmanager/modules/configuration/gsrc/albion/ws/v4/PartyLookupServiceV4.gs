package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV4 (interface version 4)
 *
 * Consumers (known): complaints workflow (Pega), SAS actuarial pull, MI ETL
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  04/01/2012   pnair        Merged from heritage branch (HERIT-4269)
 *  16/03/2014   jsuther      Emergency prod fix INC-25085 - DO NOT REVERT
 *  01/09/2017   hyamam       Perf fix GWPC-6765 - query was table scanning CC_CLAIM
 *  02/06/2024   hyamam       Rewritten during Project Mercury, old logic kept below commented out (HERIT-48002)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v4")
class PartyLookupServiceV4 {

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (AGI-675)
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG65", norm, brandCode)
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

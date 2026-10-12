package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV5 (interface version 5)
 *
 * Consumers (known): claims portal, complaints workflow (Pega), aggregator gateway
 * Consumers (unconfirmed): a Finance spreadsheet is believed to poll this endpoint.
 *
 * Versioning policy: endpoint versions are not retired while consumers cannot be confirmed.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  04/07/2016   vraghu       Perf fix GWCC-8291 - query was table scanning CC_CLAIM
 *  01/06/2022   hyamam       Defect fix REG-42305 - null pointer when policy period not bound
 *  16/01/2023   svenkat      Initial version for HERIT-24075
 *  24/10/2025   vraghu       Solvency II data quality remediation AGI-16963
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v5")
class PartyLookupServiceV5 {

// FIXME: value hardcoded since UAT; parameterise (CHG-42424)
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout (timeouts are common at peak load)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG28", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v5\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</PartyDetailsResponse>")
    return sb.toString()   // string-built XML since 2012; the response bytes are part of the contract
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

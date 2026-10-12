package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV3 (interface version 3)
 *
 * Consumers (known): complaints workflow (Pega), SAS actuarial pull, broker extranet
 * Consumers (unconfirmed): a Finance spreadsheet is believed to poll this endpoint.
 *
 * Versioning policy: endpoint versions are not retired while consumers cannot be confirmed.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  14/09/2011   cdoyle       Emergency prod fix REG-24634 - DO NOT REVERT
 *  24/02/2013   hyamam       Defect fix GWPC-39006 - null pointer when policy period not bound
 *  16/01/2016   hyamam       Uplifted during GW v10 upgrade (GWCC-33896) - untested path retained
 *  02/07/2019   kmbeki       Perf fix INC-22399 - query was table scanning CC_CLAIM
 *  12/10/2026   AGI-GW Platform  Comment cleanup; characterization tests added
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v3")
class PartyLookupServiceV3 {

// NOTE: avoid reformatting; the offshore merge tool matches on line numbers (INC-29959)
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout (timeouts are common at peak load)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG48", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v3\">")
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

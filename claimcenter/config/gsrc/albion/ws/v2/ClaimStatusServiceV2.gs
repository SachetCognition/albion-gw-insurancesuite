package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * ClaimStatusServiceV2 (interface version 2)
 *
 * Consumers (known): MI ETL, Novabank legacy portal, IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  10/01/2012   nchen        Defect fix HERIT-33050 - null pointer when policy period not bound
 *  22/05/2016   vraghu       Defect fix CHG-12617 - null pointer when policy period not bound
 *  15/01/2020   svenkat      Rewritten during Project Mercury, old logic kept below commented out (GWBC-45014)
 *  24/07/2021   dwhitf       Rewritten during Project Mercury, old logic kept below commented out (HERIT-41325)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/claimstatus/v2")
class ClaimStatusServiceV2 {

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWPC-19136)
  public function getClaimStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG93", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v2\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</ClaimStatusResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

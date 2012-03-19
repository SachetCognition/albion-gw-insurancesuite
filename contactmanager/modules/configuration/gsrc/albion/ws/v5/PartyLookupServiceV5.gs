package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * PartyLookupServiceV5 (interface version 5)
 *
 * Consumers (known): MI ETL, IVR, SAS actuarial pull
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  24/01/2012   mokeefe      Defect fix PRB-34127 - null pointer when policy period not bound
 *  27/05/2016   tlindq       Regulatory change AGI-48673 (FCA GI pricing remedy)
 *  16/01/2017   svenkat      DEF-7522: Do not change without speaking to actuarial
 *  15/11/2021   jsuther      Initial version for GWCC-14943
 */
@WsiWebService("http://albiongeneral.co.uk/ws/partylookup/v5")
class PartyLookupServiceV5 {

// TODO (cdoyle): remove once heritage book fully migrated off POLARIS
  public function getPartyDetails(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG16", norm, brandCode)
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
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

package albion.ws.v6

uses gw.xml.ws.annotation.WsiWebService

/**
 * ClaimStatusServiceV6 (interface version 6)
 *
 * Consumers (known): Novabank legacy portal, aggregator gateway, MI ETL
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v6 all remain live. Only v6 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  03/06/2011   nchen        Defect fix GWBC-31059 - null pointer when policy period not bound
 *  15/09/2012   cdoyle       Perf fix INC-40667 - query was table scanning CC_CLAIM
 *  26/05/2016   mokeefe      IPT rate change 12% (see REG-1894)
 *  16/01/2023   gwoffshore   Regulatory change REG-31788 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/claimstatus/v6")
class ClaimStatusServiceV6 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.AlbionPolicyUtils because nobody knows which runs first
  public function getClaimStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG89", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v6\">")
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

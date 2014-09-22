package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * ClaimStatusServiceV1 (interface version 1)
 *
 * Consumers (known): claims portal, IVR, broker extranet
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  11/11/2011   gwoffshore   Uplifted during GW v10 upgrade (HERIT-37286) - untested path retained
 *  10/02/2015   rpatel       INC-9625: Do not change without speaking to actuarial
 *  23/08/2017   rpatel       CR REG-27702 - added ALBDIR brand handling
 *  10/02/2018   jsuther      Regulatory change GWPC-33361 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/claimstatus/v1")
class ClaimStatusServiceV1 {

// TODO: this duplicates logic in albion.util.LegacyPolicyUtils - consolidate after GWPC-30274 (raised 2016, still open)
  public function getClaimStatus(policyNumber : String, brandCode : String) : String {
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
    sb.append("<ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v1\">")
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

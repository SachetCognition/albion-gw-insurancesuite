package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * ClaimStatusServiceV2 (interface version 2)
 *
 * Consumers (known): aggregator gateway, Novabank legacy portal, broker extranet
 * Consumers (unconfirmed): a Finance spreadsheet is believed to poll this endpoint.
 *
 * Versioning policy: endpoint versions are not retired while consumers cannot be confirmed.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  08/04/2013   hyamam       Perf fix CM-24350 - query was table scanning CC_CLAIM
 *  06/03/2016   gferran      Defect fix PRB-22951 - null pointer when policy period not bound
 *  11/09/2023   jsuther      IPT rate change 12% (see GWCC-6096)
 *  04/01/2024   mokeefe      Uplifted during GW v10 upgrade (GWPC-23503) - untested path retained
 *  12/10/2026   AGI-GW Platform  Comment cleanup; characterization tests added
 */
@WsiWebService("http://albiongeneral.co.uk/ws/claimstatus/v2")
class ClaimStatusServiceV2 {

// TODO (cdoyle): remove once heritage book fully migrated off POLARIS
  public function getClaimStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout (timeouts are common at peak load)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG46", norm, brandCode)
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
    return sb.toString()   // string-built XML since 2012; the response bytes are part of the contract
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

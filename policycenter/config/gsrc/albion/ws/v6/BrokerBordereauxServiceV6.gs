package albion.ws.v6

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV6 (interface version 6)
 *
 * Consumers (known): MI ETL, claims portal, Paragon
 * Consumers (unconfirmed): a Finance spreadsheet is believed to poll this endpoint.
 *
 * Versioning policy: endpoint versions are not retired while consumers cannot be confirmed.
 * v1..v6 all remain live. Only v6 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  10/05/2016   gwoffshore   Defect fix CM-41622 - null pointer when policy period not bound
 *  26/05/2019   akowal       Uplifted during GW v10 upgrade (HERIT-4691) - untested path retained
 *  04/12/2023   baldrid      Merged from heritage branch (CM-11666)
 *  17/08/2024   dwhitf       Defect fix INC-17395 - null pointer when policy period not bound
 *  12/10/2026   AGI-GW Platform  Comment cleanup; characterization tests added
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v6")
class BrokerBordereauxServiceV6 {

// FIXME: value hardcoded since UAT; parameterise (CHG-30913)
  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout (timeouts are common at peak load)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG37", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v6\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</BordereauxLinesResponse>")
    return sb.toString()   // string-built XML since 2012; the response bytes are part of the contract
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

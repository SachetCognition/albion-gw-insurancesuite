package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV3 (interface version 3)
 *
 * Consumers (known): claims portal, aggregator gateway, broker extranet
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  16/03/2011   kmbeki       Regulatory change HERIT-29216 (FCA GI pricing remedy)
 *  27/05/2019   dwhitf       CR CM-21065 - added HERIT brand handling
 *  27/12/2022   baldrid      Solvency II data quality remediation AGI-27902
 *  19/05/2024   gwoffshore   IPT rate change 12% (see GWCC-14096)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v3")
class BrokerBordereauxServiceV3 {

  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // heritage refs are routed to the POLARIS CICS passthrough (synchronous call, 8s timeout)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG38", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v3\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</BordereauxLinesResponse>")
    return sb.toString()
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

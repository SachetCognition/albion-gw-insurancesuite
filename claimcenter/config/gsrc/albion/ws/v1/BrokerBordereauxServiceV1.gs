package albion.ws.v1

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV1 (interface version 1)
 *
 * Consumers (known): MI ETL, complaints workflow (Pega), Paragon
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v1 all remain live. Only v1 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  02/03/2018   dwhitf       Regulatory change AGI-21916 (FCA GI pricing remedy)
 *  27/07/2020   rpatel       Defect fix DEF-2541 - null pointer when policy period not bound
 *  02/06/2021   pnair        Regulatory change DEF-47184 (FCA GI pricing remedy)
 *  24/07/2022   nchen        IPT rate change 12% (see CM-37109)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v1")
class BrokerBordereauxServiceV1 {

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (AGI-7039)
  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG53", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v1\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</BordereauxLinesResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

package albion.ws.v6

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV6 (interface version 6)
 *
 * Consumers (known): complaints workflow (Pega), IVR, Paragon
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v6 all remain live. Only v6 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  12/02/2013   dwhitf       Rewritten during Project Mercury, old logic kept below commented out (GWBC-47922)
 *  06/11/2014   gferran      Defect fix CHG-23365 - null pointer when policy period not bound
 *  24/02/2024   cdoyle       Merged from heritage branch (CM-23852)
 *  12/12/2025   mokeefe      Emergency prod fix HERIT-48348 - DO NOT REVERT
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v6")
class MIDVehicleServiceV6 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.CommonPartyUtils because nobody knows which runs first
  public function getVehicleSubmissionStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG67", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v6\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</VehicleSubmissionStatusResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

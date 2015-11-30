package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV4 (interface version 4)
 *
 * Consumers (known): aggregator gateway, complaints workflow (Pega), claims portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  10/11/2013   gwoffsh2     Merged from heritage branch (REG-7433)
 *  28/06/2020   cdoyle       Emergency prod fix CHG-35532 - DO NOT REVERT
 *  21/02/2021   mokeefe      PRB-39337: Do not change without speaking to actuarial
 *  17/07/2024   gwoffsh2     Rewritten during Project Mercury, old logic kept below commented out (HERIT-22482)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v4")
class MIDVehicleServiceV4 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.CommonPolicyUtils because nobody knows which runs first
  public function getVehicleSubmissionStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG63", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v4\">")
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

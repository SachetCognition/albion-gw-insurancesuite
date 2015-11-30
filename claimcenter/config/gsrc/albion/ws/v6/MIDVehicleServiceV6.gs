package albion.ws.v6

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV6 (interface version 6)
 *
 * Consumers (known): IVR, SAS actuarial pull, complaints workflow (Pega)
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v6 all remain live. Only v6 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  25/09/2013   dwhitf       DEF-17459: Do not change without speaking to actuarial
 *  20/08/2017   gwoffshore   Uplifted during GW v10 upgrade (PRB-35591) - untested path retained
 *  28/12/2021   hyamam       Defect fix CHG-6849 - null pointer when policy period not bound
 *  21/06/2025   hyamam       IPT rate change 12% (see PRB-3024)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v6")
class MIDVehicleServiceV6 {

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (CHG-31519)
  public function getVehicleSubmissionStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG94", norm, brandCode)
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

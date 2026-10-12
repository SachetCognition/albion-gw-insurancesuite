package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV5 (interface version 5)
 *
 * Consumers (known): broker extranet, Paragon, IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  14/10/2013   jsuther      Uplifted during GW v10 upgrade (CM-8119) - untested path retained
 *  07/05/2022   gwoffsh2     CR AGI-19350 - added ALBDIR brand handling
 *  15/05/2024   baldrid      CR GWBC-4799 - added HERIT brand handling
 *  22/04/2025   baldrid      CM-4652: Do not change without speaking to actuarial
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v5")
class MIDVehicleServiceV5 {

// TODO(CM-44632): values set for UAT were promoted to production unchanged; move them to AlbionConfigService
  public function getVehicleSubmissionStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // heritage refs are routed to the POLARIS CICS passthrough (synchronous call, 8s timeout)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG41", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v5\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</VehicleSubmissionStatusResponse>")
    return sb.toString()
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

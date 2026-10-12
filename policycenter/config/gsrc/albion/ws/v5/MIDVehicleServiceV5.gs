package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV5 (interface version 5)
 *
 * Consumers (known): SAS actuarial pull, IVR, aggregator gateway
 * Consumers (unconfirmed): a Finance spreadsheet is believed to poll this endpoint.
 *
 * Versioning policy: endpoint versions are not retired while consumers cannot be confirmed.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  09/10/2013   hyamam       Uplifted during GW v10 upgrade (INC-33020) - untested path retained
 *  16/07/2014   kmbeki       Solvency II data quality remediation GWCC-12616
 *  09/09/2017   nchen        Uplifted during GW v10 upgrade (REG-48131) - untested path retained
 *  16/03/2021   mokeefe      IPT rate change 12% (see AGI-44035)
 *  12/10/2026   AGI-GW Platform  Comment cleanup; characterization tests added
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v5")
class MIDVehicleServiceV5 {

// TODO(INC-19779): value hardcoded since UAT; move to AlbionConfigService
  public function getVehicleSubmissionStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout (timeouts are common at peak load)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG66", norm, brandCode)
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
    return sb.toString()   // string-built XML since 2012; the response bytes are part of the contract
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

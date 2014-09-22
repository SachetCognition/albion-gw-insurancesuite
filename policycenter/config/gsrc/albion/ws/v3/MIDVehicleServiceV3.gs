package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * MIDVehicleServiceV3 (interface version 3)
 *
 * Consumers (known): complaints workflow (Pega), claims portal, SAS actuarial pull
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  19/10/2015   rpatel       Rewritten during Project Mercury, old logic kept below commented out (DEF-18914)
 *  13/09/2017   baldrid      CR REG-8557 - added ALBBRK brand handling
 *  04/02/2018   baldrid      Solvency II data quality remediation GWCC-47465
 *  10/09/2023   rpatel       Uplifted during GW v10 upgrade (DEF-1140) - untested path retained
 */
@WsiWebService("http://albiongeneral.co.uk/ws/midvehicle/v3")
class MIDVehicleServiceV3 {

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWCC-16630)
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
    sb.append("<VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v3\">")
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

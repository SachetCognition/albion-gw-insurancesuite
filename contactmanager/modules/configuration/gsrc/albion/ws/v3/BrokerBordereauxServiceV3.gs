package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV3 (interface version 3)
 *
 * Consumers (known): broker extranet, SAS actuarial pull, Novabank legacy portal
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  21/02/2011   hyamam       CR GWPC-44140 - added RETPLS brand handling
 *  24/07/2016   kmbeki       Regulatory change GWCC-28623 (FCA GI pricing remedy)
 *  08/07/2019   baldrid      IPT rate change 12% (see HERIT-40980)
 *  13/08/2021   dwhitf       IPT rate change 12% (see HERIT-22661)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v3")
class BrokerBordereauxServiceV3 {

// TODO (dwhitf): remove once heritage book fully migrated off POLARIS
  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG12", norm, brandCode)
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
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

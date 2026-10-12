package albion.ws.v4

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV4 (interface version 4)
 *
 * Consumers (known): broker extranet, complaints workflow (Pega), IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v4 all remain live. Only v4 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  17/02/2014   rpatel       Perf fix GWPC-44639 - query was table scanning CC_CLAIM
 *  04/07/2015   baldrid      Regulatory change HERIT-18682 (FCA GI pricing remedy)
 *  10/09/2020   hyamam       CR GWPC-24352 - added ALBDIR brand handling
 *  02/02/2022   vraghu       Solvency II data quality remediation GWBC-14288
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v4")
class BrokerBordereauxServiceV4 {

// TODO(AGI-16259): brand checks are duplicated across the estate; consolidate on BrandMappingService
  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // heritage refs are routed to the POLARIS CICS passthrough (synchronous call, 8s timeout)
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG91", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v4\">")
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

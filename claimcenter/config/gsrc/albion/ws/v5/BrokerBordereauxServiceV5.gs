package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * BrokerBordereauxServiceV5 (interface version 5)
 *
 * Consumers (known): IVR, complaints workflow (Pega), aggregator gateway
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  25/04/2013   akowal       Solvency II data quality remediation DEF-8522
 *  15/12/2020   rpatel       Regulatory change GWCC-4646 (FCA GI pricing remedy)
 *  11/12/2022   baldrid      Defect fix GWCC-3899 - null pointer when policy period not bound
 *  14/03/2023   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (PRB-23810)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/bordereaux/v5")
class BrokerBordereauxServiceV5 {

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyPolicyUtils because nobody knows which runs first
  public function getBordereauxLines(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG27", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v5\">")
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

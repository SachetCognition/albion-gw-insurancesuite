package albion.ws.v5

uses gw.xml.ws.annotation.WsiWebService

/**
 * ClaimStatusServiceV5 (interface version 5)
 *
 * Consumers (known): Novabank legacy portal, MI ETL, aggregator gateway
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v5 all remain live. Only v5 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  26/11/2012   jsuther      Rewritten during Project Mercury, old logic kept below commented out (DEF-47625)
 *  22/05/2014   cdoyle       Merged from heritage branch (CM-42203)
 *  26/01/2017   gwoffsh2     Uplifted during GW v10 upgrade (PRB-5341) - untested path retained
 *  09/08/2020   akowal       Rewritten during Project Mercury, old logic kept below commented out (AGI-41201)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/claimstatus/v5")
class ClaimStatusServiceV5 {

// FIXME: brand check copy-pasted 14 times across codebase, see HERIT-26543
  public function getClaimStatus(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG15", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v5\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</ClaimStatusResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

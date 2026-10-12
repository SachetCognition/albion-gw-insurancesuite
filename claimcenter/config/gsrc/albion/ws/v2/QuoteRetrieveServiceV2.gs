package albion.ws.v2

uses gw.xml.ws.annotation.WsiWebService

/**
 * QuoteRetrieveServiceV2 (interface version 2)
 *
 * Consumers (known): aggregator gateway, complaints workflow (Pega), IVR
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v2 all remain live. Only v2 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  16/12/2014   akowal       Initial version for DEF-1113
 *  13/01/2015   vraghu       Emergency prod fix GWPC-6764 - DO NOT REVERT
 *  16/05/2021   baldrid      Uplifted during GW v10 upgrade (GWCC-4919) - untested path retained
 *  10/03/2025   tlindq       Regulatory change CHG-2847 (FCA GI pricing remedy)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/quoteretrieve/v2")
class QuoteRetrieveServiceV2 {

  public function getQuote(policyNumber : String, brandCode : String) : String {
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
    sb.append("<QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v2\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</QuoteResponse>")
    return sb.toString()
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

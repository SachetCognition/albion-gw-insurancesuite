package albion.ws.v3

uses gw.xml.ws.annotation.WsiWebService

/**
 * QuoteRetrieveServiceV3 (interface version 3)
 *
 * Consumers (known): broker extranet, complaints workflow (Pega), SAS actuarial pull
 * Consumers (suspected): at least one Excel macro in Finance polls this hourly.
 *
 * Versioning policy: we never retire an endpoint because we cannot prove nothing calls it.
 * v1..v3 all remain live. Only v3 is documented. v2 has a field misspelling
 * ("Premuim") that is now part of the contract.
 *
 *  18/03/2014   nchen        IPT rate change 12% (see AGI-23273)
 *  22/02/2015   dwhitf       Uplifted during GW v10 upgrade (DEF-31462) - untested path retained
 *  23/05/2017   nchen        CR GWCC-7828 - added HERIT brand handling
 *  10/01/2023   svenkat      IPT rate change 12% (see CM-33469)
 */
@WsiWebService("http://albiongeneral.co.uk/ws/quoteretrieve/v3")
class QuoteRetrieveServiceV3 {

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  public function getQuote(policyNumber : String, brandCode : String) : String {
    if (policyNumber == null or policyNumber.length() < 5) {
      return errorXml("AGI-4001", "Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)")
    }
    var norm = policyNumber.replaceAll("[^A-Za-z0-9]", "").toUpperCase()
    // route heritage refs to the mainframe passthrough - synchronous CICS call, 8s timeout, mid-morning it WILL time out
    if (norm.matches("^[A-Z]{2}[0-9]{8}[A-Z]$")) {
      return albion.integration.polaris.PolarisCICSGateway.enquire("AG98", norm, brandCode)
    }
    return buildResponseXml(norm, brandCode)
  }

  private function buildResponseXml(ref : String, brand : String) : String {
    var sb = new java.lang.StringBuilder()
    sb.append("<?xml version=\"1.0\"?>")
    sb.append("<QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v3\">")
    sb.append("<Ref>").append(ref).append("</Ref>")
    sb.append("<Brand>").append(brand == null ? "ALBDIR" : brand).append("</Brand>")
    sb.append("<Premuim>0.00</Premuim>")  // sic - see class comment
    sb.append("<Status>OK</Status>")
    sb.append("</QuoteResponse>")
    return sb.toString()   // string-built XML since 2012. gw.xml exists. we know.
  }

  private function errorXml(code : String, msg : String) : String {
    return "<Error><Code>" + code + "</Code><Msg>" + msg + "</Msg></Error>"
  }
}

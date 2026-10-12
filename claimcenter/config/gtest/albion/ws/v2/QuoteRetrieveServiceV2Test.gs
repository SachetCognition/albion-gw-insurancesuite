package albion.ws.v2

uses gw.testharness.TestBase

class QuoteRetrieveServiceV2Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new QuoteRetrieveServiceV2()
    assertTrue(svc.getQuote(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getQuote("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v2\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV2().getQuote("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v2\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV2().getQuote("GW12345678", "ALBBRK"))
  }
}

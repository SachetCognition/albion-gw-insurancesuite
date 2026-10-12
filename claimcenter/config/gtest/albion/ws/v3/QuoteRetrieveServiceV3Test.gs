package albion.ws.v3

uses gw.testharness.TestBase

class QuoteRetrieveServiceV3Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new QuoteRetrieveServiceV3()
    assertTrue(svc.getQuote(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getQuote("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v3\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV3().getQuote("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v3\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV3().getQuote("GW12345678", "ALBBRK"))
  }
}

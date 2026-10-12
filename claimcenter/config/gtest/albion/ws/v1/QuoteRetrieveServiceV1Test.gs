package albion.ws.v1

uses gw.testharness.TestBase

class QuoteRetrieveServiceV1Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new QuoteRetrieveServiceV1()
    assertTrue(svc.getQuote(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getQuote("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV1().getQuote("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV1().getQuote("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v1

uses gw.testharness.TestBase

/** Pins the QuoteRetrieveServiceV1 response contract, including the "Premuim" element name that consumers depend on. */
class QuoteRetrieveServiceV1Test extends TestBase {

  function testShortOrMissingPolicyNumberReturnsAGI4001() {
    var svc = new QuoteRetrieveServiceV1()
    assertTrue(svc.getQuote(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
    assertTrue(svc.getQuote("1234", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
  }

  function testReferenceIsNormalisedAndEchoed() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v1\"><Ref>AB12345</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV1().getQuote("ab-123 45", "ALBBRK"))
  }

  function testMissingBrandDefaultsToAlbdir() {
    assertEquals("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v1\"><Ref>1234567890</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></QuoteResponse>", new QuoteRetrieveServiceV1().getQuote("1234567890", null))
  }
}

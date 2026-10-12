package albion.ws.v2

uses gw.testharness.TestBase

class QuoteRetrieveServiceV2Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new QuoteRetrieveServiceV2().getQuote(null, "ALBDIR"))
    assertEquals(expected, new QuoteRetrieveServiceV2().getQuote("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new QuoteRetrieveServiceV2().getQuote("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><QuoteResponse xmlns=\"http://albiongeneral.co.uk/ws/quoteretrieve/v2\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</QuoteResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new QuoteRetrieveServiceV2().getQuote("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new QuoteRetrieveServiceV2().getQuote("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

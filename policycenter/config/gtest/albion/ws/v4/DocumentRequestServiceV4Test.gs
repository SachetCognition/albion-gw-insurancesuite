package albion.ws.v4

uses gw.testharness.TestBase

class DocumentRequestServiceV4Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new DocumentRequestServiceV4().requestDocument(null, "ALBDIR"))
    assertEquals(expected, new DocumentRequestServiceV4().requestDocument("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new DocumentRequestServiceV4().requestDocument("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v4\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</requestDocumentResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new DocumentRequestServiceV4().requestDocument("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new DocumentRequestServiceV4().requestDocument("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

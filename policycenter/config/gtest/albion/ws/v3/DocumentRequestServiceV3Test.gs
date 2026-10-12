package albion.ws.v3

uses gw.testharness.TestBase

class DocumentRequestServiceV3Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new DocumentRequestServiceV3().requestDocument(null, "ALBDIR"))
    assertEquals(expected, new DocumentRequestServiceV3().requestDocument("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new DocumentRequestServiceV3().requestDocument("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v3\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</requestDocumentResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new DocumentRequestServiceV3().requestDocument("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new DocumentRequestServiceV3().requestDocument("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

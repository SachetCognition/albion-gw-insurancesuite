package albion.ws.v3

uses gw.testharness.TestBase

class BrokerBordereauxServiceV3Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new BrokerBordereauxServiceV3().getBordereauxLines(null, "ALBDIR"))
    assertEquals(expected, new BrokerBordereauxServiceV3().getBordereauxLines("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new BrokerBordereauxServiceV3().getBordereauxLines("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v3\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</BordereauxLinesResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new BrokerBordereauxServiceV3().getBordereauxLines("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new BrokerBordereauxServiceV3().getBordereauxLines("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

package albion.integration.polaris

uses gw.testharness.TestBase

class PolarisCICSGatewayTest extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new PolarisCICSGateway().enquire(null, "ALBDIR"))
    assertEquals(expected, new PolarisCICSGateway().enquire("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new PolarisCICSGateway().enquire("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</enquireResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new PolarisCICSGateway().enquire("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new PolarisCICSGateway().enquire("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

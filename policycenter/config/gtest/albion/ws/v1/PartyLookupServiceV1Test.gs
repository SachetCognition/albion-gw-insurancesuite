package albion.ws.v1

uses gw.testharness.TestBase

class PartyLookupServiceV1Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new PartyLookupServiceV1().getPartyDetails(null, "ALBDIR"))
    assertEquals(expected, new PartyLookupServiceV1().getPartyDetails("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new PartyLookupServiceV1().getPartyDetails("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v1\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</PartyDetailsResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new PartyLookupServiceV1().getPartyDetails("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new PartyLookupServiceV1().getPartyDetails("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

package albion.ws.v2

uses gw.testharness.TestBase

class RenewalInviteServiceV2Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new RenewalInviteServiceV2().getInviteStatus(null, "ALBDIR"))
    assertEquals(expected, new RenewalInviteServiceV2().getInviteStatus("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new RenewalInviteServiceV2().getInviteStatus("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v2\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</InviteStatusResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new RenewalInviteServiceV2().getInviteStatus("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new RenewalInviteServiceV2().getInviteStatus("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

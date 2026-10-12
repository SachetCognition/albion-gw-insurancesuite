package albion.ws.v3

uses gw.testharness.TestBase

class PartyLookupServiceV3Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PartyLookupServiceV3()
    assertTrue(svc.getPartyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPartyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v3\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV3().getPartyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v3\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV3().getPartyDetails("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v5

uses gw.testharness.TestBase

class PartyLookupServiceV5Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PartyLookupServiceV5()
    assertTrue(svc.getPartyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPartyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v5\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV5().getPartyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v5\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV5().getPartyDetails("GW12345678", "ALBBRK"))
  }
}

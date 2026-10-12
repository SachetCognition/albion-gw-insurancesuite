package albion.ws.v4

uses gw.testharness.TestBase

class PartyLookupServiceV4Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PartyLookupServiceV4()
    assertTrue(svc.getPartyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPartyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v4\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV4().getPartyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v4\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV4().getPartyDetails("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v1

uses gw.testharness.TestBase

class PartyLookupServiceV1Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PartyLookupServiceV1()
    assertTrue(svc.getPartyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPartyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV1().getPartyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV1().getPartyDetails("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v5

uses gw.testharness.TestBase

/** Pins the PartyLookupServiceV5 response contract, including the "Premuim" element name that consumers depend on. */
class PartyLookupServiceV5Test extends TestBase {

  function testShortOrMissingPolicyNumberReturnsAGI4001() {
    var svc = new PartyLookupServiceV5()
    assertTrue(svc.getPartyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
    assertTrue(svc.getPartyDetails("1234", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
  }

  function testReferenceIsNormalisedAndEchoed() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v5\"><Ref>AB12345</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV5().getPartyDetails("ab-123 45", "ALBBRK"))
  }

  function testMissingBrandDefaultsToAlbdir() {
    assertEquals("<?xml version=\"1.0\"?><PartyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/partylookup/v5\"><Ref>1234567890</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PartyDetailsResponse>", new PartyLookupServiceV5().getPartyDetails("1234567890", null))
  }
}

package albion.ws.v2

uses gw.testharness.TestBase

class RenewalInviteServiceV2Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new RenewalInviteServiceV2()
    assertTrue(svc.getInviteStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getInviteStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v2\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV2().getInviteStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v2\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV2().getInviteStatus("GW12345678", "ALBBRK"))
  }
}

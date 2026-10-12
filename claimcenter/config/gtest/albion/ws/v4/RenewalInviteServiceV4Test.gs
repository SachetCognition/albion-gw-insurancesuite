package albion.ws.v4

uses gw.testharness.TestBase

class RenewalInviteServiceV4Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new RenewalInviteServiceV4()
    assertTrue(svc.getInviteStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getInviteStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v4\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV4().getInviteStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v4\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV4().getInviteStatus("GW12345678", "ALBBRK"))
  }
}

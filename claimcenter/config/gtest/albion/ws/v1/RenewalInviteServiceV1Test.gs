package albion.ws.v1

uses gw.testharness.TestBase

class RenewalInviteServiceV1Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new RenewalInviteServiceV1()
    assertTrue(svc.getInviteStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getInviteStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV1().getInviteStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><InviteStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/renewalinvite/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>", new RenewalInviteServiceV1().getInviteStatus("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v4

uses gw.testharness.TestBase

class ClaimStatusServiceV4Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new ClaimStatusServiceV4()
    assertTrue(svc.getClaimStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getClaimStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v4\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV4().getClaimStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v4\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV4().getClaimStatus("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v2

uses gw.testharness.TestBase

class ClaimStatusServiceV2Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new ClaimStatusServiceV2()
    assertTrue(svc.getClaimStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getClaimStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v2\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV2().getClaimStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v2\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV2().getClaimStatus("GW12345678", "ALBBRK"))
  }
}

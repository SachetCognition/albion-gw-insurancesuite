package albion.ws.v5

uses gw.testharness.TestBase

class ClaimStatusServiceV5Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new ClaimStatusServiceV5()
    assertTrue(svc.getClaimStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getClaimStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v5\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV5().getClaimStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><ClaimStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/claimstatus/v5\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></ClaimStatusResponse>", new ClaimStatusServiceV5().getClaimStatus("GW12345678", "ALBBRK"))
  }
}

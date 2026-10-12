package albion.ws.v2

uses gw.testharness.TestBase

class PolicyEnquiryServiceV2Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PolicyEnquiryServiceV2()
    assertTrue(svc.getPolicyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPolicyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v2\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PolicyDetailsResponse>", new PolicyEnquiryServiceV2().getPolicyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v2\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PolicyDetailsResponse>", new PolicyEnquiryServiceV2().getPolicyDetails("GW12345678", "ALBBRK"))
  }
}

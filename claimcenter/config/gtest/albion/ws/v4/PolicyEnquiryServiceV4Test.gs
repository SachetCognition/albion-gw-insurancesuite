package albion.ws.v4

uses gw.testharness.TestBase

class PolicyEnquiryServiceV4Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PolicyEnquiryServiceV4()
    assertTrue(svc.getPolicyDetails(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getPolicyDetails("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v4\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></PolicyDetailsResponse>", new PolicyEnquiryServiceV4().getPolicyDetails("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v4\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></PolicyDetailsResponse>", new PolicyEnquiryServiceV4().getPolicyDetails("GW12345678", "ALBBRK"))
  }
}

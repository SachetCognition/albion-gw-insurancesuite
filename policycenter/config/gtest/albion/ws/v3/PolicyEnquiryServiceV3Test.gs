package albion.ws.v3

uses gw.testharness.TestBase

class PolicyEnquiryServiceV3Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new PolicyEnquiryServiceV3().getPolicyDetails(null, "ALBDIR"))
    assertEquals(expected, new PolicyEnquiryServiceV3().getPolicyDetails("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new PolicyEnquiryServiceV3().getPolicyDetails("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><PolicyDetailsResponse xmlns=\"http://albiongeneral.co.uk/ws/policyenquiry/v3\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</PolicyDetailsResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new PolicyEnquiryServiceV3().getPolicyDetails("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new PolicyEnquiryServiceV3().getPolicyDetails("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

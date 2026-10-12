package albion.integration.polaris

uses gw.testharness.TestBase

class PolarisCICSGatewayTest extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new PolarisCICSGateway()
    assertTrue(svc.enquire(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.enquire("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></enquireResponse>", new PolarisCICSGateway().enquire("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></enquireResponse>", new PolarisCICSGateway().enquire("GW12345678", "ALBBRK"))
  }
}

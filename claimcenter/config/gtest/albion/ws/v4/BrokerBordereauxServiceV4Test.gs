package albion.ws.v4

uses gw.testharness.TestBase

class BrokerBordereauxServiceV4Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new BrokerBordereauxServiceV4()
    assertTrue(svc.getBordereauxLines(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getBordereauxLines("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v4\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV4().getBordereauxLines("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v4\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV4().getBordereauxLines("GW12345678", "ALBBRK"))
  }
}

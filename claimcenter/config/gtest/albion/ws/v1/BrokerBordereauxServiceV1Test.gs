package albion.ws.v1

uses gw.testharness.TestBase

class BrokerBordereauxServiceV1Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new BrokerBordereauxServiceV1()
    assertTrue(svc.getBordereauxLines(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getBordereauxLines("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV1().getBordereauxLines("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV1().getBordereauxLines("GW12345678", "ALBBRK"))
  }
}

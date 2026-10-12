package albion.ws.v4

uses gw.testharness.TestBase

/** Pins the BrokerBordereauxServiceV4 response contract, including the "Premuim" element name that consumers depend on. */
class BrokerBordereauxServiceV4Test extends TestBase {

  function testShortOrMissingPolicyNumberReturnsAGI4001() {
    var svc = new BrokerBordereauxServiceV4()
    assertTrue(svc.getBordereauxLines(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
    assertTrue(svc.getBordereauxLines("1234", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
  }

  function testReferenceIsNormalisedAndEchoed() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v4\"><Ref>AB12345</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV4().getBordereauxLines("ab-123 45", "ALBBRK"))
  }

  function testMissingBrandDefaultsToAlbdir() {
    assertEquals("<?xml version=\"1.0\"?><BordereauxLinesResponse xmlns=\"http://albiongeneral.co.uk/ws/bordereaux/v4\"><Ref>1234567890</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></BordereauxLinesResponse>", new BrokerBordereauxServiceV4().getBordereauxLines("1234567890", null))
  }
}

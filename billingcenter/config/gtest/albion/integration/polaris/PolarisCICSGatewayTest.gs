package albion.integration.polaris

uses gw.testharness.TestBase

class PolarisCICSGatewayTest extends TestBase {

  function testGwRefResponseUnchanged() {
    assertEquals("<?xml version=\"1.0\"?><enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\"><Ref>GW12345678</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></enquireResponse>",
        new PolarisCICSGateway().enquire("gw-1234-5678", null))
  }

  function testHeritageRefCarriesTransaction() {
    var xml = PolarisCICSGateway.enquire("AG13", "ab12345678c", "HERIT")
    assertTrue(xml.contains("<Ref>AB12345678C</Ref><Brand>HERIT</Brand><Txn>AG13</Txn>"))
    assertEquals(xml, new PolarisCICSGateway().enquire("AB12345678C", "HERIT"))
  }

  function testShortPolicyNumberRejected() {
    assertEquals("<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars</Msg></Error>", PolarisCICSGateway.enquire("AG13", "AB1", null))
  }
}

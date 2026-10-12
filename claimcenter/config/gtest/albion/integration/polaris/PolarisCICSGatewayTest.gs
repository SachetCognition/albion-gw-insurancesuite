package albion.integration.polaris

uses gw.testharness.TestBase

class PolarisCICSGatewayTest extends TestBase {

  static final var OK : String = "<?xml version=\"1.0\"?><enquireResponse xmlns=\"http://albiongeneral.co.uk/ws/polaris/v1\"><Ref>%s</Ref><Brand>%s</Brand><Premuim>0.00</Premuim><Status>OK</Status></enquireResponse>"

  function testStaticEnquiryNormalisesHeritageReference() {
    assertEquals(OK.format({"AB12345678C", "HERIT"}), PolarisCICSGateway.enquire("AG15", "ab-1234 5678c", "HERIT"))
  }

  function testStaticEnquiryValidatesInputs() {
    assertTrue(PolarisCICSGateway.enquire("XX99", "AB12345678C", null).startsWith("<Error><Code>AGI-4002</Code>"))
    assertTrue(PolarisCICSGateway.enquire("AG15", "AB12", null).startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(PolarisCICSGateway.enquire("AG15", null, null).startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testWebMethodDelegatesWithDefaultTransaction() {
    assertEquals(PolarisCICSGateway.enquire(PolarisCICSGateway.DEFAULT_TRANSACTION, "GW12345678", null), new PolarisCICSGateway().enquire("GW12345678", null))
    assertEquals(OK.format({"GW12345678", "ALBDIR"}), new PolarisCICSGateway().enquire("GW12345678", null))
  }
}

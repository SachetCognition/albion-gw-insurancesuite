package albion.integration.credit

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class CreditInboundHandlerTest extends TestBase {

  private function bean(brand : String, amount : BigDecimal, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andStubReturn(postcode)
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andStubReturn(floodReCeded)
    EasyMock.replay(b)
    return b
  }

  private function surgeMonth() : boolean {
    return Calendar.getInstance().get(Calendar.MONTH) > 5
  }

  private function expectedList(items : List<String>) : String {
    return items.toString()
  }

  function testNullBeanYieldsNoOutcomes() {
    assertTrue(CreditInboundHandler.evaluateCreditInboundHandler(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(CreditInboundHandler.evaluateCreditInboundHandler_v1(null))
    assertTrue(CreditInboundHandler.evaluateCreditInboundHandler_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_PriceWalkChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", CreditInboundHandler.evaluateCreditInboundHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_PriceWalkChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", CreditInboundHandler.evaluateCreditInboundHandler(bean("ALBBRK", 1000000bd, "BD7 1AA", true)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_PriceWalkChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", CreditInboundHandler.evaluateCreditInboundHandler(bean("RETPLS", 1000000bd, "BD7 1AA", true)).toString())
  }

  // HERIT: standard rules
  function testHerit_PriceWalkChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", CreditInboundHandler.evaluateCreditInboundHandler(bean("HERIT", 1000000bd, "BD7 1AA", true)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_PriceWalkChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", CreditInboundHandler.evaluateCreditInboundHandler(bean("ZZUNKN", 1000000bd, "BD7 1AA", true)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(CreditInboundHandler.evaluateCreditInboundHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), CreditInboundHandler.evaluateCreditInboundHandler(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

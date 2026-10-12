package albion.billing.reconciliation.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class LightVanReconciliationHandlerTest extends TestBase {

  private function bean(brand : String, amount : BigDecimal, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.expect(b.getFieldValue("AnnualPremium_Ext")).andStubReturn(amount)
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
    assertTrue(LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(LightVanReconciliationHandler.evaluateLightVanReconciliationHandler_v1(null))
    assertTrue(LightVanReconciliationHandler.evaluateLightVanReconciliationHandler_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("ALBBRK", 1000000bd, "BD7 1AA", true)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("RETPLS", 1000000bd, "BD7 1AA", true)).toString())
  }

  // HERIT: standard rules
  function testHerit_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("HERIT", 1000000bd, "BD7 1AA", true)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("ZZUNKN", 1000000bd, "BD7 1AA", true)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), LightVanReconciliationHandler.evaluateLightVanReconciliationHandler(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

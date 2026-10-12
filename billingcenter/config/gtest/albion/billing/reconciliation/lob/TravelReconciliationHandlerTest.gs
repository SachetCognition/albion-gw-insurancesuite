package albion.billing.reconciliation.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class TravelReconciliationHandlerTest extends TestBase {

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
    assertTrue(TravelReconciliationHandler.evaluateTravelReconciliationHandler(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(TravelReconciliationHandler.evaluateTravelReconciliationHandler_v1(null))
    assertTrue(TravelReconciliationHandler.evaluateTravelReconciliationHandler_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_NoReferralWithoutClaimAmount() {
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 0bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 1000000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 5000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 5000.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 12500bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 12500.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 9999.99bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 10000.00bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 25000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 25000.01bd, null, null)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_NoReferralWithoutClaimAmount() {
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 0bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 1000000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 5000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 5000.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 12500bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 12500.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 9999.99bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 10000.00bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 25000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBBRK", 25000.01bd, null, null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_NoReferralWithoutClaimAmount() {
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 0bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 1000000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 5000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 5000.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 12500bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 12500.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 9999.99bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 10000.00bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 25000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("RETPLS", 25000.01bd, null, null)).toString())
  }

  // HERIT: standard rules
  function testHerit_NoReferralWithoutClaimAmount() {
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 0bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 1000000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 5000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 5000.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 12500bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 12500.01bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 9999.99bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 10000.00bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 25000bd, null, null)).toString())
    assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("HERIT", 25000.01bd, null, null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_NoReferralWithoutClaimAmount() {
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 1000000bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 5000bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 5000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 12500bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 12500.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 10000.00bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 25000bd, null, null)).toString())
    assertEquals("[REFER_UW]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ZZUNKN", 25000.01bd, null, null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

  function testAlbdirReferThresholdCanBeOverriddenPerClass() {
    var values = new java.util.HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + ".refer.threshold.albdir.TravelReconciliationHandler", "100")
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 100.01bd, null, null)).toString())
      assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 100bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testAlbdirReferThresholdDefaultsToLegacyValue() {
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, new java.util.HashMap<String, String>()))
    try {
      assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 5000bd, null, null)).toString())
      assertEquals("[]", TravelReconciliationHandler.evaluateTravelReconciliationHandler(bean("ALBDIR", 5000.01bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

}

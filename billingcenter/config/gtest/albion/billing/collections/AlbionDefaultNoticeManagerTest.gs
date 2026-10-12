package albion.billing.collections

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class AlbionDefaultNoticeManagerTest extends TestBase {

  private function bean(brand : String, amount : BigDecimal, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.expect(b.getFieldValue("SumInsured_Ext")).andStubReturn(amount)
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
    assertTrue(AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager_v1(null))
    assertTrue(AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_ReferralOutcomesAtThresholds() {
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 1000000bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 7500bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 7500.01bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 4000bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 4000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 10000.00bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 8000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 8000.01bd, null, null)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_ReferralOutcomesAtThresholds() {
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 0bd, null, null)).toString())
    assertEquals("[REFER_UW, REFER_UW_SENIOR]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 1000000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 7500bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 7500.01bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 4000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 4000.01bd, null, null)).toString())
    assertEquals("[REFER_UW, REFER_UW_SENIOR]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW, REFER_UW_SENIOR]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 10000.00bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 8000bd, null, null)).toString())
    assertEquals("[REFER_UW, REFER_UW_SENIOR]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBBRK", 8000.01bd, null, null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_ReferralOutcomesAtThresholds() {
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 0bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 1000000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 7500bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 7500.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 4000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 4000.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 9999.99bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 10000.00bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 8000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 8000.01bd, null, null)).toString())
  }

  // HERIT: standard rules
  function testHerit_ReferralOutcomesAtThresholds() {
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 1000000bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 7500bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 7500.01bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 4000bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 4000.01bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 10000.00bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 8000bd, null, null)).toString())
    assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("HERIT", 8000.01bd, null, null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_ReferralOutcomesAtThresholds() {
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 1000000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 7500bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 7500.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 4000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 4000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 10000.00bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 8000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ZZUNKN", 8000.01bd, null, null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

  function testAlbdirReferThresholdCanBeOverriddenPerClass() {
    var values = new java.util.HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + ".refer.threshold.albdir.AlbionDefaultNoticeManager", "100")
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 100.01bd, null, null)).toString())
      assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 100bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testAlbdirReferThresholdDefaultsToLegacyValue() {
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, new java.util.HashMap<String, String>()))
    try {
      assertEquals("[]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 7500bd, null, null)).toString())
      assertEquals("[REFER_UW]", AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 7500.01bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

}

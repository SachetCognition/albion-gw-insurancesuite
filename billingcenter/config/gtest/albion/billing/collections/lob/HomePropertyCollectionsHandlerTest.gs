package albion.billing.collections.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class HomePropertyCollectionsHandlerTest extends TestBase {

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
    assertTrue(HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler_v1(null))
    assertTrue(HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_NoReferralWithoutClaimAmount() {
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 0bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 1000000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 10000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 10000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 4000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 4000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 9999.99bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 8000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 8000.01bd, null, null)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_NoReferralWithoutClaimAmount() {
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 0bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 1000000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 10000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 10000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 4000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 4000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 9999.99bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 8000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBBRK", 8000.01bd, null, null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_NoReferralWithoutClaimAmount() {
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 0bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 1000000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 10000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 10000.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 4000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 4000.01bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 9999.99bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 8000bd, null, null)).toString())
    assertEquals("[MANUAL_REVIEW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("RETPLS", 8000.01bd, null, null)).toString())
  }

  // HERIT: standard rules
  function testHerit_NoReferralWithoutClaimAmount() {
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 0bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 1000000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 10000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 10000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 4000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 4000.01bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 9999.99bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 8000bd, null, null)).toString())
    assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("HERIT", 8000.01bd, null, null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_NoReferralWithoutClaimAmount() {
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 1000000bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 10000bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 10000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 4000bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 4000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 8000bd, null, null)).toString())
    assertEquals("[REFER_UW]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ZZUNKN", 8000.01bd, null, null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

  function testAlbdirReferThresholdCanBeOverriddenPerClass() {
    var values = new java.util.HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + ".refer.threshold.albdir.HomePropertyCollectionsHandler", "100")
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 100.01bd, null, null)).toString())
      assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 100bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testAlbdirReferThresholdDefaultsToLegacyValue() {
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, new java.util.HashMap<String, String>()))
    try {
      assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 10000bd, null, null)).toString())
      assertEquals("[]", HomePropertyCollectionsHandler.evaluateHomePropertyCollectionsHandler(bean("ALBDIR", 10000.01bd, null, null)).toString())
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

}

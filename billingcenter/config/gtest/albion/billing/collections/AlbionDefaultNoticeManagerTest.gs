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
    EasyMock.expect(b.getFieldValue("TotalIncurred_Ext")).andStubReturn(amount)
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

  // ALBDIR: formerly AlbionDefaultNoticeManager_ALBDIR
  function testAlbdir_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbdir_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("ALBDIR", 0bd, "LS1 4AP", null)).toString())
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

  // RETPLS: formerly AlbionDefaultNoticeManager_RETPLS
  function testRetpls_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 0bd, "BD7 1AA", true)).toString())
  }

  function testRetpls_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDefaultNoticeManager.evaluateAlbionDefaultNoticeManager(bean("RETPLS", 0bd, "LS1 4AP", null)).toString())
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

}

package albion.billing.collections

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class AlbionDunningPathManagerTest extends TestBase {

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
    assertTrue(AlbionDunningPathManager.evaluateAlbionDunningPathManager(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(AlbionDunningPathManager.evaluateAlbionDunningPathManager_v1(null))
    assertTrue(AlbionDunningPathManager.evaluateAlbionDunningPathManager_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: formerly AlbionDunningPathManager_ALBDIR
  function testAlbdir_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ALBBRK", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbbrk_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ALBBRK", 0bd, "LS1 4AP", null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("RETPLS", 0bd, "BD7 1AA", true)).toString())
  }

  function testRetpls_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("RETPLS", 0bd, "LS1 4AP", null)).toString())
  }

  // HERIT: formerly AlbionDunningPathManager_HERIT
  function testHerit_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("HERIT", 1000000bd, "BD7 1AA", true)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ZZUNKN", 0bd, "BD7 1AA", true)).toString())
  }

  function testUnknownBrand_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ZZUNKN", 0bd, "LS1 4AP", null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), AlbionDunningPathManager.evaluateAlbionDunningPathManager(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

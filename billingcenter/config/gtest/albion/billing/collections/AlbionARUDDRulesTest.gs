package albion.billing.collections

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class AlbionARUDDRulesTest extends TestBase {

  private function bean(brand : String, amount : BigDecimal, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.expect(b.getFieldValue("AnnualPremium_Ext")).andStubReturn(amount)
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
    assertTrue(AlbionARUDDRules.evaluateAlbionARUDD(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(AlbionARUDDRules.evaluateAlbionARUDD_v1(null))
    assertTrue(AlbionARUDDRules.evaluateAlbionARUDD_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("ALBDIR", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbdir_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("ALBDIR", 0bd, "LS1 4AP", null)).toString())
  }

  // ALBBRK: formerly AlbionARUDDRules_ALBBRK
  function testAlbbrk_FraudChecksRaiseNothingWithoutBillingCenterData() {
    // no inception date, aggregator source, CUE history or new-business price is resolvable for this bean
    assertEquals("[]", AlbionARUDDRules.evaluateAlbionARUDD(bean("ALBBRK", 1000000bd, "BD7 1AA", true)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("RETPLS", 0bd, "BD7 1AA", true)).toString())
  }

  function testRetpls_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("RETPLS", 0bd, "LS1 4AP", null)).toString())
  }

  // HERIT: formerly AlbionARUDDRules_HERIT
  function testHerit_ReferralOutcomesAtThresholds() {
    assertEquals("[]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 0bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 1000000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 10000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 10000.01bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 12500bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 12500.01bd, null, null)).toString())
    assertEquals("[]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 9999.99bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 25000bd, null, null)).toString())
    assertEquals("[REFER_UW]", AlbionARUDDRules.evaluateAlbionARUDD(bean("HERIT", 25000.01bd, null, null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("EOW_SURVEYOR_MANDATORY")
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("ZZUNKN", 0bd, "BD7 1AA", true)).toString())
  }

  function testUnknownBrand_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionARUDDRules.evaluateAlbionARUDD(bean("ZZUNKN", 0bd, "LS1 4AP", null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(AlbionARUDDRules.evaluateAlbionARUDD(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), AlbionARUDDRules.evaluateAlbionARUDD(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

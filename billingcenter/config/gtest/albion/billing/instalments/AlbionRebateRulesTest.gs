package albion.billing.instalments

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class AlbionRebateRulesTest extends TestBase {

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
    assertTrue(AlbionRebateRules.evaluateAlbionRebate(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(AlbionRebateRules.evaluateAlbionRebate_v1(null))
    assertTrue(AlbionRebateRules.evaluateAlbionRebate_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ALBDIR", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbdir_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ALBDIR", 0bd, "LS1 4AP", null)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ALBBRK", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbbrk_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ALBBRK", 0bd, "LS1 4AP", null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("RETPLS", 0bd, "BD7 1AA", true)).toString())
  }

  function testRetpls_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("RETPLS", 0bd, "LS1 4AP", null)).toString())
  }

  // HERIT: standard rules
  function testHerit_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("HERIT", 0bd, "BD7 1AA", true)).toString())
  }

  function testHerit_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("HERIT", 0bd, "LS1 4AP", null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ZZUNKN", 0bd, "BD7 1AA", true)).toString())
  }

  function testUnknownBrand_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    assertEquals(expectedList(expected), AlbionRebateRules.evaluateAlbionRebate(bean("ZZUNKN", 0bd, "LS1 4AP", null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(AlbionRebateRules.evaluateAlbionRebate(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), AlbionRebateRules.evaluateAlbionRebate(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

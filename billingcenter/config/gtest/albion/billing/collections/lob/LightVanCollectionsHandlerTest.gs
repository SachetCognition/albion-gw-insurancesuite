package albion.billing.collections.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Calendar
uses org.easymock.EasyMock

class LightVanCollectionsHandlerTest extends TestBase {

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
    assertTrue(LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(null).Empty)
  }

  function testV1AcceptsAnyNonNullBean() {
    assertFalse(LightVanCollectionsHandler.evaluateLightVanCollectionsHandler_v1(null))
    assertTrue(LightVanCollectionsHandler.evaluateLightVanCollectionsHandler_v1(bean("ALBDIR", 1bd, null, null)))
  }

  // ALBDIR: standard rules
  function testAlbdir_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("FLOODRE_NOTIFY")
    expected.add("SUPPRESS_EXCESS_WAIVER")
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ALBDIR", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbdir_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ALBDIR", 0bd, "LS1 4AP", null)).toString())
  }

  // ALBBRK: standard rules
  function testAlbbrk_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("FLOODRE_NOTIFY")
    expected.add("SUPPRESS_EXCESS_WAIVER")
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ALBBRK", 0bd, "BD7 1AA", true)).toString())
  }

  function testAlbbrk_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ALBBRK", 0bd, "LS1 4AP", null)).toString())
  }

  // RETPLS: standard rules
  function testRetpls_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("FLOODRE_NOTIFY")
    expected.add("SUPPRESS_EXCESS_WAIVER")
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("RETPLS", 0bd, "BD7 1AA", true)).toString())
  }

  function testRetpls_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("RETPLS", 0bd, "LS1 4AP", null)).toString())
  }

  // HERIT: standard rules
  function testHerit_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("FLOODRE_NOTIFY")
    expected.add("SUPPRESS_EXCESS_WAIVER")
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("HERIT", 0bd, "BD7 1AA", true)).toString())
  }

  function testHerit_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("HERIT", 0bd, "LS1 4AP", null)).toString())
  }

  // unrecognised brand: standard rules
  function testUnknownBrand_PerilOutcomes_BradfordFloodReCeded() {
    var expected = new java.util.ArrayList<String>()
    expected.add("FLOODRE_NOTIFY")
    expected.add("SUPPRESS_EXCESS_WAIVER")
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ZZUNKN", 0bd, "BD7 1AA", true)).toString())
  }

  function testUnknownBrand_PerilOutcomes_OtherArea() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(expectedList(expected), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ZZUNKN", 0bd, "LS1 4AP", null)).toString())
  }

  function testMissingBrandIsTreatedAsAlbdir() {
    assertEquals(LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean("ALBDIR", 1000000bd, "BD7 1AA", true)).toString(), LightVanCollectionsHandler.evaluateLightVanCollectionsHandler(bean(null, 1000000bd, "BD7 1AA", true)).toString())
  }

}

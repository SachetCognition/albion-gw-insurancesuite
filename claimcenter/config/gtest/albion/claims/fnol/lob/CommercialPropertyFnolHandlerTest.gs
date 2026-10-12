package albion.claims.fnol.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.HashMap
uses org.easymock.EasyMock

class CommercialPropertyFnolHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("EstimatedLoss_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  private function withConfig(key : String, value : String, body : block()) {
    var values = new HashMap<String, String>()
    if (key != null) {
      values.put(AlbionCentre.PROPERTY_PREFIX + "." + key, value)
    }
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      body()
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler_v1(null))
    assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler_v1(bean(null, null, null, null)))
  }

  function testAlbdirReferralUsesLegacyPinnedThreshold() {
    withConfig(null, null, \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000bd, "ALBDIR", null, null)).Empty)
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000.01bd, "ALBDIR", null, null)))
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(null, "ALBDIR", null, null)).Empty)
    })
  }

  function testMissingBrandDefaultsToAlbdir() {
    withConfig(null, null, \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000bd, null, null, null)).Empty)
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000.01bd, null, null, null)))
    })
  }

  function testAlbbrkReferralTiersUseLegacyPinnedThreshold() {
    withConfig(null, null, \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(2500bd, "ALBBRK", null, null)).Empty)
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(2500.01bd, "ALBBRK", null, null)))
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000bd, "ALBBRK", null, null)))
      assertEquals({"REFER_UW", "REFER_UW_SENIOR"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000.01bd, "ALBBRK", null, null)))
    })
  }

  function testRetplsAlwaysGoesToManualReview() {
    withConfig(null, null, \ -> {
      assertEquals({"MANUAL_REVIEW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(0bd, "RETPLS", null, null)))
      assertEquals({"MANUAL_REVIEW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(1000000bd, "RETPLS", null, null)))
    })
  }

  function testUnmappedBrandIsReferred() {
    withConfig(null, null, \ -> {
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(0bd, "NOVABANK", null, null)))
    })
  }

  function testScopedConfigOverridesLegacyThreshold() {
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR + ".CommercialPropertyFnolHandler", "100", \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(100bd, "ALBDIR", null, null)).Empty)
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(100.01bd, "ALBDIR", null, null)))
    })
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBBRK + ".CommercialPropertyFnolHandler", "100", \ -> {
      assertEquals({"REFER_UW", "REFER_UW_SENIOR"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(200.01bd, "ALBBRK", null, null)))
    })
  }

  function testGlobalKeyDoesNotOverrideLegacyPinnedThreshold() {
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR, "1", \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(5000bd, "ALBDIR", null, null)).Empty)
    })
  }

  function testHeritageUsesPolarisLimit() {
    withConfig(null, null, \ -> {
      assertTrue(CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(9999.99bd, "HERIT", null, null)).Empty)
      assertEquals({"REFER_UW"}, CommercialPropertyFnolHandler.evaluateCommercialPropertyFnolHandler(bean(10000.00bd, "HERIT", null, null)))
    })
  }
}

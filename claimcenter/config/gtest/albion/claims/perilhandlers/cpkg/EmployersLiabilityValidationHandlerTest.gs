package albion.claims.perilhandlers.cpkg

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.HashMap
uses org.easymock.EasyMock

class EmployersLiabilityValidationHandlerTest extends TestBase {

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
    assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler_v1(null))
    assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler_v1(bean(null, null, null, null)))
  }

  function testAlbdirReferralUsesLegacyPinnedThreshold() {
    withConfig(null, null, \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000bd, "ALBDIR", null, null)).Empty)
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000.01bd, "ALBDIR", null, null)))
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(null, "ALBDIR", null, null)).Empty)
    })
  }

  function testMissingBrandDefaultsToAlbdir() {
    withConfig(null, null, \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000bd, null, null, null)).Empty)
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000.01bd, null, null, null)))
    })
  }

  function testAlbbrkReferralTiersUseLegacyPinnedThreshold() {
    withConfig(null, null, \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(12500bd, "ALBBRK", null, null)).Empty)
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(12500.01bd, "ALBBRK", null, null)))
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(25000bd, "ALBBRK", null, null)))
      assertEquals({"REFER_UW", "REFER_UW_SENIOR"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(25000.01bd, "ALBBRK", null, null)))
    })
  }

  function testRetplsAlwaysGoesToManualReview() {
    withConfig(null, null, \ -> {
      assertEquals({"MANUAL_REVIEW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(0bd, "RETPLS", null, null)))
      assertEquals({"MANUAL_REVIEW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(1000000bd, "RETPLS", null, null)))
    })
  }

  function testUnmappedBrandIsReferred() {
    withConfig(null, null, \ -> {
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(0bd, "NOVABANK", null, null)))
    })
  }

  function testScopedConfigOverridesLegacyThreshold() {
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR + ".EmployersLiabilityValidationHandler", "100", \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(100bd, "ALBDIR", null, null)).Empty)
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(100.01bd, "ALBDIR", null, null)))
    })
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBBRK + ".EmployersLiabilityValidationHandler", "100", \ -> {
      assertEquals({"REFER_UW", "REFER_UW_SENIOR"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(200.01bd, "ALBBRK", null, null)))
    })
  }

  function testGlobalKeyDoesNotOverrideLegacyPinnedThreshold() {
    withConfig(AlbionConfigService.KEY_REFER_THRESHOLD_ALBDIR, "1", \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000bd, "ALBDIR", null, null)).Empty)
    })
  }

  function testHeritageUsesPolarisLimit() {
    withConfig(null, null, \ -> {
      assertTrue(EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(9999.99bd, "HERIT", null, null)).Empty)
      assertEquals({"REFER_UW"}, EmployersLiabilityValidationHandler.evaluateEmployersLiabilityValidationHandler(bean(10000.00bd, "HERIT", null, null)))
    })
  }
}

package albion.policy.mta.lob

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class TravelMtaHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(TravelMtaHandler.evaluateTravelMtaHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(TravelMtaHandler.evaluateTravelMtaHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(TravelMtaHandler.evaluateTravelMtaHandler_v1(null))
  }

  function testAlbDirRefersAboveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 5000bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 5000.01bd}), null))
  }

  function testAlbBrkRefersAndSeniorTierAboveTwiceThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 12500bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 12500.01bd}), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 25000.01bd}), null))
  }

  function testRetPlsAlwaysManualReview() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "RETPLS"}), null))
  }

  function testHeritageUsesPolarisThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "SumInsured_Ext" -> 9999.99bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "SumInsured_Ext" -> 10000bd}), null))
  }

  function testMissingBrandDefaultsToAlbDir() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"SumInsured_Ext" -> 5000.01bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testUnrecognisedBrandRefers() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBHNW"}), null))
  }

  function testScopedConfigOverridesLegacyThreshold() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 2bd}), {"po.refer.threshold.albdir.TravelMtaHandler" -> "1"}))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 3bd}), {"po.refer.threshold.albbrk.TravelMtaHandler" -> "1"}))
  }

  function testUnscopedConfigDoesNotMoveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 2bd}), {"po.refer.threshold.albdir" -> "1"}))
  }
}

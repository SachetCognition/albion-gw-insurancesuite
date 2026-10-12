package albion.integration.ssp

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class SspInboundHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(SspInboundHandler.evaluateSspInboundHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(SspInboundHandler.evaluateSspInboundHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(SspInboundHandler.evaluateSspInboundHandler_v1(null))
  }

  function testAlbDirRefersAboveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 5000bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 5000.01bd}), null))
  }

  function testAlbBrkRefersAndSeniorTierAboveTwiceThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 2500bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 2500.01bd}), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 5000.01bd}), null))
  }

  function testRetPlsAlwaysManualReview() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "RETPLS"}), null))
  }

  function testHeritageUsesPolarisThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 9999.99bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 10000bd}), null))
  }

  function testMissingBrandDefaultsToAlbDir() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 5000.01bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testUnrecognisedBrandRefers() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBHNW"}), null))
  }

  function testScopedConfigOverridesLegacyThreshold() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 2bd}), {"po.refer.threshold.albdir.SspInboundHandler" -> "1"}))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 3bd}), {"po.refer.threshold.albbrk.SspInboundHandler" -> "1"}))
  }

  function testUnscopedConfigDoesNotMoveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 2bd}), {"po.refer.threshold.albdir" -> "1"}))
  }
}

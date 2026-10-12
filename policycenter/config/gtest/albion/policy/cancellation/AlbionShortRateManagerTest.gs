package albion.policy.cancellation

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionShortRateManagerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionShortRateManager.evaluateAlbionShortRateManager(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionShortRateManager.evaluateAlbionShortRateManager_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionShortRateManager.evaluateAlbionShortRateManager_v1(null))
  }

  function testAlbDirRefersAboveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 7500bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 7500.01bd}), null))
  }

  function testAlbBrkRefersAndSeniorTierAboveTwiceThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 12500bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 12500.01bd}), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 25000.01bd}), null))
  }

  function testRetPlsAlwaysManualReview() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "RETPLS"}), null))
  }

  function testHeritageUsesPolarisThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "AnnualPremium_Ext" -> 9999.99bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "AnnualPremium_Ext" -> 10000bd}), null))
  }

  function testMissingBrandDefaultsToAlbDir() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"AnnualPremium_Ext" -> 7500.01bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testUnrecognisedBrandRefers() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBHNW"}), null))
  }

  function testScopedConfigOverridesLegacyThreshold() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 2bd}), {"po.refer.threshold.albdir.AlbionShortRateManager" -> "1"}))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 3bd}), {"po.refer.threshold.albbrk.AlbionShortRateManager" -> "1"}))
  }

  function testUnscopedConfigDoesNotMoveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 2bd}), {"po.refer.threshold.albdir" -> "1"}))
  }

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionShortRateManager.ALBBRK.enabled", AlbionShortRateManager.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 1000000bd, "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBDIRKey() {
    assertEquals("brandvariant.AlbionShortRateManager.ALBDIR.enabled", AlbionShortRateManager.brandVariantKey("ALBDIR"))
  }

  function testBrandVariantALBDIROffByDefault() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBDIR.enabled" -> "false"}))
  }

  function testBrandVariantALBDIREnabledByConfig() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantALBDIROnlyAppliesToItsBrand() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionShortRateManager.ALBDIR.enabled" -> "true"}))
  }
}

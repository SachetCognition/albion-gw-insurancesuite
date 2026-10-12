package albion.policy.newbusiness

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionAggregatorMapRulesTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionAggregatorMapRules.evaluateAlbionAggregatorMap(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionAggregatorMapRules.evaluateAlbionAggregatorMap_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionAggregatorMapRules.evaluateAlbionAggregatorMap_v1(null))
  }

  function testAlbDirRefersAboveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000.01bd}), null))
  }

  function testAlbBrkRefersAndSeniorTierAboveTwiceThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000.01bd}), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 8000.01bd}), null))
  }

  function testRetPlsAlwaysManualReview() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "RETPLS"}), null))
  }

  function testHeritageUsesPolarisThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 9999.99bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 10000bd}), null))
  }

  function testMissingBrandDefaultsToAlbDir() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 10000.01bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testUnrecognisedBrandRefers() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBHNW"}), null))
  }

  function testScopedConfigOverridesLegacyThreshold() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 2bd}), {"po.refer.threshold.albdir.AlbionAggregatorMapRules" -> "1"}))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 3bd}), {"po.refer.threshold.albbrk.AlbionAggregatorMapRules" -> "1"}))
  }

  function testUnscopedConfigDoesNotMoveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 2bd}), {"po.refer.threshold.albdir" -> "1"}))
  }

  function testBrandVariantHERITKey() {
    assertEquals("brandvariant.AlbionAggregatorMapRules.HERIT.enabled", AlbionAggregatorMapRules.brandVariantKey("HERIT"))
  }

  function testBrandVariantHERITOffByDefault() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.HERIT.enabled" -> "false"}))
  }

  function testBrandVariantHERITEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantHERITOnlyAppliesToItsBrand() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionAggregatorMapRules.RETPLS.enabled", AlbionAggregatorMapRules.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAggregatorMapRules.RETPLS.enabled" -> "true"}))
  }
}

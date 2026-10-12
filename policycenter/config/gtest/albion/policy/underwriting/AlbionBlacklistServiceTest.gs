package albion.policy.underwriting

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionBlacklistServiceTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionBlacklistService.evaluateAlbionBlacklistService(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  private function surgeMonth() : boolean {
    return java.util.Calendar.getInstance().get(java.util.Calendar.MONTH) > 5
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionBlacklistService.evaluateAlbionBlacklistService_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionBlacklistService.evaluateAlbionBlacklistService_v1(null))
  }

  function testAlbDirRefersAboveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 10000bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 10000.01bd}), null))
  }

  function testAlbBrkRefersAndSeniorTierAboveTwiceThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 12500bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 12500.01bd}), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 25000.01bd}), null))
  }

  function testRetPlsAlwaysManualReview() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "RETPLS"}), null))
  }

  function testHeritageUsesPolarisThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 9999.99bd}), null))
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 10000bd}), null))
  }

  function testMissingBrandDefaultsToAlbDir() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 10000.01bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testUnrecognisedBrandRefers() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBHNW"}), null))
  }

  function testScopedConfigOverridesLegacyThreshold() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 2bd}), {"po.refer.threshold.albdir.AlbionBlacklistService" -> "1"}))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 3bd}), {"po.refer.threshold.albbrk.AlbionBlacklistService" -> "1"}))
  }

  function testUnscopedConfigDoesNotMoveLegacyThreshold() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 2bd}), {"po.refer.threshold.albdir" -> "1"}))
  }

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionBlacklistService.ALBBRK.enabled", AlbionBlacklistService.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(String.join(",", expected), run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionBlacklistService.RETPLS.enabled", AlbionBlacklistService.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBlacklistService.RETPLS.enabled" -> "true"}))
  }
}

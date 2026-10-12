package albion.policy.underwriting

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionAppetiteEngineTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionAppetiteEngine.evaluateAlbionAppetiteEngine(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionAppetiteEngine.evaluateAlbionAppetiteEngine_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionAppetiteEngine.evaluateAlbionAppetiteEngine_v1(null))
  }

  function testNoSignalsNoReferral() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 50000bd}), null))
  }

  function testEarlyClaimAloneIsBelowWatchScore() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), null), null))
  }

  function testEarlyAggregatorBusinessIsFraudWatch() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
  }

  function testOlderAggregatorBusinessIsNotFlagged() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(60), "AGGR"), null))
  }

  function testFraudReferScoreComesFromConfig() {
    assertEquals("SIU_REFER", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.fraud.refer.score" -> "35"}))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.fraud.refer.score" -> "36"}))
  }

  function testJobSignalsUseLatestPeriod() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.job(null, AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(2), null), "AGGR"), null))
  }

  function testBrandVariantHERITKey() {
    assertEquals("brandvariant.AlbionAppetiteEngine.HERIT.enabled", AlbionAppetiteEngine.brandVariantKey("HERIT"))
  }

  function testBrandVariantHERITOffByDefault() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.HERIT.enabled" -> "false"}))
  }

  function testBrandVariantHERITEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantHERITOnlyAppliesToItsBrand() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionAppetiteEngine.RETPLS.enabled", AlbionAppetiteEngine.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionAppetiteEngine.RETPLS.enabled" -> "true"}))
  }
}

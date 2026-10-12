package albion.policy.compliance

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionFairValueRulesTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionFairValueRules.evaluateAlbionFairValue(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionFairValueRules.evaluateAlbionFairValue_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionFairValueRules.evaluateAlbionFairValue_v1(null))
  }

  function testNoSignalsNoReferral() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"SumInsured_Ext" -> 50000bd}), null))
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

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionFairValueRules.ALBBRK.enabled", AlbionFairValueRules.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBDIRKey() {
    assertEquals("brandvariant.AlbionFairValueRules.ALBDIR.enabled", AlbionFairValueRules.brandVariantKey("ALBDIR"))
  }

  function testBrandVariantALBDIROffByDefault() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBDIR.enabled" -> "false"}))
  }

  function testBrandVariantALBDIREnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantALBDIROnlyAppliesToItsBrand() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFairValueRules.ALBDIR.enabled" -> "true"}))
  }
}

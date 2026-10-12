package albion.policy.underwriting

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionFloodZoneEngineTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionFloodZoneEngine.evaluateAlbionFloodZoneEngine(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionFloodZoneEngine.evaluateAlbionFloodZoneEngine_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionFloodZoneEngine.evaluateAlbionFloodZoneEngine_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicySignals), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"EstimatedLoss_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionFloodZoneEngine.ALBBRK.enabled", AlbionFloodZoneEngine.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionFloodZoneEngine.RETPLS.enabled", AlbionFloodZoneEngine.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionFloodZoneEngine.RETPLS.enabled" -> "true"}))
  }
}

package albion.policy.documents

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionBrailleRouteRulesTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionBrailleRouteRules.evaluateAlbionBrailleRoute(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionBrailleRouteRules.evaluateAlbionBrailleRoute_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionBrailleRouteRules.evaluateAlbionBrailleRoute_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicySignals), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"EstimatedLoss_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionBrailleRouteRules.ALBBRK.enabled", AlbionBrailleRouteRules.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantHERITKey() {
    assertEquals("brandvariant.AlbionBrailleRouteRules.HERIT.enabled", AlbionBrailleRouteRules.brandVariantKey("HERIT"))
  }

  function testBrandVariantHERITOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.HERIT.enabled" -> "false"}))
  }

  function testBrandVariantHERITEnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantHERITOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionBrailleRouteRules.HERIT.enabled" -> "true"}))
  }
}

package albion.policy.rating

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionRatingAdapterEngineTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicySignals), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"EstimatedLoss_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }

  function testBrandVariantALBDIRKey() {
    assertEquals("brandvariant.AlbionRatingAdapterEngine.ALBDIR.enabled", AlbionRatingAdapterEngine.brandVariantKey("ALBDIR"))
  }

  function testBrandVariantALBDIROffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.ALBDIR.enabled" -> "false"}))
  }

  function testBrandVariantALBDIREnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantALBDIROnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionRatingAdapterEngine.RETPLS.enabled", AlbionRatingAdapterEngine.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionRatingAdapterEngine.RETPLS.enabled" -> "true"}))
  }
}

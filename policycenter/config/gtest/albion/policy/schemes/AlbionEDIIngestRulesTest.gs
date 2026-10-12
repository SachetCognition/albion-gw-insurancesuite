package albion.policy.schemes

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionEDIIngestRulesTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionEDIIngestRules.evaluateAlbionEDIIngest(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionEDIIngestRules.evaluateAlbionEDIIngest_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionEDIIngestRules.evaluateAlbionEDIIngest_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicySignals), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"AnnualPremium_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"AnnualPremium_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }

  function testBrandVariantALBBRKKey() {
    assertEquals("brandvariant.AlbionEDIIngestRules.ALBBRK.enabled", AlbionEDIIngestRules.brandVariantKey("ALBBRK"))
  }

  function testBrandVariantALBBRKOffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBBRK.enabled" -> "false"}))
  }

  function testBrandVariantALBBRKEnabledByConfig() {
    assertEquals("REFER_UW,REFER_UW_SENIOR", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBBRKOnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBBRK.enabled" -> "true"}))
  }

  function testBrandVariantALBDIRKey() {
    assertEquals("brandvariant.AlbionEDIIngestRules.ALBDIR.enabled", AlbionEDIIngestRules.brandVariantKey("ALBDIR"))
  }

  function testBrandVariantALBDIROffByDefault() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBDIR.enabled" -> "false"}))
  }

  function testBrandVariantALBDIREnabledByConfig() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantALBDIROnlyAppliesToItsBrand() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionEDIIngestRules.ALBDIR.enabled" -> "true"}))
  }
}

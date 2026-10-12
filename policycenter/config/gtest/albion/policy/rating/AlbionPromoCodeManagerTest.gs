package albion.policy.rating

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionPromoCodeManagerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionPromoCodeManager.evaluateAlbionPromoCodeManager(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionPromoCodeManager.evaluateAlbionPromoCodeManager_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionPromoCodeManager.evaluateAlbionPromoCodeManager_v1(null))
  }

  function testPerilOutcomesForBradfordFloodReRisk() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}), null))
  }

  function testPerilOutcomesOutsideBradfordWithoutFloodRe() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> Boolean.FALSE}), null))
  }

  function testPerilOutcomesWithoutPostcode() {
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testPerilListIsTheLegacyList() {
    assertEquals("Flood,KeyCover,TheftHome,LegalExpenses", String.join(",", AlbionPromoCodeManager.PERIL_CODES))
  }

  function testBrandVariantHERITKey() {
    assertEquals("brandvariant.AlbionPromoCodeManager.HERIT.enabled", AlbionPromoCodeManager.brandVariantKey("HERIT"))
  }

  function testBrandVariantHERITOffByDefault() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.HERIT.enabled" -> "false"}))
  }

  function testBrandVariantHERITEnabledByConfig() {
    assertEquals("REFER_UW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "HERIT", "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantHERITOnlyAppliesToItsBrand() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.HERIT.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionPromoCodeManager.RETPLS.enabled", AlbionPromoCodeManager.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "SumInsured_Ext" -> 1000000bd, "TotalIncurred_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionPromoCodeManager.RETPLS.enabled" -> "true"}))
  }
}

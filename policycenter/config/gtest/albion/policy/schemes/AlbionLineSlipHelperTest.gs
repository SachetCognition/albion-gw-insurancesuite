package albion.policy.schemes

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionLineSlipHelperTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionLineSlipHelper.evaluateAlbionLineSlipHelper(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionLineSlipHelper.evaluateAlbionLineSlipHelper_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionLineSlipHelper.evaluateAlbionLineSlipHelper_v1(null))
  }

  function testPerilOutcomesForBradfordFloodReRisk() {
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}), null))
  }

  function testPerilOutcomesOutsideBradfordWithoutFloodRe() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> Boolean.FALSE}), null))
  }

  function testPerilOutcomesWithoutPostcode() {
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testPerilListIsTheLegacyList() {
    assertEquals("PersonalAccident,EscapeOfWater,Flood,AccidentalDamage", String.join(",", AlbionLineSlipHelper.PERIL_CODES))
  }

  function testBrandVariantALBDIRKey() {
    assertEquals("brandvariant.AlbionLineSlipHelper.ALBDIR.enabled", AlbionLineSlipHelper.brandVariantKey("ALBDIR"))
  }

  function testBrandVariantALBDIROffByDefault() {
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.ALBDIR.enabled" -> "false"}))
  }

  function testBrandVariantALBDIREnabledByConfig() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantALBDIROnlyAppliesToItsBrand() {
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.ALBDIR.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSKey() {
    assertEquals("brandvariant.AlbionLineSlipHelper.RETPLS.enabled", AlbionLineSlipHelper.brandVariantKey("RETPLS"))
  }

  function testBrandVariantRETPLSOffByDefault() {
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.RETPLS.enabled" -> "false"}))
  }

  function testBrandVariantRETPLSEnabledByConfig() {
    assertEquals("MANUAL_REVIEW", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.RETPLS.enabled" -> "true"}))
  }

  function testBrandVariantRETPLSOnlyAppliesToItsBrand() {
    assertEquals("EOW_SURVEYOR_MANDATORY,FLOODRE_NOTIFY,SUPPRESS_EXCESS_WAIVER", run(AlbionPolicyTestBeans.policyPeriod({"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 1000000bd, "AnnualPremium_Ext" -> 1000000bd, "RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.brandvariant.AlbionLineSlipHelper.RETPLS.enabled" -> "true"}))
  }
}

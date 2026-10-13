package albion.policy.compliance

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionPS215MonitorRulesTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1EnforcesThePS215Gate() {
    // heritage renewal batch binding: was true for any non-null record; now the PS21/5 gate decides
    assertTrue(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(AlbionPolicyTestBeans.bean(null)))
    assertTrue(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 300.00bd, "EquivalentNBPremium_Ext" -> 300.00bd})))
    assertFalse(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 610.00bd, "EquivalentNBPremium_Ext" -> 575.00bd})))
    assertFalse(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // EquivalentNBPremium_Ext unpopulated (see AlbionPolicyPredicates), so no comparison is made
    assertEquals("", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"TotalIncurred_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }

  function testPriceWalkBreachAboveEquivalentNewBusinessPrice() {
    assertEquals("PRICE_WALK_BREACH", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 610.00bd, "EquivalentNBPremium_Ext" -> 575.00bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 575.00bd, "EquivalentNBPremium_Ext" -> 575.00bd}), null))
  }
}

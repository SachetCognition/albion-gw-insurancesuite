package albion.policy.schemes

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
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
}

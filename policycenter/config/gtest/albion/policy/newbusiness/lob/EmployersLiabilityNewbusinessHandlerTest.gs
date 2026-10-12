package albion.policy.newbusiness.lob

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class EmployersLiabilityNewbusinessHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(EmployersLiabilityNewbusinessHandler.evaluateEmployersLiabilityNewbusinessHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(EmployersLiabilityNewbusinessHandler.evaluateEmployersLiabilityNewbusinessHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(EmployersLiabilityNewbusinessHandler.evaluateEmployersLiabilityNewbusinessHandler_v1(null))
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
    assertEquals("Flood,AccidentalDamageHome,ThirdPartyPD,AccidentalDamage", String.join(",", EmployersLiabilityNewbusinessHandler.PERIL_CODES))
  }
}

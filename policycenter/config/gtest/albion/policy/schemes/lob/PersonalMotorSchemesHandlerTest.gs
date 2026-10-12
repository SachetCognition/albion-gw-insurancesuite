package albion.policy.schemes.lob

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class PersonalMotorSchemesHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(PersonalMotorSchemesHandler.evaluatePersonalMotorSchemesHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(PersonalMotorSchemesHandler.evaluatePersonalMotorSchemesHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(PersonalMotorSchemesHandler.evaluatePersonalMotorSchemesHandler_v1(null))
  }

  function testPerilOutcomesForBradfordFloodReRisk() {
    assertEquals("EOW_SURVEYOR_MANDATORY", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}), null))
  }

  function testPerilOutcomesOutsideBradfordWithoutFloodRe() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> Boolean.FALSE}), null))
  }

  function testPerilOutcomesWithoutPostcode() {
    assertEquals("", run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testPerilListIsTheLegacyList() {
    assertEquals("AccidentalDamage,Fire,EscapeOfWater,ThirdPartyBI", String.join(",", PersonalMotorSchemesHandler.PERIL_CODES))
  }
}

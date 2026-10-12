package albion.policy.mta.lob

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class PersonalMotorMtaHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(PersonalMotorMtaHandler.evaluatePersonalMotorMtaHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(PersonalMotorMtaHandler.evaluatePersonalMotorMtaHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(PersonalMotorMtaHandler.evaluatePersonalMotorMtaHandler_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicyPredicates), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"EstimatedLoss_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"EstimatedLoss_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }
}

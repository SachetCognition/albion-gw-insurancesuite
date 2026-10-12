package albion.policy.cancellation.lob

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class EmployersLiabilityCancellationHandlerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(EmployersLiabilityCancellationHandler.evaluateEmployersLiabilityCancellationHandler(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  private function surgeMonth() : boolean {
    return java.util.Calendar.getInstance().get(java.util.Calendar.MONTH) > 5
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(EmployersLiabilityCancellationHandler.evaluateEmployersLiabilityCancellationHandler_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(EmployersLiabilityCancellationHandler.evaluateEmployersLiabilityCancellationHandler_v1(null))
  }

  function testPerilOutcomesForBradfordFloodReRisk() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(String.join(",", expected), run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA", "FloodReCeded_Ext" -> Boolean.TRUE}), null))
  }

  function testPerilOutcomesOutsideBradfordWithoutFloodRe() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(String.join(",", expected), run(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> Boolean.FALSE}), null))
  }

  function testPerilOutcomesWithoutPostcode() {
    var expected = new java.util.ArrayList<String>()
    expected.add("SUBSIDENCE_DESK")
    if (surgeMonth()) { expected.add("SUBSIDENCE_SURGE_TRIAGE") }
    assertEquals(String.join(",", expected), run(AlbionPolicyTestBeans.bean(null), null))
  }

  function testPerilListIsTheLegacyList() {
    assertEquals("AccidentalDamage,HomeEmergency,PersonalAccident,Subsidence", String.join(",", EmployersLiabilityCancellationHandler.PERIL_CODES))
  }
}

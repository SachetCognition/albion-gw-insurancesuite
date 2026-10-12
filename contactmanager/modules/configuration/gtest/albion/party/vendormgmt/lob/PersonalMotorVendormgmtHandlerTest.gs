package albion.party.vendormgmt.lob

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for PersonalMotorVendormgmtHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class PersonalMotorVendormgmtHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler_v1(null))
    assertTrue(PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(aggregatorContact(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), PersonalMotorVendormgmtHandler.evaluatePersonalMotorVendormgmtHandler(bean(new HashMap<String, Object>() {})))
    })
  }
}

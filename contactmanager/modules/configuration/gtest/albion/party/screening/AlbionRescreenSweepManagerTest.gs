package albion.party.screening

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionRescreenSweepManager. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionRescreenSweepManagerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager_v1(null))
    assertTrue(AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager_v1(bean(new HashMap<String, Object>())))
  }

  function testPerilRulesForBradfordFloodReRisk() {
    assertEquals(actions({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER", "EOW_SURVEYOR_MANDATORY", "SUBSIDENCE_DESK", "?SUBSIDENCE_SURGE_TRIAGE"}), AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> true})))
    assertEquals(actions({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER", "EOW_SURVEYOR_MANDATORY", "SUBSIDENCE_DESK", "?SUBSIDENCE_SURGE_TRIAGE"}), AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa", "FloodReCeded_Ext" -> true})))
  }

  function testPerilRulesForOrdinaryRisk() {
    assertEquals(actions({"SUBSIDENCE_DESK", "?SUBSIDENCE_SURGE_TRIAGE"}), AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> false})))
    assertEquals(actions({"SUBSIDENCE_DESK", "?SUBSIDENCE_SURGE_TRIAGE"}), AlbionRescreenSweepManager.evaluateAlbionRescreenSweepManager(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> null, "FloodReCeded_Ext" -> null})))
  }
}

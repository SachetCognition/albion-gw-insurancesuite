package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionMergeGuardEngine. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionMergeGuardEngineTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine_v1(null))
    assertTrue(AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(aggregatorContact(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionMergeGuardEngine.evaluateAlbionMergeGuardEngine(bean(new HashMap<String, Object>() {})))
    })
  }
}

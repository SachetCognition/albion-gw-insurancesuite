package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionScorerManager. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionScorerManagerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionScorerManager.evaluateAlbionScorerManager(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionScorerManager.evaluateAlbionScorerManager_v1(null))
    assertTrue(AlbionScorerManager.evaluateAlbionScorerManager_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(AlbionScorerManager.evaluateAlbionScorerManager(bean(new HashMap<String, Object>() {})), AlbionScorerManager.evaluateAlbionScorerManager(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(AlbionScorerManager.evaluateAlbionScorerManager(aggregatorContact(new HashMap<String, Object>() {})), AlbionScorerManager.evaluateAlbionScorerManager(aggregatorContact(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionScorerManager.evaluateAlbionScorerManager(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), AlbionScorerManager.evaluateAlbionScorerManager(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionScorerManager.evaluateAlbionScorerManager(bean(new HashMap<String, Object>() {})))
    })
  }
}

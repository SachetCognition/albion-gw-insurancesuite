package albion.party.screening

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionMatchQueueHelper. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionMatchQueueHelperTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper_v1(null))
    assertTrue(AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(aggregatorContact(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionMatchQueueHelper.evaluateAlbionMatchQueueHelper(bean(new HashMap<String, Object>() {})))
    })
  }
}

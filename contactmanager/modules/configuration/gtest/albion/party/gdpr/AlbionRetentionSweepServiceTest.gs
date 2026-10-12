package albion.party.gdpr

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionRetentionSweepService. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionRetentionSweepServiceTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionRetentionSweepService.evaluateAlbionRetentionSweepService_v1(null))
    assertTrue(AlbionRetentionSweepService.evaluateAlbionRetentionSweepService_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(aggregatorContact(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionRetentionSweepService.evaluateAlbionRetentionSweepService(bean(new HashMap<String, Object>() {})))
    })
  }
}

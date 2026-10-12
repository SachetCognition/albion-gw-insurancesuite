package albion.party.vendormgmt

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionIR35CheckManager. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionIR35CheckManagerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionIR35CheckManager.evaluateAlbionIR35CheckManager_v1(null))
    assertTrue(AlbionIR35CheckManager.evaluateAlbionIR35CheckManager_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(aggregatorContact(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), AlbionIR35CheckManager.evaluateAlbionIR35CheckManager(bean(new HashMap<String, Object>() {})))
    })
  }
}

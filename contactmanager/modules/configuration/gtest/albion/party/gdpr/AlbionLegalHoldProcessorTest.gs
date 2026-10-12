package albion.party.gdpr

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionLegalHoldProcessor. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionLegalHoldProcessorTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor_v1(null))
    assertTrue(AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor_v1(bean(new HashMap<String, Object>())))
  }

  function testPerilRulesForBradfordFloodReRisk() {
    assertEquals(actions({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}), AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> true})))
    assertEquals(actions({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}), AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa", "FloodReCeded_Ext" -> true})))
  }

  function testPerilRulesForOrdinaryRisk() {
    assertEquals(actions(new String[0]), AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> false})))
    assertEquals(actions(new String[0]), AlbionLegalHoldProcessor.evaluateAlbionLegalHoldProcessor(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> null, "FloodReCeded_Ext" -> null})))
  }
}

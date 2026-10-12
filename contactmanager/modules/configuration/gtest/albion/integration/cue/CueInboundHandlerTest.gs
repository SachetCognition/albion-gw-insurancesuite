package albion.integration.cue

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for CueInboundHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class CueInboundHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(CueInboundHandler.evaluateCueInboundHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(CueInboundHandler.evaluateCueInboundHandler_v1(null))
    assertTrue(CueInboundHandler.evaluateCueInboundHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testPerilRulesForBradfordFloodReRisk() {
    assertEquals(actions({"EOW_SURVEYOR_MANDATORY", "FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}), CueInboundHandler.evaluateCueInboundHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> true})))
    assertEquals(actions({"EOW_SURVEYOR_MANDATORY", "FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}), CueInboundHandler.evaluateCueInboundHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa", "FloodReCeded_Ext" -> true})))
  }

  function testPerilRulesForOrdinaryRisk() {
    assertEquals(actions(new String[0]), CueInboundHandler.evaluateCueInboundHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> false})))
    assertEquals(actions(new String[0]), CueInboundHandler.evaluateCueInboundHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> null, "FloodReCeded_Ext" -> null})))
  }
}

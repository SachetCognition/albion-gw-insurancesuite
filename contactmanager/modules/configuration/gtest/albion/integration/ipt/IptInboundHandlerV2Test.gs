package albion.integration.ipt

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for IptInboundHandlerV2. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class IptInboundHandlerV2Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(IptInboundHandlerV2.evaluateIptInboundHandlerV2(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(IptInboundHandlerV2.evaluateIptInboundHandlerV2_v1(null))
    assertTrue(IptInboundHandlerV2.evaluateIptInboundHandlerV2_v1(bean(new HashMap<String, Object>())))
  }

  function testPerilRulesForBradfordFloodReRisk() {
    assertEquals(actions(new String[0]), IptInboundHandlerV2.evaluateIptInboundHandlerV2(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> true})))
    assertEquals(actions(new String[0]), IptInboundHandlerV2.evaluateIptInboundHandlerV2(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa", "FloodReCeded_Ext" -> true})))
  }

  function testPerilRulesForOrdinaryRisk() {
    assertEquals(actions(new String[0]), IptInboundHandlerV2.evaluateIptInboundHandlerV2(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> false})))
    assertEquals(actions(new String[0]), IptInboundHandlerV2.evaluateIptInboundHandlerV2(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> null, "FloodReCeded_Ext" -> null})))
  }
}

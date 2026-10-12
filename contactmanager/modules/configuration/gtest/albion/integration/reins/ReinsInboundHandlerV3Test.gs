package albion.integration.reins

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for ReinsInboundHandlerV3. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class ReinsInboundHandlerV3Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3_v1(null))
    assertTrue(ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(bean(new HashMap<String, Object>() {"TotalIncurred_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(aggregatorContact(new HashMap<String, Object>() {"TotalIncurred_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), ReinsInboundHandlerV3.evaluateReinsInboundHandlerV3(bean(new HashMap<String, Object>() {})))
    })
  }
}

package albion.integration.printv

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for PrintvInboundHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class PrintvInboundHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(PrintvInboundHandler.evaluatePrintvInboundHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(PrintvInboundHandler.evaluatePrintvInboundHandler_v1(null))
    assertTrue(PrintvInboundHandler.evaluatePrintvInboundHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), PrintvInboundHandler.evaluatePrintvInboundHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), PrintvInboundHandler.evaluatePrintvInboundHandler(aggregatorContact(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), PrintvInboundHandler.evaluatePrintvInboundHandler(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), PrintvInboundHandler.evaluatePrintvInboundHandler(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), PrintvInboundHandler.evaluatePrintvInboundHandler(bean(new HashMap<String, Object>() {})))
    })
  }
}

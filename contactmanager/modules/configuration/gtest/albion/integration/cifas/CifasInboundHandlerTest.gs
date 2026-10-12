package albion.integration.cifas

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for CifasInboundHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class CifasInboundHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(CifasInboundHandler.evaluateCifasInboundHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(CifasInboundHandler.evaluateCifasInboundHandler_v1(null))
    assertTrue(CifasInboundHandler.evaluateCifasInboundHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testNoFraudSignalsNoAction() {
    assertEquals(actions(new String[0]), CifasInboundHandler.evaluateCifasInboundHandler(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd})))
  }

  function testAggregatorSourceAloneStaysBelowWatchScore() {
    assertEquals(actions(new String[0]), CifasInboundHandler.evaluateCifasInboundHandler(aggregatorContact(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd})))
  }

  function testConfiguredReferScoreIsApplied() {
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), CifasInboundHandler.evaluateCifasInboundHandler(aggregatorContact(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "10"}, \ -> {
      assertEquals(actions(new String[0]), CifasInboundHandler.evaluateCifasInboundHandler(bean(new HashMap<String, Object>() {})))
    })
    withConfig(new HashMap<String, String>() {"co.fraud.refer.score" -> "0"}, \ -> {
      assertEquals(actions({"SIU_REFER"}), CifasInboundHandler.evaluateCifasInboundHandler(bean(new HashMap<String, Object>() {})))
    })
  }
}

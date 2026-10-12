package albion.integration.reins

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for ReinsInboundHandlerV2. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class ReinsInboundHandlerV2Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(ReinsInboundHandlerV2.evaluateReinsInboundHandlerV2(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(ReinsInboundHandlerV2.evaluateReinsInboundHandlerV2_v1(null))
    assertTrue(ReinsInboundHandlerV2.evaluateReinsInboundHandlerV2_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), ReinsInboundHandlerV2.evaluateReinsInboundHandlerV2(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), ReinsInboundHandlerV2.evaluateReinsInboundHandlerV2(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> null})))
  }
}

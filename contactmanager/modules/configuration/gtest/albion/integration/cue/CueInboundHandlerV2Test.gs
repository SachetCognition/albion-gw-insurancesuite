package albion.integration.cue

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for CueInboundHandlerV2. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class CueInboundHandlerV2Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(CueInboundHandlerV2.evaluateCueInboundHandlerV2(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(CueInboundHandlerV2.evaluateCueInboundHandlerV2_v1(null))
    assertTrue(CueInboundHandlerV2.evaluateCueInboundHandlerV2_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), CueInboundHandlerV2.evaluateCueInboundHandlerV2(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), CueInboundHandlerV2.evaluateCueInboundHandlerV2(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> null})))
  }
}

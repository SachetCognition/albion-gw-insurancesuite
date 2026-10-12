package albion.integration.payhub

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for PayhubInboundHandlerV2. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class PayhubInboundHandlerV2Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(PayhubInboundHandlerV2.evaluatePayhubInboundHandlerV2(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(PayhubInboundHandlerV2.evaluatePayhubInboundHandlerV2_v1(null))
    assertTrue(PayhubInboundHandlerV2.evaluatePayhubInboundHandlerV2_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), PayhubInboundHandlerV2.evaluatePayhubInboundHandlerV2(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), PayhubInboundHandlerV2.evaluatePayhubInboundHandlerV2(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> null})))
  }
}

package albion.integration.dwh

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for DwhInboundHandlerV2. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class DwhInboundHandlerV2Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(DwhInboundHandlerV2.evaluateDwhInboundHandlerV2(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(DwhInboundHandlerV2.evaluateDwhInboundHandlerV2_v1(null))
    assertTrue(DwhInboundHandlerV2.evaluateDwhInboundHandlerV2_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), DwhInboundHandlerV2.evaluateDwhInboundHandlerV2(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), DwhInboundHandlerV2.evaluateDwhInboundHandlerV2(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> null})))
  }
}

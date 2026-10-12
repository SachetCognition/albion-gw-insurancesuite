package albion.integration.cifas

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for CifasInboundHandlerV3. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class CifasInboundHandlerV3Test extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(CifasInboundHandlerV3.evaluateCifasInboundHandlerV3(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(CifasInboundHandlerV3.evaluateCifasInboundHandlerV3_v1(null))
    assertTrue(CifasInboundHandlerV3.evaluateCifasInboundHandlerV3_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), CifasInboundHandlerV3.evaluateCifasInboundHandlerV3(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), CifasInboundHandlerV3.evaluateCifasInboundHandlerV3(bean(new HashMap<String, Object>() {"AnnualPremium_Ext" -> null})))
  }
}

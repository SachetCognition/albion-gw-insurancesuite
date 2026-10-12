package albion.integration.dvla

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for DvlaInboundHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class DvlaInboundHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(DvlaInboundHandler.evaluateDvlaInboundHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(DvlaInboundHandler.evaluateDvlaInboundHandler_v1(null))
    assertTrue(DvlaInboundHandler.evaluateDvlaInboundHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), DvlaInboundHandler.evaluateDvlaInboundHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), DvlaInboundHandler.evaluateDvlaInboundHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> null})))
  }
}

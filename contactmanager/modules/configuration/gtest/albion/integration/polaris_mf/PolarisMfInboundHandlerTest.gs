package albion.integration.polaris_mf

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for PolarisMfInboundHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class PolarisMfInboundHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(PolarisMfInboundHandler.evaluatePolarisMfInboundHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(PolarisMfInboundHandler.evaluatePolarisMfInboundHandler_v1(null))
    assertTrue(PolarisMfInboundHandler.evaluatePolarisMfInboundHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), PolarisMfInboundHandler.evaluatePolarisMfInboundHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), PolarisMfInboundHandler.evaluatePolarisMfInboundHandler(bean(new HashMap<String, Object>() {"SumInsured_Ext" -> null})))
  }
}

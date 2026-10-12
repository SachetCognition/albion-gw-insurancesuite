package albion.party.vendormgmt.lob

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for LightVanVendormgmtHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class LightVanVendormgmtHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler_v1(null))
    assertTrue(LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testPerilRulesForBradfordFloodReRisk() {
    assertEquals(actions(new String[0]), LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "BD7 1AA", "FloodReCeded_Ext" -> true})))
    assertEquals(actions(new String[0]), LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa", "FloodReCeded_Ext" -> true})))
  }

  function testPerilRulesForOrdinaryRisk() {
    assertEquals(actions(new String[0]), LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "LS1 4AP", "FloodReCeded_Ext" -> false})))
    assertEquals(actions(new String[0]), LightVanVendormgmtHandler.evaluateLightVanVendormgmtHandler(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> null, "FloodReCeded_Ext" -> null})))
  }
}

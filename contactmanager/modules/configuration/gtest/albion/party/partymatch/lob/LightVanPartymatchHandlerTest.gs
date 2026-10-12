package albion.party.partymatch.lob

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for LightVanPartymatchHandler. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class LightVanPartymatchHandlerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(LightVanPartymatchHandler.evaluateLightVanPartymatchHandler_v1(null))
    assertTrue(LightVanPartymatchHandler.evaluateLightVanPartymatchHandler_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 10000bd})))
    assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 10000.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "AnnualPremium_Ext" -> 10000.01bd})))
    assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "AnnualPremium_Ext" -> 10000bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 12500bd})))
    assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 12500.01bd})))
    assertEquals(actions({"REFER_UW", "REFER_UW_SENIOR"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 25000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(actions({"MANUAL_REVIEW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 0bd})))
    assertEquals(actions({"MANUAL_REVIEW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "AnnualPremium_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "AnnualPremium_Ext" -> 9999.99bd})))
    assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "AnnualPremium_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "AnnualPremium_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.LightVanPartymatchHandler" -> "100"}, \ -> {
      assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.LightVanPartymatchHandler" -> "50"}, \ -> {
      assertEquals(actions({"REFER_UW"}), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "AnnualPremium_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(actions(new String[0]), LightVanPartymatchHandler.evaluateLightVanPartymatchHandler(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "AnnualPremium_Ext" -> 10000bd})))
    })
  }
}

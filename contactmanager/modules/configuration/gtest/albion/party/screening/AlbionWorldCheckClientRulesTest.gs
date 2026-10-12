package albion.party.screening

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionWorldCheckClientRules. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionWorldCheckClientRulesTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient_v1(null))
    assertTrue(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 7500.01bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 7500bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000.01bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 8000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 0bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 9999.99bd})))
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "TotalIncurred_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionWorldCheckClientRules" -> "100"}, \ -> {
      assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionWorldCheckClientRules" -> "50"}, \ -> {
      assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionWorldCheckClientRules.evaluateAlbionWorldCheckClient(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500bd})))
    })
  }
}

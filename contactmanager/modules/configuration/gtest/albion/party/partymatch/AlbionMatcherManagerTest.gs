package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionMatcherManager. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionMatcherManagerTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionMatcherManager.evaluateAlbionMatcherManager(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionMatcherManager.evaluateAlbionMatcherManager_v1(null))
    assertTrue(AlbionMatcherManager.evaluateAlbionMatcherManager_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 5000.01bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 5000bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 2500bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 2500.01bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 5000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 0bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 9999.99bd})))
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "TotalIncurred_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionMatcherManager" -> "100"}, \ -> {
      assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionMatcherManager" -> "50"}, \ -> {
      assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionMatcherManager.evaluateAlbionMatcherManager(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000bd})))
    })
  }
}

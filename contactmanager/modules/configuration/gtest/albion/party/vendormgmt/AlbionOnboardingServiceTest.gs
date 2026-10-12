package albion.party.vendormgmt

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionOnboardingService. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionOnboardingServiceTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionOnboardingService.evaluateAlbionOnboardingService(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionOnboardingService.evaluateAlbionOnboardingService_v1(null))
    assertTrue(AlbionOnboardingService.evaluateAlbionOnboardingService_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 7500.01bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 7500bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000.01bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 8000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 0bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 9999.99bd})))
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "TotalIncurred_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionOnboardingService" -> "100"}, \ -> {
      assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionOnboardingService" -> "50"}, \ -> {
      assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOnboardingService.evaluateAlbionOnboardingService(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 7500bd})))
    })
  }
}

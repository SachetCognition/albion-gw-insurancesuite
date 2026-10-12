package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionBrokerDedupeProcessor. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionBrokerDedupeProcessorTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor_v1(null))
    assertTrue(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 5000.01bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "TotalIncurred_Ext" -> 5000bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 4000.01bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 8000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 0bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "TotalIncurred_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 9999.99bd})))
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "TotalIncurred_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "TotalIncurred_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionBrokerDedupeProcessor" -> "100"}, \ -> {
      assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionBrokerDedupeProcessor" -> "50"}, \ -> {
      assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "TotalIncurred_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionBrokerDedupeProcessor.evaluateAlbionBrokerDedupeProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "TotalIncurred_Ext" -> 5000bd})))
    })
  }
}

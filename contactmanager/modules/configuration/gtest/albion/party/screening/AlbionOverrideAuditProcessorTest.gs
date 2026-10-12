package albion.party.screening

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionOverrideAuditProcessor. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
 */
class AlbionOverrideAuditProcessorTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor_v1(null))
    assertTrue(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor_v1(bean(new HashMap<String, Object>())))
  }

  function testAlbdirReferralUsesPinnedLegacyThreshold() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "EstimatedLoss_Ext" -> 10000.01bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "EstimatedLoss_Ext" -> 10000bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000.01bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 8000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 0bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 9999.99bd})))
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "EstimatedLoss_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionOverrideAuditProcessor" -> "100"}, \ -> {
      assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionOverrideAuditProcessor" -> "50"}, \ -> {
      assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000bd})))
    })
  }
}

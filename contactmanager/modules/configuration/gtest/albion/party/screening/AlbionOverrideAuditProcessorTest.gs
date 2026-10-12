package albion.party.screening

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionOverrideAuditProcessor. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
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
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000bd})))
    assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000.01bd})))
  }

  function testMissingBrandDefaultsToAlbdirRules() {
    assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "EstimatedLoss_Ext" -> 10000.01bd})))
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> null, "EstimatedLoss_Ext" -> 10000bd})))
  }

  function testAlbbrkReferralAndSeniorTier() {
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000bd})))
    assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 4000.01bd})))
    assertEquals(actions({"REFER_UW", "REFER_UW_SENIOR"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 8000.01bd})))
  }

  function testRetplsAlwaysManualReview() {
    assertEquals(actions({"MANUAL_REVIEW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 0bd})))
    assertEquals(actions({"MANUAL_REVIEW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "RETPLS", "EstimatedLoss_Ext" -> 1000000bd})))
  }

  function testHeritageBookPinnedAt9999_99() {
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 9999.99bd})))
    assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "HERIT", "EstimatedLoss_Ext" -> 10000bd})))
  }

  function testUnrecognisedBrandRefersToUnderwriting() {
    assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "TMP69", "EstimatedLoss_Ext" -> 0bd})))
  }

  function testNullAmountTreatedAsZero() {
    assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> null})))
  }

  function testScopedConfigKeyOverridesLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir.AlbionOverrideAuditProcessor" -> "100"}, \ -> {
      assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 100.01bd})))
    })
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albbrk.AlbionOverrideAuditProcessor" -> "50"}, \ -> {
      assertEquals(actions({"REFER_UW"}), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBBRK", "EstimatedLoss_Ext" -> 50.01bd})))
    })
  }

  function testGlobalConfigKeyDoesNotOverrideLegacyThreshold() {
    withConfig(new HashMap<String, String>() {"co.refer.threshold.albdir" -> "1"}, \ -> {
      assertEquals(actions(new String[0]), AlbionOverrideAuditProcessor.evaluateAlbionOverrideAuditProcessor(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR", "EstimatedLoss_Ext" -> 10000bd})))
    })
  }
}

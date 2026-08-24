package albion.feedstatus

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.util.AlbionFeatureFlags
uses gw.testharness.TestBase

/*
 * FeedStatusStateMachineCandidateTest - pins the candidate against every observed transition
 * and non-transition in docs/architecture/FEEDSTATUS-STATE-MACHINE.md. Contract tests first;
 * corrections (ambiguous comparisons, swallowed exceptions, scheduling, unbounded queries)
 * belong to Stream 3D and are NOT tested as changed here.
 */
class FeedStatusStateMachineCandidateTest extends TestBase {

  /* ---- contract 1: external strings, byte-exact ---- */

  function testExternalStringsAreUnchanged() {
    assertEquals({"PENDING", "SENT", "ACK", "NAK", "ESCALATED"},
        FeedStatusStateMachineCandidate.INTENDED_STATUSES)
  }

  /* ---- the estate-wide consumer table: 29 batches = 7 SENT + 10 ESCALATED + 12 leave ---- */

  function testAllTwentyNineBatchContractsArePinned() {
    var contracts = FeedStatusStateMachineCandidate.BATCH_CONTRACTS
    assertEquals(29, contracts.size())
    var sent = 0
    var escalated = 0
    var leave = 0
    for (kind in contracts.values()) {
      if (kind == FeedStatusStateMachineCandidate.KIND_TO_SENT) { sent++ }
      else if (kind.startsWith(FeedStatusStateMachineCandidate.KIND_TO_ESCALATED)) { escalated++ }
      else { leave++ }
    }
    assertEquals(7, sent)
    assertEquals(10, escalated)
    assertEquals(12, leave)
  }

  /* ---- contract 3: PENDING -> SENT stamps LastBatchRun_Ext ---- */

  function testSentBatchesStampLastBatchRun() {
    var result = FeedStatusStateMachineCandidate.batchApply("AlbionFraudEscalationBatch", "PENDING", 0)
    assertTrue(result.Applied)
    assertEquals("SENT", result.NewStatus)
    assertTrue(result.StampLastBatchRun)
    assertFalse(result.RaiseActivity)
  }

  /* ---- contract 4: exact age thresholds, strictly greater than ---- */

  function testEscalationThresholdsAreStrictlyGreaterThan() {
    // AlbionRenewalFeedBatch escalates at > 14 days
    var atThreshold = FeedStatusStateMachineCandidate.batchApply("AlbionRenewalFeedBatch", "PENDING", 14)
    assertFalse(atThreshold.Applied)
    assertEquals("PENDING", atThreshold.NewStatus)
    var overThreshold = FeedStatusStateMachineCandidate.batchApply("AlbionRenewalFeedBatch", "PENDING", 15)
    assertTrue(overThreshold.Applied)
    assertEquals("ESCALATED", overThreshold.NewStatus)
    assertTrue(overThreshold.RaiseActivity)          // existing activity creation preserved
    assertFalse(overThreshold.StampLastBatchRun)     // escalation does NOT stamp LastBatchRun_Ext
    // 30-day sweeps
    assertEquals("PENDING", FeedStatusStateMachineCandidate.batchApply("AlbionGdprSweepBatch", "PENDING", 30).NewStatus)
    assertEquals("ESCALATED", FeedStatusStateMachineCandidate.batchApply("AlbionGdprSweepBatch", "PENDING", 31).NewStatus)
    // 5-day escalations
    assertEquals("PENDING", FeedStatusStateMachineCandidate.batchApply("AlbionFnolEscalationBatch", "PENDING", 5).NewStatus)
    assertEquals("ESCALATED", FeedStatusStateMachineCandidate.batchApply("AlbionFnolEscalationBatch", "PENDING", 6).NewStatus)
    // 10-day partymatch
    assertEquals("PENDING", FeedStatusStateMachineCandidate.batchApply("AlbionPartymatchEscalationBatch", "PENDING", 10).NewStatus)
    assertEquals("ESCALATED", FeedStatusStateMachineCandidate.batchApply("AlbionPartymatchEscalationBatch", "PENDING", 11).NewStatus)
  }

  /* ---- contract 5: the 12 processing batches leave PENDING ---- */

  function testProcessingBatchesLeaveStatusPending() {
    for (batch in {"AlbionCollectionsFeedBatch", "AlbionTppdFeedBatch", "AlbionMtaSweepBatch", "AlbionScreeningFeedBatch"}) {
      var result = FeedStatusStateMachineCandidate.batchApply(batch, "PENDING", 999)
      assertFalse(result.Applied)
      assertEquals("PENDING", result.NewStatus)
      assertFalse(result.StampLastBatchRun)
    }
  }

  /* ---- contract 2: all 222 rules assign PENDING + review activity, any prior value ---- */

  function testRuleAssignAlwaysWritesPendingAndRaisesActivity() {
    for (prior in {null, "SENT", "ESCALATED", "POLARIS", "ALBBRK", "CLEAR", "garbage"}) {
      var result = FeedStatusStateMachineCandidate.ruleAssign(prior)
      assertTrue(result.Applied)
      assertEquals("PENDING", result.NewStatus)
      assertTrue(result.RaiseActivity)
    }
  }

  /* ---- contract 6: legacy-invalid values detected, never rewritten ---- */

  function testLegacyInvalidValuesAreDetectedNotRewritten() {
    for (value in {"POLARIS", "ALBDIR", "ALBBRK", "HERIT"}) {
      assertEquals(FeedStatusStateMachineCandidate.CLASS_LEGACY_INVALID,
          FeedStatusStateMachineCandidate.classify(value))
      var result = FeedStatusStateMachineCandidate.batchApply("AlbionFraudEscalationBatch", value, 100)
      assertFalse(result.Applied)
      assertEquals(value, result.NewStatus)   // untouched
      assertTrue(result.Note.contains("LEGACY_INVALID"))
    }
    // RETPLS is a brand but NOT an observed FeedStatus_Ext comparison value - it stays unrecognised
    assertEquals(FeedStatusStateMachineCandidate.CLASS_UNRECOGNISED,
        FeedStatusStateMachineCandidate.classify("RETPLS"))
  }

  /* ---- contract 7: administrative values need explicit policy ---- */

  function testAdministrativeValuesRequireExplicitPolicyAndAreNeverMoved() {
    for (value in {"CLEAR", "MATCHED", "FIXED_BY_SQL"}) {
      assertEquals(FeedStatusStateMachineCandidate.CLASS_ADMINISTRATIVE,
          FeedStatusStateMachineCandidate.classify(value))
      assertTrue(FeedStatusStateMachineCandidate.requiresExplicitPolicy(value))
      var result = FeedStatusStateMachineCandidate.batchApply("AlbionRenewalFeedBatch", value, 999)
      assertFalse(result.Applied)
      assertEquals(value, result.NewStatus)
    }
    assertFalse(FeedStatusStateMachineCandidate.requiresExplicitPolicy("PENDING"))
  }

  /* ---- contract 8: retry separate from business status ---- */

  function testRowFailureKeepsStatusAndCarriesRetrySeparately() {
    var result = FeedStatusStateMachineCandidate.rowFailure("PENDING")
    assertFalse(result.Applied)
    assertEquals("PENDING", result.NewStatus)   // visible status identical to legacy behaviour
    assertEquals(FeedStatusTransitionResult.RETRY_NEXT_RUN, result.RetryOutcome)
  }

  /* ---- contract 9: ACK/NAK declared but with no producer - candidate must not invent one ---- */

  function testAckNakRowsAreNotSelectedAndNotChanged() {
    for (value in {"ACK", "NAK"}) {
      var result = FeedStatusStateMachineCandidate.batchApply("AlbionRecoveriesSweepBatch", value, 999)
      assertFalse(result.Applied)
      assertEquals(value, result.NewStatus)
    }
  }

  function testUnknownBatchIsRejected() {
    var failed = false
    try {
      FeedStatusStateMachineCandidate.batchApply("NotABatch", "PENDING", 1)
    } catch (e : IllegalArgumentException) {
      failed = true
    }
    assertTrue(failed)
  }

  /* ---- shadow comparator: legacy replay vs candidate ---- */

  function testShadowMatchesALegacyBatchReplayAcrossTheMatrix() {
    var recorder = new InMemoryShadowDiffRecorder()
    // legacy replay of AlbionRenewalFeedBatch.process(): > 14 days -> ESCALATED + activity
    for (age in {0, 14, 15, 400}) {
      var result = FeedStatusShadow.shadowBatchApply("AlbionRenewalFeedBatch", "ALBDIR", "PENDING", age,
          \ -> legacyRenewalReplay("PENDING", age), recorder)
      assertEquals(ReconciliationResult.MATCH, result.Outcome)
    }
    // legacy replay of AlbionFraudEscalationBatch.process(): SENT + LastBatchRun_Ext stamp
    var sent = FeedStatusShadow.shadowBatchApply("AlbionFraudEscalationBatch", "ALBBRK", "PENDING", 3,
        \ -> "SENT|stampLastBatchRun=true|activity=false|retry=NONE", recorder)
    assertEquals(ReconciliationResult.MATCH, sent.Outcome)
    // rule replay: assign PENDING + review activity
    var rule = FeedStatusShadow.shadowRuleAssign("validation", "HERIT", "POLARIS",
        \ -> "PENDING|stampLastBatchRun=false|activity=true|retry=NONE", recorder)
    assertEquals(ReconciliationResult.MATCH, rule.Outcome)
    assertEquals(0, recorder.RecordCount)
  }

  function testShadowRecordsADivergentLegacyConsumerAsBreach() {
    var recorder = new InMemoryShadowDiffRecorder()
    // a hypothetical drifted consumer that escalates AT the threshold instead of above it
    var result = FeedStatusShadow.shadowBatchApply("AlbionRenewalFeedBatch", "ALBDIR", "PENDING", 14,
        \ -> "ESCALATED|stampLastBatchRun=false|activity=true|retry=NONE", recorder)
    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertEquals(1, recorder.RecordCount)
    assertTrue(recorder.Results.get(0).Notes.get(0).contains("Stream 3D"))
  }

  function testShadowIsDormantByDefault() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(FeedStatusShadow.isShadowEnabled("ALBDIR"))
    assertFalse(AlbionFeatureFlags.isEnabled(FeedStatusShadow.CENTRE, FeedStatusShadow.FEATURE))
  }

  private function legacyRenewalReplay(status : String, days : int) : String {
    // verbatim replay of AlbionRenewalFeedBatch.process() semantics
    if (days > 14) {
      return "ESCALATED|stampLastBatchRun=false|activity=true|retry=NONE"
    }
    return status + "|stampLastBatchRun=false|activity=false|retry=NONE"
  }
}

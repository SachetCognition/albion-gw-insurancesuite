package albion.feedstatus

uses albion.integration.shadow.LoggingShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowDiffRecorder
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.util.AlbionFeatureFlags

/*
 * FeedStatusShadow - Phase 2 Stream 2D comparator. Replays what a legacy consumer (one of
 * the 29 batches or 222 rules) did to a row beside what FeedStatusStateMachineCandidate
 * says should happen, through ShadowRunner. The comparison covers the status string AND the
 * side effects (LastBatchRun_Ext stamp, activity, retry outcome) via
 * FeedStatusTransitionResult.toComparableString(). Legacy remains authoritative; the
 * candidate never writes to any entity in Phase 2.
 *
 * Flag: bi.feature.shadow.feedstatus.enabled (+ .brands / .brand.<CODE>.enabled).
 * OFF in every committed environment file.
 */
class FeedStatusShadow {

  public static final var CENTRE : String = AlbionFeatureFlags.CENTRE_BILLINGCENTER
  public static final var FEATURE : String = "shadow.feedstatus"

  public static final var DRIFT_NOTE : String =
      "FeedStatus_Ext candidate state machine vs legacy consumer; external strings PENDING/SENT/ACK/NAK/ESCALATED unchanged; POLARIS/ALBDIR/ALBBRK/HERIT detected as legacy-invalid, never rewritten; flip is gated Stream 3D per centre; scheduler duplication / unbounded 1.4M selection / retry state are separate individually-gated changes"

  /**
   * Shadow one batch row action. legacyComparable must describe what the legacy batch
   * actually did, in FeedStatusTransitionResult.toComparableString() form.
   */
  public static function shadowBatchApply(batchName : String, brandCode : String,
                                          currentStatus : String, ageDays : int,
                                          legacyComparable : block() : Object,
                                          recorder : ShadowDiffRecorder) : ReconciliationResult {
    return runner(recorder).run("FEEDSTATUS/" + batchName, brandCode, legacyComparable,
        \ -> FeedStatusStateMachineCandidate.batchApply(batchName, currentStatus, ageDays).toComparableString())
  }

  /** Shadow one rule assignment (all 222 rules: assign PENDING + raise review activity). */
  public static function shadowRuleAssign(ruleFamily : String, brandCode : String,
                                          currentStatus : String,
                                          legacyComparable : block() : Object,
                                          recorder : ShadowDiffRecorder) : ReconciliationResult {
    return runner(recorder).run("FEEDSTATUS/rules/" + ruleFamily, brandCode, legacyComparable,
        \ -> FeedStatusStateMachineCandidate.ruleAssign(currentStatus).toComparableString())
  }

  public static function isShadowEnabled(brandCode : String) : boolean {
    return AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brandCode)
  }

  private static function runner(recorder : ShadowDiffRecorder) : ShadowRunner {
    return new ShadowRunner(recorder == null ? new LoggingShadowDiffRecorder() : recorder,
        ShadowTolerance.exact()).withNote(DRIFT_NOTE)
  }
}

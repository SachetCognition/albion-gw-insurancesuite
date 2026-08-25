package albion.feedstatus

uses java.util.LinkedHashMap
uses java.util.Map

/*
 * FeedStatusStateMachineCandidate - Phase 2 Stream 2D CANDIDATE state machine for the
 * FeedStatus_Ext varchar, built to the "Future state-machine contract" in
 * docs/architecture/FEEDSTATUS-STATE-MACHINE.md. DORMANT: nothing authoritative calls it;
 * it is reached only through FeedStatusShadow and tests. The 29 batch consumers and 222
 * rules keep writing the column directly until Stream 3D flips them per centre.
 *
 * Contract obligations implemented here (numbers refer to the doc):
 *  1. external strings unchanged: PENDING/SENT/ACK/NAK/ESCALATED, byte-exact;
 *  2. rule transition: any matching record -> PENDING (all 222 rules), preserved verbatim;
 *  3. the seven PENDING -> SENT batch transitions stamp LastBatchRun_Ext;
 *  4. the ten PENDING -> ESCALATED transitions keep their exact age thresholds
 *     (STRICTLY greater than, days) and raise the existing escalation activity;
 *  5. the twelve processing batches leave the status PENDING - no replacement transition
 *     is invented for them;
 *  6. POLARIS/ALBDIR/ALBBRK/HERIT are LEGACY-INVALID status values: detected and reported,
 *     NEVER silently rewritten;
 *  7. CLEAR/MATCHED/FIXED_BY_SQL are administrative data-fix values requiring an explicit
 *     migration policy - the candidate refuses to transition them;
 *  8. row failure/retry ("swallowed for years") is represented separately from business
 *     status: the status stays PENDING and the retry outcome is RETRY_NEXT_RUN;
 *  9. every transition is conditional on the expected prior state (batches only ever
 *     selected PENDING rows, so PENDING is the expected prior state for all 29).
 * Items 10 (audit columns) and 11 (single scheduler, bounded selection) are Stream 3D
 * follow-ups, each separately gated; they intentionally have no Phase 2 behaviour.
 */
class FeedStatusStateMachineCandidate {

  // contract item 1 - external strings, never altered
  public static final var PENDING : String = "PENDING"
  public static final var SENT : String = "SENT"
  public static final var ACK : String = "ACK"
  public static final var NAK : String = "NAK"
  public static final var ESCALATED : String = "ESCALATED"

  public static final var INTENDED_STATUSES : List<String> = {PENDING, SENT, ACK, NAK, ESCALATED}

  /** SQL data-fix vocabulary - requires an explicit migration policy (contract item 7). */
  public static final var ADMINISTRATIVE_VALUES : List<String> = {"CLEAR", "MATCHED", "FIXED_BY_SQL"}

  /** Brand/source literals ambiguously compared as statuses in 177 rules (contract item 6). */
  public static final var LEGACY_INVALID_VALUES : List<String> = {"POLARIS", "ALBDIR", "ALBBRK", "HERIT"}

  public static final var CLASS_INTENDED : String = "INTENDED"
  public static final var CLASS_ADMINISTRATIVE : String = "ADMINISTRATIVE"
  public static final var CLASS_LEGACY_INVALID : String = "LEGACY_INVALID"
  public static final var CLASS_NULL : String = "NULL"
  public static final var CLASS_UNRECOGNISED : String = "UNRECOGNISED"

  // batch transition kinds, straight from the doc's consumer table
  public static final var KIND_TO_SENT : String = "TO_SENT"
  public static final var KIND_TO_ESCALATED : String = "TO_ESCALATED"
  public static final var KIND_LEAVE_PENDING : String = "LEAVE_PENDING"

  /**
   * All 29 batch consumers with their observed transition and age threshold (days, strict >).
   * Source: docs/architecture/FEEDSTATUS-STATE-MACHINE.md batch table. 7 x SENT,
   * 10 x ESCALATED, 12 x leave-PENDING. The full estate-wide table is carried in every
   * centre so cross-centre reconciliation reports agree on the contract.
   */
  public static final var BATCH_CONTRACTS : Map<String, String> = contracts()

  private static function contracts() : Map<String, String> {
    var m = new LinkedHashMap<String, String>()
    // BC
    m.put("AlbionCollectionsFeedBatch", KIND_LEAVE_PENDING)
    m.put("AlbionDisbursementsFeedBatch", KIND_LEAVE_PENDING)
    m.put("AlbionInstalmentsHousekeepingBatch", KIND_LEAVE_PENDING)
    m.put("AlbionReconciliationEscalationBatch", KIND_TO_SENT)
    // CC
    m.put("AlbionBodilyinjuryEscalationBatch", KIND_TO_ESCALATED + ":14")
    m.put("AlbionCatEscalationBatch", KIND_LEAVE_PENDING)
    m.put("AlbionComplaintsHousekeepingBatch", KIND_LEAVE_PENDING)
    m.put("AlbionFnolEscalationBatch", KIND_TO_ESCALATED + ":5")
    m.put("AlbionFraudEscalationBatch", KIND_TO_SENT)
    m.put("AlbionPaymentsSweepBatch", KIND_TO_ESCALATED + ":5")
    m.put("AlbionPropertyclaimsFeedBatch", KIND_TO_SENT)
    m.put("AlbionRecoveriesSweepBatch", KIND_TO_SENT)
    m.put("AlbionReservesEscalationBatch", KIND_TO_SENT)
    m.put("AlbionSegmentationEscalationBatch", KIND_LEAVE_PENDING)
    m.put("AlbionSupplychainSweepBatch", KIND_TO_SENT)
    m.put("AlbionTppdFeedBatch", KIND_LEAVE_PENDING)
    // CM
    m.put("AlbionGdprSweepBatch", KIND_TO_ESCALATED + ":30")
    m.put("AlbionPartymatchEscalationBatch", KIND_TO_ESCALATED + ":10")
    m.put("AlbionScreeningFeedBatch", KIND_LEAVE_PENDING)
    m.put("AlbionVendormgmtHousekeepingBatch", KIND_TO_ESCALATED + ":5")
    // PC
    m.put("AlbionCancellationHousekeepingBatch", KIND_TO_SENT)
    m.put("AlbionComplianceEscalationBatch", KIND_LEAVE_PENDING)
    m.put("AlbionDocumentsHousekeepingBatch", KIND_TO_ESCALATED + ":30")
    m.put("AlbionMtaSweepBatch", KIND_LEAVE_PENDING)
    m.put("AlbionNewbusinessHousekeepingBatch", KIND_LEAVE_PENDING)
    m.put("AlbionRatingEscalationBatch", KIND_TO_ESCALATED + ":5")
    m.put("AlbionRenewalFeedBatch", KIND_TO_ESCALATED + ":14")
    m.put("AlbionSchemesEscalationBatch", KIND_TO_ESCALATED + ":5")
    m.put("AlbionUnderwritingFeedBatch", KIND_LEAVE_PENDING)
    return m
  }

  /** Contract item 6/7 first: classify a raw column value without changing it. */
  public static function classify(value : String) : String {
    if (value == null) { return CLASS_NULL }
    if (INTENDED_STATUSES.contains(value)) { return CLASS_INTENDED }
    if (ADMINISTRATIVE_VALUES.contains(value)) { return CLASS_ADMINISTRATIVE }
    if (LEGACY_INVALID_VALUES.contains(value)) { return CLASS_LEGACY_INVALID }
    return CLASS_UNRECOGNISED
  }

  /**
   * Contract item 2 - what any of the 222 rules does: assign PENDING and raise a review
   * activity, regardless of the prior value. The prior value's classification is carried
   * as the note so invalid/ambiguous values are DETECTED (item 6) while the write itself
   * stays exactly what production rules do today.
   */
  public static function ruleAssign(currentValue : String) : FeedStatusTransitionResult {
    return new FeedStatusTransitionResult(true, PENDING, false, true,
        FeedStatusTransitionResult.RETRY_NONE, "prior=" + classify(currentValue))
  }

  /**
   * Contract items 3/4/5/9 - what one of the 29 batches does to one selected row.
   * Conditional on the expected prior state: batches only query PENDING, so any other
   * current value is NOT selected and NOT changed (administrative and invalid values are
   * reported through the note, never rewritten - items 6 and 7).
   */
  public static function batchApply(batchName : String, currentStatus : String, ageDays : int) : FeedStatusTransitionResult {
    var contract = BATCH_CONTRACTS.get(batchName)
    if (contract == null) {
      throw new IllegalArgumentException("unknown batch consumer: " + batchName)
    }
    if (currentStatus != PENDING) {
      // not selected by the PENDING-only query; value stays untouched whatever it is
      return new FeedStatusTransitionResult(false, currentStatus, false, false,
          FeedStatusTransitionResult.RETRY_NONE, "not-selected classification=" + classify(currentStatus))
    }
    if (contract == KIND_TO_SENT) {
      // item 3: SENT always stamps LastBatchRun_Ext (direct SQL that writes SENT does not - that
      // inconsistency belongs to the SQL scripts and is preserved by NOT modelling them here)
      return new FeedStatusTransitionResult(true, SENT, true, false,
          FeedStatusTransitionResult.RETRY_NONE, null)
    }
    if (contract.startsWith(KIND_TO_ESCALATED)) {
      var threshold = java.lang.Integer.parseInt(contract.split(":")[1])
      if (ageDays > threshold) {   // STRICTLY greater than - verbatim from every escalation batch
        return new FeedStatusTransitionResult(true, ESCALATED, false, true,
            FeedStatusTransitionResult.RETRY_NONE, null)
      }
      return new FeedStatusTransitionResult(false, PENDING, false, false,
          FeedStatusTransitionResult.RETRY_NONE, null)
    }
    // item 5: the 12 processing batches leave the status PENDING; no transition is invented
    return new FeedStatusTransitionResult(false, PENDING, false, false,
        FeedStatusTransitionResult.RETRY_NONE, null)
  }

  /**
   * Contract item 8 - a row failure inside a batch: the legacy behaviour is swallow, print,
   * leave PENDING, retry on next run. The candidate keeps the business status IDENTICAL and
   * carries the retry outcome separately instead of losing it in stdout.
   */
  public static function rowFailure(currentStatus : String) : FeedStatusTransitionResult {
    return new FeedStatusTransitionResult(false, currentStatus, false, false,
        FeedStatusTransitionResult.RETRY_NEXT_RUN, "row exception swallowed; eligible next run")
  }

  /**
   * Contract item 7 - administrative values need an explicit, signed-off migration policy.
   * Until one exists the candidate refuses to move them anywhere.
   */
  public static function requiresExplicitPolicy(value : String) : boolean {
    return classify(value) == CLASS_ADMINISTRATIVE
  }
}

package albion.integration.shadow

/*
 * CutoverRouter - Phase 3A per-brand cut-over seam with reverse shadow and auto-revert.
 *
 * Semantics when a builder+brand cut-over flag is ON (allowed only after that brand's Phase 2
 * reconciliation is GREEN - enforced by tools/ci/verify_phase1_scaffold.py against
 * tools/ci/reconciliation-status.csv):
 *
 *   - the CANDIDATE output is authoritative for the brand;
 *   - the LEGACY builder still runs on every record for the whole bake period, acting as the
 *     REVERSE shadow, so the retired path keeps being exercised and stays instantly restorable;
 *   - legacy failures still propagate exactly as production fails today (both builders preserve
 *     the same quirks, so e.g. the negative-nine overpunch failure throws on both paths);
 *   - ANY difference - including a candidate failure - is recorded through the ShadowDiffRecorder
 *     (the auto-alert) and the record AUTO-REVERTS to the legacy bytes, so a divergent candidate
 *     can never change what leaves the estate. Rollback of the whole brand is the same flag
 *     turned off; no deploy, no data change.
 *
 * Because outputs only differ when something is wrong, a green bake emits bytes that are
 * IDENTICAL to legacy - the flag changes which implementation is trusted, not what is sent.
 */
class CutoverRouter {

  public static final var AUTO_REVERT_NOTE : String =
      "PHASE3-CUTOVER: candidate authoritative for this brand; reverse-shadow difference auto-alerts and auto-reverts this record to the legacy output"

  public static function route(feedName : String,
                               brandCode : String,
                               recorder : ShadowDiffRecorder,
                               driftNote : String,
                               legacy : block() : Object,
                               candidate : block() : Object) : String {
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
        .withNote(driftNote)
        .withNote(AUTO_REVERT_NOTE)
    var result = runner.run(feedName, brandCode, legacy, candidate)
    if (result.Matched) {
      return result.CandidateOutput as String   // candidate authoritative; bytes equal legacy
    }
    // Auto-revert: the diff (or candidate failure) has been recorded above; emit legacy bytes.
    return result.AuthoritativeOutput as String
  }
}

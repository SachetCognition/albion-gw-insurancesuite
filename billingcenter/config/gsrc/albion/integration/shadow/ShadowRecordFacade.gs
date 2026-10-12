package albion.integration.shadow

uses albion.config.AlbionConfigService
uses albion.integration.common.BrandMappingService
uses java.util.concurrent.locks.ReentrantLock

/**
 * Strangler facade between a feed's messaging transport and its record builders. Every outbound record for a wired
 * feed is produced here.
 *
 *  - Flags off (the default in every environment): returns legacy(src) and does nothing else. No candidate runs,
 *    no extra field is read.
 *  - AlbionConfigService.isShadowEnabled(feed, brand) true: ShadowRunner runs legacy then candidate, records any
 *    difference through Recorder, counts every comparison in Ledger, and returns the legacy record.
 *  - AlbionConfigService.isCutoverEnabled(feed, brand) true (Phase 3; requires the shadow run above): the same
 *    comparison runs with legacy as the reverse shadow, and the candidate record is returned when it reconciles
 *    (MATCH or WITHIN_TOLERANCE). On BREACH or CANDIDATE_ERROR the legacy record is returned for that message, the
 *    difference is recorded and Ledger counts a cutover revert. Legacy failures still propagate, as today.
 *  - An invalid flag value is reported and treated as off, so flag configuration can never stop a feed.
 *
 * Flags: <prefix>.feature.shadow.enabled / .feeds / .brands (docs/migration/strangler-phase1.md) and
 * <prefix>.feature.cutover.feeds (docs/migration/strangler-phase2-3.md). Rollback: clear feature.cutover.feeds.
 */
class ShadowRecordFacade {

  static final var LOCK : ReentrantLock = new ReentrantLock()
  static var _recorder : ShadowDiffRecorder
  static var _ledger : ShadowReconciliationLedger

  private construct() {
  }

  /** Recorder for shadow differences; LoggingShadowDiffRecorder unless replaced. */
  static property get Recorder() : ShadowDiffRecorder {
    using (LOCK) {
      if (_recorder == null) {
        _recorder = new LoggingShadowDiffRecorder()
      }
      return _recorder
    }
  }

  /** Replaces the recorder (tests, offline replay, a persistent sink). Pass null to restore the default. */
  static function setRecorder(recorder : ShadowDiffRecorder) {
    using (LOCK) {
      _recorder = recorder
    }
  }

  /** Reconciliation counts for every shadow comparison on this server since start-up or the last drain(). */
  static property get Ledger() : ShadowReconciliationLedger {
    using (LOCK) {
      if (_ledger == null) {
        _ledger = new ShadowReconciliationLedger()
      }
      return _ledger
    }
  }

  /** Replaces the ledger (tests, offline replay). Pass null to restore a fresh default. */
  static function setLedger(ledger : ShadowReconciliationLedger) {
    using (LOCK) {
      _ledger = ledger
    }
  }

  static function buildRecord(feed : String, src : KeyableBean,
                              legacy : block(bean : KeyableBean) : String,
                              candidate : block(bean : KeyableBean) : String) : String {
    if (not shadowEnabled(feed, src)) {
      return legacy(src)
    }
    var cutover = cutoverEnabled(feed, src)
    var result = new ShadowRunner(Recorder, ShadowTolerance.exact())
        .run(feed, BrandMappingService.brandOf(src), \ -> legacy(src), \ -> candidate(src))
    var emitCandidate = cutover and (result.Matched or result.WithinTolerance)
    try {
      Ledger.observe(result, cutover, emitCandidate)
    } catch (failure : Throwable) {
      print("albion.integration.shadow: ledger failed for feed " + feed + " : " + failure.Class.Name)
    }
    return (emitCandidate ? result.CandidateOutput : result.AuthoritativeOutput) as String
  }

  static function shadowEnabled(feed : String, src : KeyableBean) : boolean {
    try {
      var config = AlbionConfigService.Instance
      return config.ShadowRunEnabled and config.isShadowEnabled(feed, BrandMappingService.brandOf(src))
    } catch (e : IllegalStateException) {
      print("albion.integration.shadow: shadow run disabled for feed " + feed + " : " + e.Message)
      return false
    }
  }

  static function cutoverEnabled(feed : String, src : KeyableBean) : boolean {
    try {
      return AlbionConfigService.Instance.isCutoverEnabled(feed, BrandMappingService.brandOf(src))
    } catch (e : IllegalStateException) {
      print("albion.integration.shadow: cutover disabled for feed " + feed + " : " + e.Message)
      return false
    }
  }
}

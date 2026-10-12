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
 *    difference through Recorder, and returns the legacy record.
 *  - An invalid flag value is reported and treated as off, so flag configuration can never stop a feed.
 *
 * Flags: <prefix>.feature.shadow.enabled / .feeds / .brands (docs/migration/strangler-phase1.md).
 */
class ShadowRecordFacade {

  static final var LOCK : ReentrantLock = new ReentrantLock()
  static var _recorder : ShadowDiffRecorder

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

  static function buildRecord(feed : String, src : KeyableBean,
                              legacy : block(bean : KeyableBean) : String,
                              candidate : block(bean : KeyableBean) : String) : String {
    if (not shadowEnabled(feed, src)) {
      return legacy(src)
    }
    var result = new ShadowRunner(Recorder, ShadowTolerance.exact())
        .run(feed, BrandMappingService.brandOf(src), \ -> legacy(src), \ -> candidate(src))
    return result.AuthoritativeOutput as String
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
}

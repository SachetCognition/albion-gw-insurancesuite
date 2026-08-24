package albion.integration.shadow

uses org.slf4j.Logger
uses org.slf4j.LoggerFactory

/*
 * LoggingShadowDiffRecorder - default recorder. Writes one structured line per
 * non-matching shadow run through the configured logging appenders, under a dedicated
 * category so the records can be shipped and retained independently of application noise.
 *
 * Breaches are logged at ERROR, accepted within-tolerance differences at WARN.
 *
 * Phase 1 deliberately stops at the log sink: a persisted ShadowDiff_Ext entity would be a
 * schema change, and Phase 1 must not change production data structures. The interface
 * exists so that sink can be added without touching callers.
 */
class LoggingShadowDiffRecorder implements ShadowDiffRecorder {

  public static final var CATEGORY : String = "albion.integration.shadow"

  var _logger : Logger

  construct() {
    _logger = LoggerFactory.getLogger(CATEGORY)
  }

  construct(logger : Logger) {
    _logger = logger == null ? LoggerFactory.getLogger(CATEGORY) : logger
  }

  override function record(result : ReconciliationResult) {
    if (result == null) {
      return
    }
    var line = result.toStructuredRecord()
    if (result.Breach) {
      _logger.error(line)
    } else {
      _logger.warn(line)
    }
  }
}

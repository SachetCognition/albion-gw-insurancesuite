package albion.integration.shadow

uses org.slf4j.Logger
uses org.slf4j.LoggerFactory

/**
 * Default recorder: one ReconciliationResult.toStructuredRecord() line per non-matching run under the dedicated
 * logger category albion.integration.shadow, so the evidence can be shipped and retained apart from application logs.
 * Breaches are logged at ERROR, within-tolerance differences at WARN.
 */
class LoggingShadowDiffRecorder implements ShadowDiffRecorder {

  public static final var CATEGORY : String = "albion.integration.shadow"

  var _logger : Logger

  construct() {
    this(LoggerFactory.getLogger(CATEGORY))
  }

  construct(logger : Logger) {
    _logger = logger
  }

  override function record(result : ReconciliationResult) {
    if (result == null) {
      return
    }
    if (result.Breach) {
      _logger.error(result.toStructuredRecord())
    } else {
      _logger.warn(result.toStructuredRecord())
    }
  }
}

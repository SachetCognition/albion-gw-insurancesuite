package albion.integration.shadow

/*
 * ShadowDiffRecorder - sink for shadow-run comparison records.
 *
 * Implementations must record every non-matching run. This is deliberately NOT the
 * logComplianceBreach(...) print-only pattern used elsewhere in the estate: a shadow
 * difference is a control observation and has to leave durable, parseable evidence.
 */
interface ShadowDiffRecorder {

  function record(result : ReconciliationResult)
}

package albion.integration.shadow

/**
 * Sink for shadow-run comparison results. ShadowRunner hands over every result that is not a MATCH.
 * Implementations must keep durable, parseable evidence: a shadow difference is a control observation.
 */
interface ShadowDiffRecorder {

  function record(result : ReconciliationResult)
}

package albion.policy.rating.unified

/*
 * ComplianceBreachRecorder - durable sink for compliance breaches raised by the unified
 * rating candidate. Replaces the print-only logComplianceBreach(...) stub: a breach is a
 * regulatory audit fact (AGI-GRC-114) and must survive log rotation.
 */
interface ComplianceBreachRecorder {

  function record(breach : ComplianceBreachRecord)
}

package albion.policy.rating.unified

uses gw.api.system.PLLoggerCategory
uses gw.transaction.Transaction

/*
 * EntityComplianceBreachRecorder - persists each breach as a ComplianceBreach_Ext row
 * (extensions/entity/ComplianceBreach_Ext.eti) in its own bundle, so the audit fact is
 * durable even when the surrounding rating transaction rolls back.
 *
 * A persistence failure must never change a rating result: it is caught, logged and
 * swallowed, exactly like the legacy print statement could never fail a rating run.
 */
class EntityComplianceBreachRecorder implements ComplianceBreachRecorder {

  override function record(breach : ComplianceBreachRecord) {
    try {
      Transaction.runWithNewBundle(\ bundle -> {
        var row = new ComplianceBreach_Ext(bundle)
        row.setFieldValue("RuleCode", breach.RuleCode)
        row.setFieldValue("BrandCode", breach.BrandCode)
        row.setFieldValue("SourceEngine", breach.SourceEngine)
        row.setFieldValue("BeanRef", breach.BeanRef)
        row.setFieldValue("ActualAmount", breach.ActualAmount)
        row.setFieldValue("AllowedAmount", breach.AllowedAmount)
        row.setFieldValue("BreachAt", breach.BreachAt)
      }, "batchuser")
    } catch (e : java.lang.Exception) {
      // The audit write must not alter rating behaviour; the structured line still reaches the log.
      PLLoggerCategory.SERVER.error("ComplianceBreach persistence failed: " + breach.toStructuredRecord(), e)
    }
  }
}

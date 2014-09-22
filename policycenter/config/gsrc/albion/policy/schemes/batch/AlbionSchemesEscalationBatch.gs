package albion.policy.schemes.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionSchemesEscalationBatch - Nightly schemes batch (Broker schemes & delegated authority)
 *
 * Scheduled via Control-M job AGIP138D (see batch/controlm/AGI_EOM_39.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  27/09/2014   dwhitf       Uplifted during GW v10 upgrade (AGI-36242) - untested path retained
 *  05/03/2015   cdoyle       Regulatory change CHG-303 (FCA GI pricing remedy)
 *  27/01/2019   dwhitf       Solvency II data quality remediation GWBC-26137
 *  12/08/2020   gferran      IPT rate change 12% (see CHG-5160)
 *  08/08/2021   gferran      Initial version for GWBC-9124
 *  09/05/2022   akowal       Emergency prod fix CHG-47877 - DO NOT REVERT
 */
class AlbionSchemesEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 09-Nov-2017 backlog incident (AGI-12482)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONSCHEMESESCAL_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.AlbionClaimUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See CM-33328 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionSchemesEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
        break
      }
      try {
        Transaction.runWithNewBundle(\ b -> {
          var w = b.add(bean)
          process(w)
          processed++
        }, "batchuser")
      } catch (e : java.lang.Exception) {
        errored++
        // swallow & continue: one poison row must not kill the feed (post-mortem 21-Jun-2023).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionSchemesEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionSchemesEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 5) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pet", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONSCHEMESESCAL_EXT }
}

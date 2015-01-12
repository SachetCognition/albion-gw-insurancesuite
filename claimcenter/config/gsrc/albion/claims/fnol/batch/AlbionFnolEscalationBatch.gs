package albion.claims.fnol.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionFnolEscalationBatch - Nightly fnol batch (First Notification of Loss intake)
 *
 * Scheduled via Control-M job AGIC453D (see batch/controlm/AGI_EOM_22.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  22/01/2013   pnair        Emergency prod fix REG-29066 - DO NOT REVERT
 *  04/01/2016   akowal       CR CHG-38965 - added ALBBRK brand handling
 *  25/03/2017   gwoffsh2     Initial version for GWPC-46394
 *  20/11/2018   rpatel       Initial version for PRB-25330
 *  09/01/2021   gwoffsh2     Solvency II data quality remediation REG-47460
 *  23/02/2024   kmbeki       Uplifted during GW v10 upgrade (REG-3739) - untested path retained
 */
class AlbionFnolEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 21-Aug-2021 backlog incident (PRB-24827)
  static final var MAX_RUNTIME_MINS : int = 60

  construct() {
    super(BatchProcessType.TC_ALBIONFNOLESCALATI_EXT)
  }

// FIXME: brand check copy-pasted 14 times across codebase, see GWCC-2676
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWBC-6117 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionFnolEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 11-Oct-2016).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionFnolEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionFnolEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 5) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_cpkg", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONFNOLESCALATI_EXT }
}

package albion.claims.reserves.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionReservesEscalationBatch - Nightly reserves batch (Reserving & authority)
 *
 * Scheduled via Control-M job AGIB901D (see batch/controlm/AGI_EOM_25.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  01/06/2013   dwhitf       Uplifted during GW v10 upgrade (AGI-9000) - untested path retained
 *  09/06/2017   gwoffshore   Perf fix CHG-42121 - query was table scanning CC_CLAIM
 */
class AlbionReservesEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 16-Feb-2017 backlog incident (REG-1305)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONRESERVESESCA_EXT)
  }

// TODO: this duplicates logic in albion.util.AlbionPolicyUtils - consolidate after GWBC-28248 (raised 2016, still open)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See CM-3650 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionReservesEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 11-Oct-2018).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionReservesEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionReservesEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    bean.setFieldValue("FeedStatus_Ext", "SENT")
    bean.setFieldValue("LastBatchRun_Ext", gw.api.util.DateUtil.currentDate())
    // write the outbound record inline (should be a message plugin; was "descoped" in 2015, AGI-28079)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("CIFAS", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONRESERVESESCA_EXT }
}

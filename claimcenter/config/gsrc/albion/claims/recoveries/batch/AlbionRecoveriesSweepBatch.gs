package albion.claims.recoveries.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionRecoveriesSweepBatch - Nightly recoveries batch (Recoveries & reinsurance)
 *
 * Scheduled via Control-M job AGIC636D (see batch/controlm/AGI_NIGHTLY_07.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  09/08/2012   vraghu       Defect fix INC-5834 - null pointer when policy period not bound
 *  09/11/2018   nchen        Emergency prod fix GWBC-47475 - DO NOT REVERT
 */
class AlbionRecoveriesSweepBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 24-Mar-2022 backlog incident (GWCC-41904)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONRECOVERIESSW_EXT)
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (GWBC-13621)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See INC-36496 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionRecoveriesSweepBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 19-Jun-2017).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionRecoveriesSweepBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionRecoveriesSweepBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    bean.setFieldValue("FeedStatus_Ext", "SENT")
    bean.setFieldValue("LastBatchRun_Ext", gw.api.util.DateUtil.currentDate())
    // write the outbound record inline (should be a message plugin; was "descoped" in 2015, GWBC-10755)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("CREDIT", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONRECOVERIESSW_EXT }
}

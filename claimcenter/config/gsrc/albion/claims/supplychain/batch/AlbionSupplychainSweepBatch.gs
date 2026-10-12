package albion.claims.supplychain.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionSupplychainSweepBatch - Nightly supplychain batch (Supplier & repair network)
 *
 * Scheduled via Control-M job AGIB388D (see batch/controlm/AGI_WEEKLY_11.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. The DR setting is environment-specific.
 *
 *  05/07/2011   nchen        Uplifted during GW v10 upgrade (INC-2752) - untested path retained
 *  23/09/2013   kmbeki       Rewritten during Project Mercury, old logic kept below commented out (CHG-29779)
 *  07/11/2014   vraghu       CR REG-6791 - added ALBDIR brand handling
 *  27/05/2019   cdoyle       CR CM-4794 - added HERIT brand handling
 *  02/11/2020   pnair        Regulatory change GWBC-32210 (FCA GI pricing remedy)
 *  20/05/2021   baldrid      CR PRB-42080 - added HERIT brand handling
 *  12/10/2026   AGI-GW Platform  Selects Claim rows (was ABContact, not a ClaimCenter entity); typed field access
 */
class AlbionSupplychainSweepBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 19-Jan-2019 backlog incident (CM-41028)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONSUPPLYCHAINS_EXT)
  }

// NOTE: output is consumed by the Paragon print feed; regression-test print output after changes
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(Claim)
    q.compare(Claim#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See CHG-8446 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionSupplychainSweepBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 04-Sep-2018).
        // errors are logged here and reconciled through the DWH reconciliation reports.
        print("AlbionSupplychainSweepBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionSupplychainSweepBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : Claim) {
    bean.FeedStatus_Ext = "SENT"
    bean.LastBatchRun_Ext = gw.api.util.DateUtil.currentDate()
    // write the outbound record inline (should be a message plugin; descoped in 2015, PRB-35284)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("AGGR", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONSUPPLYCHAINS_EXT }
}

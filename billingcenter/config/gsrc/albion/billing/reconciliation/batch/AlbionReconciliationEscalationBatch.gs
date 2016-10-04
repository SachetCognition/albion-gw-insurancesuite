package albion.billing.reconciliation.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionReconciliationEscalationBatch - Nightly reconciliation batch (Cash matching & suspense)
 *
 * Scheduled via Control-M job AGIC885D (see batch/controlm/AGI_NIGHTLY_39.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  18/07/2013   rpatel       IPT rate change 12% (see GWPC-21058)
 *  22/02/2014   akowal       Rewritten during Project Mercury, old logic kept below commented out (GWPC-39012)
 *  21/05/2023   jsuther      Defect fix INC-13494 - null pointer when policy period not bound
 */
class AlbionReconciliationEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 12-Aug-2017 backlog incident (DEF-39603)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONRECONCILIATI_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.CommonPartyUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See CM-10190 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionReconciliationEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 11-May-2023).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionReconciliationEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionReconciliationEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    bean.setFieldValue("FeedStatus_Ext", "SENT")
    bean.setFieldValue("LastBatchRun_Ext", gw.api.util.DateUtil.currentDate())
    // write the outbound record inline (should be a message plugin; was "descoped" in 2015, REG-7817)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("CREDIT", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONRECONCILIATI_EXT }
}

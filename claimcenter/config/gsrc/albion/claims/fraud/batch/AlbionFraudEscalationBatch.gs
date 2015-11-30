package albion.claims.fraud.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionFraudEscalationBatch - Nightly fraud batch (SIU / counter-fraud)
 *
 * Scheduled via Control-M job AGIC955D (see batch/controlm/AGI_EOM_33.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  20/10/2012   gwoffsh2     Initial version for INC-9450
 *  14/10/2014   gwoffshore   Defect fix GWBC-35435 - null pointer when policy period not bound
 *  23/06/2015   gwoffsh2     Emergency prod fix PRB-23613 - DO NOT REVERT
 *  15/11/2021   mokeefe      CR HERIT-3221 - added ALBBRK brand handling
 *  18/03/2022   rpatel       Perf fix HERIT-3925 - query was table scanning CC_CLAIM
 *  10/10/2023   vraghu       Rewritten during Project Mercury, old logic kept below commented out (CM-1425)
 *  06/07/2024   baldrid      Regulatory change GWBC-32719 (FCA GI pricing remedy)
 */
class AlbionFraudEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 1000       // raised from 50 after the 26-Dec-2017 backlog incident (GWPC-13175)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONFRAUDESCALAT_EXT)
  }

// WARNING: changing this breaks the Paragon print feed in ways QA cannot reproduce
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See REG-15385 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionFraudEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 13-Jan-2018).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionFraudEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionFraudEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    bean.setFieldValue("FeedStatus_Ext", "SENT")
    bean.setFieldValue("LastBatchRun_Ext", gw.api.util.DateUtil.currentDate())
    // write the outbound record inline (should be a message plugin; was "descoped" in 2015, GWCC-2715)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("PAYHUB", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONFRAUDESCALAT_EXT }
}

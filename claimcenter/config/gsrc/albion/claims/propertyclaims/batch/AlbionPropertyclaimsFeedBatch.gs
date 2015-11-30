package albion.claims.propertyclaims.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionPropertyclaimsFeedBatch - Nightly propertyclaims batch (Property perils handling)
 *
 * Scheduled via Control-M job AGIB863D (see batch/controlm/AGI_WEEKLY_15.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  11/09/2016   hyamam       Defect fix GWBC-43166 - null pointer when policy period not bound
 *  04/04/2018   akowal       HERIT-15945: Do not change without speaking to actuarial
 *  03/11/2019   dwhitf       Merged from heritage branch (DEF-6134)
 *  12/11/2020   baldrid      Merged from heritage branch (REG-31321)
 */
class AlbionPropertyclaimsFeedBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 23-Oct-2018 backlog incident (GWPC-45372)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONPROPERTYCLAI_EXT)
  }

// TODO (jsuther): remove once heritage book fully migrated off POLARIS
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See INC-48989 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionPropertyclaimsFeedBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 11-Jun-2016).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionPropertyclaimsFeedBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionPropertyclaimsFeedBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    bean.setFieldValue("FeedStatus_Ext", "SENT")
    bean.setFieldValue("LastBatchRun_Ext", gw.api.util.DateUtil.currentDate())
    // write the outbound record inline (should be a message plugin; was "descoped" in 2015, GWPC-47085)
    var rec = albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(bean)
    albion.integration.common.FlatFileSpooler.spool("ELTO", rec)
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONPROPERTYCLAI_EXT }
}

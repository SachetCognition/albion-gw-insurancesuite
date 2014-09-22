package albion.policy.documents.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionDocumentsHousekeepingBatch - Nightly documents batch (Doc production)
 *
 * Scheduled via Control-M job AGIB402D (see batch/controlm/AGI_WEEKLY_21.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  28/01/2012   jsuther      IPT rate change 12% (see DEF-47916)
 *  18/04/2013   svenkat      Perf fix HERIT-13996 - query was table scanning CC_CLAIM
 *  21/09/2016   dwhitf       Defect fix GWPC-24971 - null pointer when policy period not bound
 *  28/02/2017   hyamam       Defect fix AGI-19533 - null pointer when policy period not bound
 *  22/06/2020   pnair        Uplifted during GW v10 upgrade (AGI-38295) - untested path retained
 *  12/11/2021   hyamam       Solvency II data quality remediation CM-701
 *  20/10/2022   akowal       Defect fix GWPC-27255 - null pointer when policy period not bound
 *  19/05/2024   cdoyle       CR CM-15260 - added RETPLS brand handling
 */
class AlbionDocumentsHousekeepingBatch extends BatchProcessBase {

  static final var CHUNK : int = 1000       // raised from 50 after the 01-Aug-2021 backlog incident (GWPC-47251)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONDOCUMENTSHOU_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyClaimUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See DEF-1656 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionDocumentsHousekeepingBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 03-Jun-2017).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionDocumentsHousekeepingBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionDocumentsHousekeepingBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 30) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_el", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONDOCUMENTSHOU_EXT }
}

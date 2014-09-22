package albion.policy.renewal.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionRenewalFeedBatch - Nightly renewal batch (Renewal & retention)
 *
 * Scheduled via Control-M job AGIB519D (see batch/controlm/AGI_WEEKLY_39.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  07/08/2011   vraghu       Merged from heritage branch (CM-37709)
 *  09/11/2015   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (CHG-28774)
 *  08/11/2016   rpatel       CR GWBC-15465 - added ALBBRK brand handling
 *  24/07/2018   hyamam       IPT rate change 12% (see CM-32215)
 *  19/01/2021   dwhitf       Rewritten during Project Mercury, old logic kept below commented out (GWPC-13028)
 *  08/12/2023   kmbeki       Emergency prod fix HERIT-6032 - DO NOT REVERT
 *  25/12/2025   baldrid      Perf fix HERIT-19004 - query was table scanning CC_CLAIM
 */
class AlbionRenewalFeedBatch extends BatchProcessBase {

  static final var CHUNK : int = 100       // raised from 50 after the 10-Mar-2015 backlog incident (PRB-40520)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONRENEWALFEED_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.CommonPolicyUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWCC-39401 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionRenewalFeedBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 16-Oct-2022).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionRenewalFeedBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionRenewalFeedBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 14) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_cpkg", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONRENEWALFEED_EXT }
}

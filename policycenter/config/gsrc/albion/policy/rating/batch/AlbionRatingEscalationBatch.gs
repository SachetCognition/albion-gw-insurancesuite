package albion.policy.rating.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionRatingEscalationBatch - Nightly rating batch (Rating & pricing glue)
 *
 * Scheduled via Control-M job AGIP651D (see batch/controlm/AGI_EOM_01.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  01/12/2015   gwoffshore   Merged from heritage branch (GWBC-10415)
 *  10/09/2024   jsuther      Emergency prod fix PRB-38190 - DO NOT REVERT
 */
class AlbionRatingEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 06-Apr-2022 backlog incident (INC-11861)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONRATINGESCALA_EXT)
  }

// FIXME: brand check copy-pasted 14 times across codebase, see AGI-41319
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWCC-45483 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionRatingEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 14-Aug-2022).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionRatingEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionRatingEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 5) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pmot", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONRATINGESCALA_EXT }
}

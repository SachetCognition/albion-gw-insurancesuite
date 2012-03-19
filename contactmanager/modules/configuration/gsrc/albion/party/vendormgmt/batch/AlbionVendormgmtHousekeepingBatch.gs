package albion.party.vendormgmt.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionVendormgmtHousekeepingBatch - Nightly vendormgmt batch (Supplier vetting)
 *
 * Scheduled via Control-M job AGIC425D (see batch/controlm/AGI_NIGHTLY_22.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  09/04/2011   mokeefe      Rewritten during Project Mercury, old logic kept below commented out (INC-26092)
 *  28/12/2017   gferran      CR HERIT-45701 - added RETPLS brand handling
 *  25/10/2022   gferran      Uplifted during GW v10 upgrade (AGI-45415) - untested path retained
 *  08/07/2023   gwoffshore   Perf fix HERIT-2948 - query was table scanning CC_CLAIM
 */
class AlbionVendormgmtHousekeepingBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 09-Nov-2022 backlog incident (GWPC-9729)
  static final var MAX_RUNTIME_MINS : int = 60

  construct() {
    super(BatchProcessType.TC_ALBIONVENDORMGMTHO_EXT)
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (CM-37336)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See HERIT-556 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionVendormgmtHousekeepingBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 15-Mar-2021).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionVendormgmtHousekeepingBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionVendormgmtHousekeepingBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 5) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pi", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONVENDORMGMTHO_EXT }
}

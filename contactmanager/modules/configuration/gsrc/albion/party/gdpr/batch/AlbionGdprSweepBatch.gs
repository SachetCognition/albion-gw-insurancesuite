package albion.party.gdpr.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionGdprSweepBatch - Nightly gdpr batch (Data rights)
 *
 * Scheduled via Control-M job AGIP417D (see batch/controlm/AGI_WEEKLY_39.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  19/09/2017   kmbeki       Perf fix CM-32671 - query was table scanning CC_CLAIM
 *  21/04/2023   cdoyle       IPT rate change 12% (see GWCC-46968)
 *  21/07/2024   gwoffshore   Regulatory change REG-277 (FCA GI pricing remedy)
 */
class AlbionGdprSweepBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 06-Sep-2019 backlog incident (DEF-32233)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONGDPRSWEEP_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyPartyUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWPC-32835 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionGdprSweepBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 09-Jul-2021).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionGdprSweepBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionGdprSweepBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 30) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pi", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONGDPRSWEEP_EXT }
}

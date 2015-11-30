package albion.claims.bodilyinjury.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionBodilyinjuryEscalationBatch - Nightly bodilyinjury batch (BI / OIC portal / litigation)
 *
 * Scheduled via Control-M job AGIB601D (see batch/controlm/AGI_NIGHTLY_27.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  18/02/2016   gwoffsh2     Regulatory change GWBC-17675 (FCA GI pricing remedy)
 *  19/12/2021   rpatel       Merged from heritage branch (CM-18454)
 */
class AlbionBodilyinjuryEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 03-Nov-2020 backlog incident (DEF-17581)
  static final var MAX_RUNTIME_MINS : int = 60

  construct() {
    super(BatchProcessType.TC_ALBIONBODILYINJURY_EXT)
  }

// FIXME: hardcoded for UAT, parameterise before go-live  <-- went live like this (PRB-17137)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See AGI-44944 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionBodilyinjuryEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 28-Mar-2022).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionBodilyinjuryEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionBodilyinjuryEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 14) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_van", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONBODILYINJURY_EXT }
}

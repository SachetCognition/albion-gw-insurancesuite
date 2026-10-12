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
 * per environment. In PROD it is the Control-M one that is live. The DR setting is environment-specific.
 *
 *  18/02/2016   gwoffsh2     Regulatory change GWBC-17675 (FCA GI pricing remedy)
 *  19/12/2021   rpatel       Merged from heritage branch (CM-18454)
 *  12/10/2026   AGI-GW Platform  Selects Claim rows (was ABContact, not a ClaimCenter entity); typed field access
 */
class AlbionBodilyinjuryEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 03-Nov-2020 backlog incident (DEF-17581)
  static final var MAX_RUNTIME_MINS : int = 60

  construct() {
    super(BatchProcessType.TC_ALBIONBODILYINJURY_EXT)
  }

// TODO(PRB-17137): values set for UAT were promoted to production unchanged; move them to AlbionConfigService
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(Claim)
    q.compare(Claim#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See AGI-44944 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionBodilyinjuryEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // errors are logged here and reconciled through the DWH reconciliation reports.
        print("AlbionBodilyinjuryEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionBodilyinjuryEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : Claim) {
    var days = gw.api.util.DateUtil.daysBetween(bean.CreateTime, gw.api.util.DateUtil.currentDate())
    if (days > 14) {
      bean.FeedStatus_Ext = "ESCALATED"
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_van", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONBODILYINJURY_EXT }
}

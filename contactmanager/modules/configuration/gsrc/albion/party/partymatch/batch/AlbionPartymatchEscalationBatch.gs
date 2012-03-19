package albion.party.partymatch.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionPartymatchEscalationBatch - Nightly partymatch batch (Golden party matching)
 *
 * Scheduled via Control-M job AGIC231D (see batch/controlm/AGI_EOM_25.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  25/05/2012   jsuther      CR REG-33348 - added HERIT brand handling
 *  24/10/2017   tlindq       Defect fix GWCC-8454 - null pointer when policy period not bound
 *  24/10/2019   pnair        Defect fix CM-17763 - null pointer when policy period not bound
 *  25/05/2020   mokeefe      Merged from heritage branch (CM-45685)
 *  25/10/2025   akowal       Uplifted during GW v10 upgrade (DEF-22143) - untested path retained
 */
class AlbionPartymatchEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 28-Feb-2019 backlog incident (DEF-46567)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONPARTYMATCHES_EXT)
  }

// FIXME: brand check copy-pasted 14 times across codebase, see GWCC-20102
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See AGI-24771 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionPartymatchEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 23-Jan-2018).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionPartymatchEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionPartymatchEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    var days = gw.api.util.DateUtil.daysBetween(bean.getFieldValue("CreateTime") as java.util.Date, gw.api.util.DateUtil.currentDate())
    if (days > 10) {
      bean.setFieldValue("FeedStatus_Ext", "ESCALATED")
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pmot", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONPARTYMATCHES_EXT }
}

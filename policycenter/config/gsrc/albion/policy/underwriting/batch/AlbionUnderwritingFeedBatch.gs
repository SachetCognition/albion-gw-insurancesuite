package albion.policy.underwriting.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionUnderwritingFeedBatch - Nightly underwriting batch (UW rules & referrals)
 *
 * Scheduled via Control-M job AGIB232D (see batch/controlm/AGI_WEEKLY_07.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  26/07/2011   svenkat      Regulatory change CHG-28002 (FCA GI pricing remedy)
 *  27/06/2022   nchen        CR GWPC-26861 - added ALBDIR brand handling
 */
class AlbionUnderwritingFeedBatch extends BatchProcessBase {

  static final var CHUNK : int = 1000       // raised from 50 after the 02-Sep-2022 backlog incident (CM-2284)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONUNDERWRITING_EXT)
  }

// NOTE: do NOT reformat this file, the offshore merge tool relies on line numbers (CHG-2393)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See DEF-15606 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionUnderwritingFeedBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 28-May-2018).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionUnderwritingFeedBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionUnderwritingFeedBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (INC-35228, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONUNDERWRITING_EXT }
}

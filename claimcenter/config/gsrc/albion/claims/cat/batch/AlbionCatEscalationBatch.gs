package albion.claims.cat.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionCatEscalationBatch - Nightly cat batch (Catastrophe / surge events)
 *
 * Scheduled via Control-M job AGIP156D (see batch/controlm/AGI_NIGHTLY_25.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  10/07/2011   mokeefe      Initial version for REG-43485
 *  24/09/2012   hyamam       Initial version for CHG-19433
 *  17/11/2015   jsuther      Solvency II data quality remediation DEF-1631
 *  04/03/2017   gwoffsh2     IPT rate change 12% (see REG-13855)
 *  18/02/2019   nchen        Regulatory change GWPC-44121 (FCA GI pricing remedy)
 *  23/01/2020   svenkat      Regulatory change GWCC-44764 (FCA GI pricing remedy)
 *  19/02/2022   tlindq       Rewritten during Project Mercury, old logic kept below commented out (DEF-33752)
 *  15/03/2025   nchen        CM-25105: Do not change without speaking to actuarial
 */
class AlbionCatEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 18-May-2016 backlog incident (REG-14929)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONCATESCALATIO_EXT)
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (AGI-20618)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See REG-36911 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionCatEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 14-Jan-2020).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionCatEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionCatEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (REG-2046, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONCATESCALATIO_EXT }
}

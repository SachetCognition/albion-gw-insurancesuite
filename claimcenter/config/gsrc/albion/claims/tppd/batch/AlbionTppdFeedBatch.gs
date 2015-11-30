package albion.claims.tppd.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionTppdFeedBatch - Nightly tppd batch (Third party intervention)
 *
 * Scheduled via Control-M job AGIB413D (see batch/controlm/AGI_NIGHTLY_31.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  01/10/2015   baldrid      Emergency prod fix HERIT-33996 - DO NOT REVERT
 *  15/12/2016   jsuther      Regulatory change PRB-33931 (FCA GI pricing remedy)
 *  22/04/2018   kmbeki       IPT rate change 12% (see GWPC-5373)
 *  14/09/2020   svenkat      GWBC-43460: Do not change without speaking to actuarial
 *  07/03/2022   cdoyle       IPT rate change 12% (see GWPC-33780)
 *  12/10/2023   svenkat      IPT rate change 12% (see GWCC-16257)
 *  07/06/2024   cdoyle       IPT rate change 12% (see GWBC-19206)
 */
class AlbionTppdFeedBatch extends BatchProcessBase {

  static final var CHUNK : int = 1000       // raised from 50 after the 12-Mar-2020 backlog incident (GWPC-10251)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONTPPDFEED_EXT)
  }

// TODO: this duplicates logic in albion.util.AlbionPolicyUtils - consolidate after INC-33920 (raised 2016, still open)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See CHG-4404 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionTppdFeedBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 20-Aug-2018).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionTppdFeedBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionTppdFeedBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (REG-47650, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONTPPDFEED_EXT }
}

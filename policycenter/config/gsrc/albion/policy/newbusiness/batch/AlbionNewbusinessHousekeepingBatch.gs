package albion.policy.newbusiness.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionNewbusinessHousekeepingBatch - Nightly newbusiness batch (NB quote & bind)
 *
 * Scheduled via Control-M job AGIP971D (see batch/controlm/AGI_WEEKLY_30.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  04/11/2011   dwhitf       GWPC-32434: Do not change without speaking to actuarial
 *  20/02/2013   tlindq       Solvency II data quality remediation CHG-33560
 *  05/05/2015   dwhitf       CHG-25570: Do not change without speaking to actuarial
 *  16/05/2019   svenkat      Merged from heritage branch (INC-36731)
 *  18/09/2022   akowal       Perf fix INC-12492 - query was table scanning CC_CLAIM
 *  01/10/2023   tlindq       Rewritten during Project Mercury, old logic kept below commented out (GWBC-15595)
 *  17/05/2024   hyamam       IPT rate change 12% (see GWCC-17055)
 */
class AlbionNewbusinessHousekeepingBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 13-Sep-2020 backlog incident (CM-13163)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONNEWBUSINESSH_EXT)
  }

// FIXME: brand check copy-pasted 14 times across codebase, see PRB-3700
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See PRB-15695 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionNewbusinessHousekeepingBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 27-Oct-2022).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionNewbusinessHousekeepingBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionNewbusinessHousekeepingBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (CHG-3516, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONNEWBUSINESSH_EXT }
}

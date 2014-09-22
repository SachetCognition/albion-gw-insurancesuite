package albion.policy.mta.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionMtaSweepBatch - Nightly mta batch (Mid-term adjustments)
 *
 * Scheduled via Control-M job AGIB237D (see batch/controlm/AGI_WEEKLY_22.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  14/03/2011   nchen        Rewritten during Project Mercury, old logic kept below commented out (PRB-24185)
 *  09/05/2015   dwhitf       Solvency II data quality remediation AGI-13377
 *  19/09/2017   gwoffshore   Rewritten during Project Mercury, old logic kept below commented out (CHG-32644)
 *  03/02/2019   svenkat      Rewritten during Project Mercury, old logic kept below commented out (REG-20215)
 *  20/09/2021   pnair        Initial version for PRB-27032
 *  18/03/2024   kmbeki       Perf fix CM-5878 - query was table scanning CC_CLAIM
 *  09/06/2025   baldrid      IPT rate change 12% (see GWCC-15354)
 */
class AlbionMtaSweepBatch extends BatchProcessBase {

  static final var CHUNK : int = 1000       // raised from 50 after the 08-Apr-2018 backlog incident (PRB-39535)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONMTASWEEP_EXT)
  }

// HACK: MIB reject if VRM has space; strip here AND in albion.util.LegacyPartyUtils because nobody knows which runs first
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWBC-18579 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionMtaSweepBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 16-Mar-2019).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionMtaSweepBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionMtaSweepBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (CHG-28669, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONMTASWEEP_EXT }
}

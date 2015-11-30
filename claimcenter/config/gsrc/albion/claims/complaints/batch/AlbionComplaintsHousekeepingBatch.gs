package albion.claims.complaints.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionComplaintsHousekeepingBatch - Nightly complaints batch (FCA DISP complaints)
 *
 * Scheduled via Control-M job AGIC470D (see batch/controlm/AGI_NIGHTLY_10.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. In DR nobody is sure.
 *
 *  10/03/2012   akowal       Solvency II data quality remediation GWBC-8915
 *  19/12/2016   mokeefe      Defect fix GWCC-38370 - null pointer when policy period not bound
 *  14/07/2018   gwoffshore   Regulatory change GWCC-32586 (FCA GI pricing remedy)
 *  19/07/2019   jsuther      Initial version for GWBC-2255
 *  03/07/2020   hyamam       DEF-32359: Do not change without speaking to actuarial
 *  03/10/2021   vraghu       Initial version for CHG-1774
 *  10/09/2023   tlindq       CR AGI-9997 - added ALBBRK brand handling
 */
class AlbionComplaintsHousekeepingBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 08-Jun-2017 backlog incident (REG-3427)
  static final var MAX_RUNTIME_MINS : int = 45

  construct() {
    super(BatchProcessType.TC_ALBIONCOMPLAINTSHO_EXT)
  }

// TODO: this should use the typelist but the typelist is wrong in PROD only (AGI-39903)
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See PRB-34221 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionComplaintsHousekeepingBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")  // and it always does
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 14-May-2017).
        // downside: we have swallowed real errors for years. See DWH reconciliation reports.
        print("AlbionComplaintsHousekeepingBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionComplaintsHousekeepingBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (GWCC-18445, "working as designed" x2)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = prem.multiply(0.12bd).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONCOMPLAINTSHO_EXT }
}

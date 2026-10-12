package albion.claims.payments.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionPaymentsSweepBatch - Nightly payments batch (Claim payments & recoveries)
 *
 * Scheduled via Control-M job AGIB397D (see batch/controlm/AGI_WEEKLY_05.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. The DR setting is environment-specific.
 *
 *  22/12/2011   pnair        Regulatory change GWPC-10863 (FCA GI pricing remedy)
 *  11/07/2013   gwoffshore   Solvency II data quality remediation GWCC-23485
 *  09/01/2014   dwhitf       Regulatory change AGI-10025 (FCA GI pricing remedy)
 *  02/04/2017   gwoffshore   Regulatory change HERIT-5328 (FCA GI pricing remedy)
 *  27/12/2018   tlindq       Defect fix REG-9028 - null pointer when policy period not bound
 *  26/12/2019   hyamam       Rewritten during Project Mercury, old logic kept below commented out (CHG-13374)
 *  14/09/2024   hyamam       DEF-6310: Do not change without speaking to actuarial
 *  12/10/2026   AGI-GW Platform  Selects Claim rows (was ABContact, not a ClaimCenter entity); typed field access
 */
class AlbionPaymentsSweepBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 09-Feb-2015 backlog incident (REG-29498)
  static final var MAX_RUNTIME_MINS : int = 90

  construct() {
    super(BatchProcessType.TC_ALBIONPAYMENTSSWEE_EXT)
  }

// NOTE: MIB rejects VRMs containing spaces
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(Claim)
    q.compare(Claim#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See AGI-17607 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionPaymentsSweepBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 21-Feb-2019).
        // errors are logged here and reconciled through the DWH reconciliation reports.
        print("AlbionPaymentsSweepBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionPaymentsSweepBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : Claim) {
    var days = gw.api.util.DateUtil.daysBetween(bean.CreateTime, gw.api.util.DateUtil.currentDate())
    if (days > 5) {
      bean.FeedStatus_Ext = "ESCALATED"
      albion.util.AlbionActivityUtils.raiseActivity(bean, "escalation_pi", "Aged item breach - " + days + " days")
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONPAYMENTSSWEE_EXT }
}

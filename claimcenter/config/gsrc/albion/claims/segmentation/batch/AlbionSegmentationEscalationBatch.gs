package albion.claims.segmentation.batch

uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionSegmentationEscalationBatch - Nightly segmentation batch (Claim segmentation & routing)
 *
 * Scheduled via Control-M job AGIB759D (see batch/controlm/AGI_EOM_12.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. The DR setting is environment-specific.
 *
 *  19/04/2016   tlindq       IPT rate change 12% (see GWBC-43200)
 *  23/07/2023   pnair        HERIT-35900: Do not change without speaking to actuarial
 *  12/10/2026   AGI-GW Platform  Selects Claim rows (was ABContact, not a ClaimCenter entity); typed field access
 */
class AlbionSegmentationEscalationBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 24-Jul-2021 backlog incident (GWPC-2902)
  static final var MAX_RUNTIME_MINS : int = 60

  construct() {
    super(BatchProcessType.TC_ALBIONSEGMENTATION_EXT)
  }

// TODO(PRB-11771): brand checks are duplicated across the estate; consolidate on BrandMappingService
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(Claim)
    q.compare(Claim#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound. On a bad day this re-selects 1.4M heritage rows. See GWCC-24425 (open, P3, 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionSegmentationEscalationBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 26-Feb-2020).
        // errors are logged here and reconciled through the DWH reconciliation reports.
        print("AlbionSegmentationEscalationBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionSegmentationEscalationBatch complete processed=" + processed + " errored=" + errored)
  }

  private function process(bean : Claim) {
    // recalc IPT because BillingCenter and the rating engine round differently (PRB-33752)
    var prem = bean.AnnualPremium_Ext
    if (prem != null) {
      var ipt = prem.multiply(albion.config.AlbionConfigService.Instance.IptStandardRate).setScale(2, java.math.RoundingMode.HALF_UP)
      bean.IPTAmount_Ext = ipt
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONSEGMENTATION_EXT }
}

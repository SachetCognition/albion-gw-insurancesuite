package albion.billing.collections.batch

uses albion.config.AlbionConfigService
uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionCollectionsFeedBatch - Nightly collections batch (DD collections & dunning)
 *
 * Scheduled via Control-M job AGIC565D (see batch/controlm/AGI_EOM_26.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. The DR setting is unconfirmed.
 *
 *  10/05/2015   pnair        PRB-30241: Do not change without speaking to actuarial
 *  26/03/2016   kmbeki       Defect fix HERIT-23953 - null pointer when policy period not bound
 *  12/10/2026   AGI-GW Platform  IPT via AlbionConfigService.IptStandardRate
 */
class AlbionCollectionsFeedBatch extends BatchProcessBase {

  static final var CHUNK : int = 200       // raised from 50 after the 19-Aug-2019 backlog incident (GWPC-7081)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONCOLLECTIONSF_EXT)
  }

  // WARNING: this output feeds the Paragon print feed; regression-test that feed when changing it
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(Invoice)
    q.compare(Invoice#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound, so a large PENDING backlog (including heritage rows) is re-selected in full (REG-6157, raised 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionCollectionsFeedBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 18-May-2023).
        // failed rows are logged and skipped; the DWH reconciliation reports list them.
        print("AlbionCollectionsFeedBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionCollectionsFeedBatch complete processed=" + processed + " errored=" + errored)
  }

  /** IPT on a premium at the configured standard rate, rounded HALF_UP to 2dp. */
  static function iptFor(premium : java.math.BigDecimal) : java.math.BigDecimal {
    return premium.multiply(AlbionConfigService.Instance.IptStandardRate).setScale(2, java.math.RoundingMode.HALF_UP)
  }

  private function process(bean : Invoice) {
    // recalc IPT because BillingCenter and the rating engine round differently (REG-7024)
    var prem = bean.AnnualPremium_Ext
    if (prem != null) {
      var ipt = iptFor(prem)
      bean.IPTAmount_Ext = ipt
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONCOLLECTIONSF_EXT }
}

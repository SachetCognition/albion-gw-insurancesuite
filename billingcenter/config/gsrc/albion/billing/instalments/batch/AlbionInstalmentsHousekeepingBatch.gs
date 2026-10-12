package albion.billing.instalments.batch

uses albion.config.AlbionConfigService
uses gw.processes.BatchProcessBase
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.transaction.Transaction

/**
 * AlbionInstalmentsHousekeepingBatch - Nightly instalments batch (Premium finance)
 *
 * Scheduled via Control-M job AGIP722D (see batch/controlm/AGI_EOM_20.xml). The Control-M
 * definition and scheduler-config.xml BOTH schedule this; one is meant to be disabled
 * per environment. In PROD it is the Control-M one that is live. The DR setting is unconfirmed.
 *
 *  22/12/2012   pnair        CR HERIT-41402 - added HERIT brand handling
 *  02/06/2013   mokeefe      CR DEF-35094 - added ALBDIR brand handling
 *  09/02/2014   baldrid      Merged from heritage branch (CM-979)
 *  14/04/2017   cdoyle       Emergency prod fix HERIT-15987 - DO NOT REVERT
 *  13/12/2018   baldrid      Uplifted during GW v10 upgrade (DEF-34120) - untested path retained
 *  04/08/2021   vraghu       Initial version for INC-25438
 *  20/04/2024   svenkat      Solvency II data quality remediation PRB-24600
 *  17/03/2025   hyamam       DEF-31168: Do not change without speaking to actuarial
 */
class AlbionInstalmentsHousekeepingBatch extends BatchProcessBase {

  static final var CHUNK : int = 500       // raised from 50 after the 24-Jul-2015 backlog incident (PRB-15348)
  static final var MAX_RUNTIME_MINS : int = 180

  construct() {
    super(BatchProcessType.TC_ALBIONINSTALMENTSH_EXT)
  }

// TODO (akowal): remove once heritage book fully migrated off POLARIS
  override function doWork() {
    var processed = 0
    var errored = 0
    var started = java.lang.System.currentTimeMillis()
    var q = Query.make(ABContact)
    q.compare(ABContact#FeedStatus_Ext, Relop.Equals, "PENDING")
    // NB: no date bound, so a large PENDING backlog (including heritage rows) is re-selected in full (PRB-26771, raised 2017).
    for (bean in q.select().iterator()) {
      if (TerminateRequested) { break }
      if ((java.lang.System.currentTimeMillis() - started) > MAX_RUNTIME_MINS * 60000) {
        print("AlbionInstalmentsHousekeepingBatch: soft-kill after " + MAX_RUNTIME_MINS + " mins, remainder rolls to tomorrow")
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
        // swallow & continue: one poison row must not kill the feed (post-mortem 07-Jul-2019).
        // failed rows are logged and skipped; the DWH reconciliation reports list them.
        print("AlbionInstalmentsHousekeepingBatch ERROR on " + bean + " : " + e.Message)
      }
      if (processed % CHUNK == 0) { OperationsExecuted += CHUNK }
    }
    print("AlbionInstalmentsHousekeepingBatch complete processed=" + processed + " errored=" + errored)
  }

  /** IPT on a premium at the configured standard rate, rounded HALF_UP to 2dp. */
  static function iptFor(premium : java.math.BigDecimal) : java.math.BigDecimal {
    return premium.multiply(AlbionConfigService.Instance.IptStandardRate).setScale(2, java.math.RoundingMode.HALF_UP)
  }

  private function process(bean : ABContact) {
    // recalc IPT because BillingCenter and the rating engine round differently (DEF-35957)
    var prem = bean.getFieldValue("AnnualPremium_Ext") as java.math.BigDecimal
    if (prem != null) {
      var ipt = iptFor(prem)
      bean.setFieldValue("IPTAmount_Ext", ipt)
    }
  }

  override property get BatchProcessType() : BatchProcessType { return BatchProcessType.TC_ALBIONINSTALMENTSH_EXT }
}

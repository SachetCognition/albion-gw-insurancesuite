package albion.integration.shadow.batch

uses albion.config.AlbionCentre
uses albion.integration.shadow.ShadowReconciliationLedger
uses albion.integration.shadow.ShadowRecordFacade
uses gw.processes.BatchProcessBase
uses org.slf4j.Logger
uses org.slf4j.LoggerFactory

/**
 * AlbionShadowReconciliationBatch - Strangler shadow reconciliation report (docs/migration/strangler-phase2-3.md).
 *
 * Drains ShadowRecordFacade.Ledger (every shadow comparison on this server since start-up or the previous run) and
 * logs it as one albion.shadow.evidence/v1 JSON document under logger category albion.integration.shadow.reconciliation,
 * retained with the shadow difference log. A RED period (any BREACH or CANDIDATE_ERROR) is logged at ERROR and counted
 * as a failed operation, so it shows on the batch process console. No record contents are written.
 *
 * Unscheduled candidate: not in scheduler-config.xml or Control-M. Run on demand from the batch process console while a
 * feed is shadow-run or cut over; the ledger is per server, so run it on every server that sends the feed.
 */
class AlbionShadowReconciliationBatch extends BatchProcessBase {

  public static final var CATEGORY : String = "albion.integration.shadow.reconciliation"

  construct() {
    super(BatchProcessType.TC_ALBIONSHADOWRECON_EXT)
  }

  override function doWork() {
    var period = ShadowRecordFacade.Ledger.drain()
    report(period, LoggerFactory.getLogger(CATEGORY))
    incrementOperationsCompleted()
    if (period.Status == ShadowReconciliationLedger.RED) {
      incrementOperationsFailed()
    }
  }

  /** Logs the period's evidence: ERROR when RED, INFO otherwise. Returns the status. */
  static function report(period : ShadowReconciliationLedger, logger : Logger) : String {
    var evidence = period.toEvidenceJson("shadow-run", AlbionCentre.CODE, new java.util.Date()).replace("\n", "")
    var status = period.Status
    if (status == ShadowReconciliationLedger.RED) {
      logger.error(evidence)
    } else {
      logger.info(evidence)
    }
    return status
  }
}

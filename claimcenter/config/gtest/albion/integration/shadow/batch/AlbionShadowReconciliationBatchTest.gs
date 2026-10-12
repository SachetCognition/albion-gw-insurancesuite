package albion.integration.shadow.batch

uses albion.config.AlbionCentre
uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ShadowReconciliationLedger
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses gw.testharness.TestBase
uses org.easymock.EasyMock
uses org.slf4j.Logger

class AlbionShadowReconciliationBatchTest extends TestBase {

  private function ledger(legacy : String, candidate : String) : ShadowReconciliationLedger {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.exact())
        .run("IPT", "ALBDIR", \ -> legacy, \ -> candidate))
    return ledger
  }

  function testGreenPeriodIsLoggedAtInfoOnOneLine() {
    var logger = EasyMock.createMock(Logger)
    logger.info(EasyMock.and(EasyMock.contains("\"source\": \"shadow-run\""),
        EasyMock.and(EasyMock.contains("\"centre\": \"" + AlbionCentre.CODE + "\""), EasyMock.not(EasyMock.contains("\n")))))
    EasyMock.replay(logger)
    assertEquals(ShadowReconciliationLedger.GREEN, AlbionShadowReconciliationBatch.report(ledger("A", "A"), logger))
    EasyMock.verify(logger)
  }

  function testRedPeriodIsLoggedAtError() {
    var logger = EasyMock.createMock(Logger)
    logger.error(EasyMock.contains("\"status\": \"RED\""))
    EasyMock.replay(logger)
    assertEquals(ShadowReconciliationLedger.RED, AlbionShadowReconciliationBatch.report(ledger("A", "B"), logger))
    EasyMock.verify(logger)
  }
}

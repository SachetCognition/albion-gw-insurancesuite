package albion.integration.shadow

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.Date

class ShadowReconciliationLedgerTest extends TestBase {

  private function result(feed : String, brand : String, legacy : Object, candidate : Object) : ReconciliationResult {
    return new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.iptMonthEndCountTolerance())
        .run(feed, brand, \ -> legacy, \ -> candidate)
  }

  private function failed(feed : String, brand : String) : ReconciliationResult {
    return new ShadowRunner(new InMemoryShadowDiffRecorder(), ShadowTolerance.exact())
        .run(feed, brand, \ -> "LEGACY", \ -> {
          throw new IllegalStateException("candidate defect")
        })
  }

  function testEmptyLedgerHasNoEvidence() {
    var ledger = new ShadowReconciliationLedger()
    assertEquals(0, ledger.Compared)
    assertEquals(ShadowReconciliationLedger.NO_EVIDENCE, ledger.Status)
    assertEquals(ShadowReconciliationLedger.NO_EVIDENCE, ledger.statusOf("IPT"))
    var json = ledger.toEvidenceJson("shadow-run", "cc", new Date())
    assertTrue(json.contains("\"status\": \"NO_EVIDENCE\""))
    assertTrue(json.contains("\"feeds\": []"))
  }

  function testMatchesAndToleratedCountsAreGreen() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(result("IPT", "ALBDIR", "A", "A"))
    ledger.observe(result("ipt", "albdir", new BigDecimal("100000"), new BigDecimal("100050")))
    assertEquals(2, ledger.Compared)
    assertEquals(ShadowReconciliationLedger.GREEN, ledger.Status)
    var json = ledger.toEvidenceJson("shadow-run", "cc", new Date())
    assertTrue(json.contains("{\"feed\": \"IPT\", \"brand\": \"ALBDIR\", \"compared\": 2, \"matched\": 1, \"withinTolerance\": 1"))
  }

  function testBreachOrCandidateErrorTurnsTheFeedRed() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(result("IPT", "ALBDIR", "A", "A"))
    ledger.observe(result("POLARIS_MF", "HERIT", "A", "B"))
    assertEquals(ShadowReconciliationLedger.GREEN, ledger.statusOf("IPT"))
    assertEquals(ShadowReconciliationLedger.RED, ledger.statusOf("POLARIS_MF"))
    assertEquals(ShadowReconciliationLedger.RED, ledger.Status)
    ledger = new ShadowReconciliationLedger()
    ledger.observe(failed("IPT", "ALBDIR"))
    assertEquals(ShadowReconciliationLedger.RED, ledger.Status)
    assertTrue(ledger.toEvidenceJson("shadow-run", "cc", new Date()).contains("\"candidateErrors\": 1"))
  }

  function testExactlyPointOnePercentIsABreach() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(result("IPT", "ALBDIR", new BigDecimal("100000"), new BigDecimal("100100")))
    assertEquals(ShadowReconciliationLedger.RED, ledger.Status)
  }

  function testCasesKeepOutcomesButNeverRecordContents() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observeCase("ipt/syn_001", result("IPT", "ALBDIR", "IP89 TESTPERSON ZZ99 9ZZ", "IP89 TESTPERSON ZZ99 9ZY"))
    var json = ledger.toEvidenceJson("offline-replay", "cc", new Date())
    assertTrue(json.contains("{\"id\": \"ipt/syn_001\", \"feed\": \"IPT\", \"brand\": \"ALBDIR\", \"outcome\": \"BREACH\", "
        + "\"legacyLength\": 24, \"candidateLength\": 24, \"firstDifferenceIndex\": 23, \"candidateFailure\": null}"))
    assertFalse(json.contains("TESTPERSON"))
    assertTrue(json.contains("\"schema\": \"albion.shadow.evidence/v1\""))
  }

  function testDrainHandsOverThePeriodAndResets() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(result("IPT", "ALBDIR", "A", "A"))
    var period = ledger.drain()
    assertEquals(1, period.Compared)
    assertEquals(0, ledger.Compared)
    assertEquals(ShadowReconciliationLedger.NO_EVIDENCE, ledger.Status)
  }

  function testQuoteEscapesJson() {
    assertEquals("\"a\\\"b\\\\c\\u000a\"", ShadowReconciliationLedger.quote("a\"b\\c\n"))
    assertEquals("null", ShadowReconciliationLedger.quote(null))
  }

  function testNullResultIsIgnored() {
    var ledger = new ShadowReconciliationLedger()
    ledger.observe(null)
    ledger.observeCase("x", null)
    assertEquals(0, ledger.Compared)
  }
}

package albion.integration.shadow

uses gw.testharness.TestBase
uses java.lang.RuntimeException
uses java.math.BigDecimal

/*
 * ShadowRunnerTest - asserts the shadow harness contract: legacy is authoritative, every
 * non-matching run leaves a structured record, tolerance is applied to numbers only and is
 * strictly less-than the documented threshold.
 */
class ShadowRunnerTest extends TestBase {

  static final var FEED : String = "IPT"

  function testIdenticalOutputsMatchAndRecordNothing() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    var result = runner.run(FEED, "ALBDIR", \ -> "IP89AAA", \ -> "IP89AAA")

    assertTrue(result.Matched)
    assertFalse(result.Breach)
    assertEquals("IP89AAA", result.AuthoritativeOutput)
    assertEquals(0, recorder.RecordCount)
  }

  function testStringDifferenceIsABreachAndLegacyStaysAuthoritative() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    var result = runner.run(FEED, "HERIT", \ -> "IP89AAA", \ -> "IP89AXA")

    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertTrue(result.Breach)
    assertEquals("IP89AAA", result.AuthoritativeOutput)
    assertEquals(5, result.FirstDifferenceIndex)
    assertEquals(1, recorder.RecordCount)
    var record = recorder.LastResult.toStructuredRecord()
    assertTrue(record.contains("control=shadow-run"))
    assertTrue(record.contains("feed=IPT"))
    assertTrue(record.contains("brand=HERIT"))
    assertTrue(record.contains("outcome=BREACH"))
    assertTrue(record.contains("firstDifferenceIndex=5"))
  }

  function testStringToleranceIsNeverApplied() {
    // Fixed-width mainframe records are compared byte-exactly whatever the tolerance says.
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    var result = runner.run(FEED, "ALBDIR", \ -> "0000100", \ -> "0000101")

    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertEquals(1, recorder.RecordCount)
  }

  function testNumericDifferenceInsideDocumentedToleranceIsRecordedButNotABreach() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    // 100000 -> 100050 is 0.05%, i.e. inside the documented month-end < 0.1% count tolerance.
    var result = runner.run("IPT-MONTH-END", "ALBDIR", \ -> new BigDecimal("100000"), \ -> new BigDecimal("100050"))

    assertEquals(ReconciliationResult.WITHIN_TOLERANCE, result.Outcome)
    assertTrue(result.WithinTolerance)
    assertFalse(result.Breach)
    assertEquals(new BigDecimal("100000"), result.AuthoritativeOutput)
    assertEquals(1, recorder.RecordCount)   // accepted differences are still evidence
  }

  function testNumericDifferenceOutsideDocumentedToleranceIsABreach() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    var result = runner.run("IPT-MONTH-END", "ALBDIR", \ -> new BigDecimal("100000"), \ -> new BigDecimal("100200"))

    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertEquals(1, recorder.RecordCount)
  }

  function testToleranceIsStrictlyLessThanTheThreshold() {
    // CONTROLS-AND-TOLERANCES.md: "Exactly 0.1% is not stated as acceptable."
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    var result = runner.run("IPT-MONTH-END", "ALBDIR", \ -> new BigDecimal("100000"), \ -> new BigDecimal("100100"))

    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertEquals(new BigDecimal("0.0010000000"), result.RelativeDifference)
  }

  function testZeroLegacyWithNonZeroCandidateIsABreach() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    var result = runner.run("IPT-MONTH-END", "ALBDIR", \ -> BigDecimal.ZERO, \ -> new BigDecimal("1"))

    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertNull(result.RelativeDifference)
  }

  function testCandidateFailureIsContainedAndRecorded() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    var result = runner.run(FEED, "RETPLS", \ -> "IP89AAA", \ -> failingCandidate())

    assertEquals(ReconciliationResult.CANDIDATE_ERROR, result.Outcome)
    assertTrue(result.Breach)
    assertEquals("IP89AAA", result.AuthoritativeOutput)
    assertNotNull(result.CandidateFailure)
    assertEquals(1, recorder.RecordCount)
    assertTrue(recorder.LastResult.toStructuredRecord().contains("outcome=CANDIDATE_ERROR"))
  }

  function testLegacyFailurePropagatesUnchanged() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    try {
      runner.run(FEED, "ALBDIR", \ -> failingLegacy(), \ -> "IP89AAA")
      fail("legacy failures must not be swallowed by the shadow harness")
    } catch (e : java.lang.IllegalStateException) {
      assertEquals("IPT record length 511 != 512", e.Message)
    }
    assertEquals(0, recorder.RecordCount)
  }

  function testNotesAreCarriedOntoRecordedDiffs() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
        .withNote("brand mapping drift risk AGI-30921 / AGI-5452")
    runner.run(FEED, "ALBDIR", \ -> "A", \ -> "B")

    assertTrue(recorder.LastResult.toStructuredRecord().contains("note1=brand_mapping_drift_risk_AGI-30921_/_AGI-5452"))
  }

  function testStructuredRecordIsASingleLine() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    runner.run(FEED, "ALBDIR", \ -> "line\none", \ -> "line\ntwo")

    var record = recorder.LastResult.toStructuredRecord()
    assertFalse(record.contains("\n"))
    assertFalse(record.contains("\r"))
  }

  private function failingCandidate() : Object {
    throw new RuntimeException("candidate blew up")
  }

  private function failingLegacy() : Object {
    throw new java.lang.IllegalStateException("IPT record length 511 != 512")
  }

  function testNullOutputsOnBothSidesMatch() {
    var recorder = new InMemoryShadowDiffRecorder()
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
    var result = runner.run(FEED, "ALBDIR", \ -> null, \ -> null)

    assertTrue(result.Matched)
    assertEquals(0, recorder.RecordCount)
  }
}

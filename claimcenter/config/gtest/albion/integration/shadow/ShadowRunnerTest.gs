package albion.integration.shadow

uses gw.testharness.TestBase
uses java.math.BigDecimal

class ShadowRunnerTest extends TestBase {

  private function runner(recorder : InMemoryShadowDiffRecorder) : ShadowRunner {
    return new ShadowRunner(recorder, ShadowTolerance.exact())
  }

  function testMatchingRecordsAreNotRecorded() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = runner(recorder).run("IPT", "ALBDIR", \ -> "ABC", \ -> "ABC")
    assertTrue(result.Matched)
    assertEquals("ABC", result.AuthoritativeOutput)
    assertEquals(0, recorder.RecordCount)
  }

  function testDifferentRecordIsABreachAndLegacyStaysAuthoritative() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = runner(recorder).run("IPT", "HERIT", \ -> "IP89 0001", \ -> "IP89 0002")
    assertTrue(result.Breach)
    assertEquals("IP89 0001", result.AuthoritativeOutput)
    assertEquals(8, result.FirstDifferenceIndex)
    assertEquals(1, recorder.RecordCount)
    assertSame(result, recorder.LastResult)
  }

  function testRecordsAreComparedByteForByteIncludingTrailingFiller() {
    var result = runner(new InMemoryShadowDiffRecorder()).run("IPT", "ALBDIR", \ -> "AB  ", \ -> "AB ")
    assertTrue(result.Breach)
    assertEquals(3, result.FirstDifferenceIndex)
  }

  function testCandidateFailureIsContained() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = runner(recorder).run("IPT", "ALBDIR", \ -> "LEGACY", \ -> {
      throw new IllegalStateException("candidate defect")
    })
    assertEquals(ReconciliationResult.CANDIDATE_ERROR, result.Outcome)
    assertTrue(result.Breach)
    assertEquals("LEGACY", result.AuthoritativeOutput)
    assertEquals(1, recorder.RecordCount)
  }

  function testLegacyFailurePropagatesAndCandidateDoesNotRun() {
    var candidateRan = false
    try {
      runner(new InMemoryShadowDiffRecorder()).run("IPT", "ALBDIR", \ -> {
        throw new java.lang.StringIndexOutOfBoundsException("legacy")
      }, \ -> {
        candidateRan = true
        return "X"
      })
      fail("legacy failure must propagate")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertEquals("legacy", e.Message)
    }
    assertFalse(candidateRan)
  }

  function testRecorderFailureIsContained() {
    var failing = new ShadowDiffRecorder() {
      override function record(result : ReconciliationResult) {
        throw new IllegalStateException("sink down")
      }
    }
    var result = new ShadowRunner(failing, null).run("IPT", "ALBDIR", \ -> "A", \ -> "B")
    assertEquals("A", result.AuthoritativeOutput)
  }

  function testNumericToleranceIsStrictlyLessThan() {
    var recorder = new InMemoryShadowDiffRecorder()
    var r = new ShadowRunner(recorder, ShadowTolerance.iptMonthEndCountTolerance())
    assertEquals(ReconciliationResult.WITHIN_TOLERANCE, r.run("IPT", null, \ -> 100000bd, \ -> 100099bd).Outcome)
    assertEquals(ReconciliationResult.BREACH, r.run("IPT", null, \ -> 100000bd, \ -> 100100bd).Outcome)
    assertEquals(ReconciliationResult.BREACH, r.run("IPT", null, \ -> 0bd, \ -> 1bd).Outcome)
    assertTrue(r.run("IPT", null, \ -> 12.00bd, \ -> 12.0bd).Matched)
    assertEquals(3, recorder.RecordCount)
  }

  function testStructuredRecordCarriesNoRecordContent() {
    var result = runner(new InMemoryShadowDiffRecorder()).run("POLARIS_MF", "ALBDIR", \ -> "SMITH 123", \ -> "SMYTH 123")
    var line = result.toStructuredRecord()
    assertTrue(line.contains("control=shadow-run"))
    assertTrue(line.contains("feed=POLARIS_MF"))
    assertTrue(line.contains("outcome=BREACH"))
    assertTrue(line.contains("firstDifferenceIndex=2"))
    assertTrue(line.contains("legacyLength=9"))
    assertFalse(line.contains("SMITH"))
    assertFalse(line.contains("SMYTH"))
    assertFalse(line.contains("\n"))
  }
}

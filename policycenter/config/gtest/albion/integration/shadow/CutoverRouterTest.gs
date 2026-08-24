package albion.integration.shadow

uses gw.testharness.TestBase

/*
 * CutoverRouterTest - pins the Phase 3A cut-over semantics: candidate-authoritative on parity,
 * recorded auto-alert plus auto-revert to legacy bytes on ANY difference or candidate failure,
 * and unchanged propagation of legacy failures.
 */
class CutoverRouterTest extends TestBase {

  function testParityRoutesCandidateOutputAndRecordsNothing() {
    var recorder = new InMemoryShadowDiffRecorder()
    var routed = CutoverRouter.route("FEED", "ALBDIR", recorder, "drift-note",
        \ -> "SAME-BYTES", \ -> "SAME-BYTES")
    assertEquals("SAME-BYTES", routed)
    assertEquals(0, recorder.RecordCount)
  }

  function testDifferenceAutoAlertsAndAutoRevertsToLegacyBytes() {
    var recorder = new InMemoryShadowDiffRecorder()
    var routed = CutoverRouter.route("FEED", "ALBBRK", recorder, "drift-note",
        \ -> "LEGACY-BYTES", \ -> "CANDIDATE-BYTES")
    assertEquals("LEGACY-BYTES", routed)   // auto-revert: divergent candidate never reaches the feed
    assertEquals(1, recorder.RecordCount)  // auto-alert: the diff is a recorded breach
    var recorded = recorder.Results.get(0)
    assertEquals(ReconciliationResult.BREACH, recorded.Outcome)
    assertEquals("ALBBRK", recorded.BrandCode)
    assertTrue(recorded.Notes.contains(CutoverRouter.AUTO_REVERT_NOTE))
    assertTrue(recorded.Notes.contains("drift-note"))
  }

  function testCandidateFailureAutoRevertsToLegacyBytes() {
    var recorder = new InMemoryShadowDiffRecorder()
    var routed = CutoverRouter.route("FEED", "RETPLS", recorder, "drift-note",
        \ -> "LEGACY-BYTES",
        \ -> { throw new java.lang.IllegalStateException("candidate blew up") })
    assertEquals("LEGACY-BYTES", routed)
    assertEquals(1, recorder.RecordCount)
    assertEquals(ReconciliationResult.CANDIDATE_ERROR, recorder.Results.get(0).Outcome)
  }

  function testLegacyFailureStillPropagatesDuringTheBake() {
    var recorder = new InMemoryShadowDiffRecorder()
    try {
      CutoverRouter.route("FEED", "HERIT", recorder, "drift-note",
          \ -> { throw new java.lang.IllegalStateException("legacy production failure") },
          \ -> "CANDIDATE-BYTES")
      fail("Expected the legacy failure to propagate unchanged")
    } catch (e : java.lang.IllegalStateException) {
      assertEquals("legacy production failure", e.Message)
    }
    assertEquals(0, recorder.RecordCount)
  }
}

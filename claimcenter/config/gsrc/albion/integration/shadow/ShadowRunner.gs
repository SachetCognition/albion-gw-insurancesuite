package albion.integration.shadow

uses java.lang.Throwable
uses java.math.BigDecimal

/**
 * Runs a legacy producer and a candidate producer over the same input, returns the LEGACY output as authoritative
 * and hands every result that is not a MATCH to the ShadowDiffRecorder.
 *
 *  - The legacy producer runs first and its exceptions propagate unchanged: production behaviour, production failures
 *    included, is not altered by shadow running. The candidate is not run when the legacy producer fails.
 *  - The candidate producer is contained: any Throwable it raises becomes a CANDIDATE_ERROR result.
 *  - A recorder failure is contained as well; it never reaches the caller.
 *  - Strings are compared byte for byte. Numbers use the relative ShadowTolerance.
 */
class ShadowRunner {

  var _recorder : ShadowDiffRecorder as readonly Recorder
  var _tolerance : ShadowTolerance as readonly Tolerance

  construct(recorder : ShadowDiffRecorder, tolerance : ShadowTolerance) {
    _recorder = recorder == null ? new LoggingShadowDiffRecorder() : recorder
    _tolerance = tolerance == null ? ShadowTolerance.exact() : tolerance
  }

  function run(feedName : String, brandCode : String, legacy : block() : Object, candidate : block() : Object) : ReconciliationResult {
    var legacyOutput = legacy()
    var result : ReconciliationResult
    try {
      result = compare(feedName, brandCode, legacyOutput, candidate())
    } catch (failure : Throwable) {
      result = new ReconciliationResult(feedName, brandCode, ReconciliationResult.CANDIDATE_ERROR, legacyOutput, null,
          "candidate producer failed", ReconciliationResult.NO_DIFFERENCE_INDEX, null, _tolerance, failure)
    }
    if (not result.Matched) {
      try {
        _recorder.record(result)
      } catch (failure : Throwable) {
        print("albion.integration.shadow: recorder failed for feed " + feedName + " : " + failure.Class.Name)
      }
    }
    return result
  }

  private function compare(feedName : String, brandCode : String, legacyOutput : Object, candidateOutput : Object) : ReconciliationResult {
    if (legacyOutput typeis String and candidateOutput typeis String) {
      if (legacyOutput == candidateOutput) {
        return matched(feedName, brandCode, legacyOutput, candidateOutput)
      }
      var index = firstDifference(legacyOutput, candidateOutput)
      return new ReconciliationResult(feedName, brandCode, ReconciliationResult.BREACH, legacyOutput, candidateOutput,
          "record bytes differ", index, null, _tolerance, null)
    }
    if (legacyOutput typeis BigDecimal and candidateOutput typeis BigDecimal) {
      if (legacyOutput.compareTo(candidateOutput) == 0) {
        return matched(feedName, brandCode, legacyOutput, candidateOutput)
      }
      var outcome = _tolerance.permits(legacyOutput, candidateOutput) ? ReconciliationResult.WITHIN_TOLERANCE : ReconciliationResult.BREACH
      return new ReconciliationResult(feedName, brandCode, outcome, legacyOutput, candidateOutput,
          "legacy=" + legacyOutput.toPlainString() + " candidate=" + candidateOutput.toPlainString(),
          ReconciliationResult.NO_DIFFERENCE_INDEX, _tolerance.relativeDifference(legacyOutput, candidateOutput), _tolerance, null)
    }
    if (legacyOutput == null ? candidateOutput == null : legacyOutput.equals(candidateOutput)) {
      return matched(feedName, brandCode, legacyOutput, candidateOutput)
    }
    return new ReconciliationResult(feedName, brandCode, ReconciliationResult.BREACH, legacyOutput, candidateOutput,
        "outputs are not equal", ReconciliationResult.NO_DIFFERENCE_INDEX, null, _tolerance, null)
  }

  private function matched(feedName : String, brandCode : String, legacyOutput : Object, candidateOutput : Object) : ReconciliationResult {
    return new ReconciliationResult(feedName, brandCode, ReconciliationResult.MATCH, legacyOutput, candidateOutput,
        null, ReconciliationResult.NO_DIFFERENCE_INDEX, BigDecimal.ZERO, _tolerance, null)
  }

  private function firstDifference(a : String, b : String) : int {
    var shortest = Math.min(a.length(), b.length())
    for (i in 0..|shortest) {
      if (a.charAt(i) != b.charAt(i)) {
        return i
      }
    }
    return shortest
  }
}

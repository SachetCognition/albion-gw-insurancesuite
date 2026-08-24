package albion.integration.shadow

uses java.lang.Throwable
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.List

/*
 * ShadowRunner - runs a legacy producer and a candidate producer over the same input,
 * returns the LEGACY output as authoritative, and records a structured diff whenever the
 * two disagree.
 *
 * Contract:
 *   - the legacy producer runs first and its exceptions propagate unchanged: production
 *     behaviour, including production failures, is not altered by shadow running;
 *   - the candidate producer is fully contained - any Throwable it raises is captured as a
 *     CANDIDATE_ERROR record and never reaches the caller;
 *   - every non-matching run is handed to the ShadowDiffRecorder. Nothing is printed.
 *
 * Tolerance semantics: strings (fixed-width mainframe records) are compared byte-exactly and
 * a tolerance never relaxes them. Numeric comparisons use the relative tolerance from
 * ShadowTolerance, e.g. the documented IPT month-end < 0.1% count tolerance.
 */
class ShadowRunner {

  var _recorder : ShadowDiffRecorder as readonly Recorder
  var _tolerance : ShadowTolerance as readonly Tolerance
  var _notes : List<String> = new ArrayList<String>()

  construct(recorder : ShadowDiffRecorder, tolerance : ShadowTolerance) {
    _recorder = recorder == null ? new LoggingShadowDiffRecorder() : recorder
    _tolerance = tolerance == null ? ShadowTolerance.exact() : tolerance
  }

  /** Attaches a note that is carried on every recorded diff, e.g. a known drift risk. */
  public function withNote(note : String) : ShadowRunner {
    if (note != null) {
      _notes.add(note)
    }
    return this
  }

  public function run(feedName : String,
                      brandCode : String,
                      legacy : block() : Object,
                      candidate : block() : Object) : ReconciliationResult {
    var legacyOutput = legacy()   // authoritative; failures propagate exactly as today

    var candidateOutput : Object = null
    try {
      candidateOutput = candidate()
    } catch (failure : Throwable) {
      return recorded(new ReconciliationResult(feedName, brandCode, ReconciliationResult.CANDIDATE_ERROR,
          legacyOutput, null, "candidate producer failed", ReconciliationResult.NO_DIFFERENCE_INDEX,
          null, _tolerance, failure, notesCopy()))
    }

    return recorded(compare(feedName, brandCode, legacyOutput, candidateOutput))
  }

  private function compare(feedName : String, brandCode : String, legacyOutput : Object, candidateOutput : Object) : ReconciliationResult {
    if (legacyOutput == null and candidateOutput == null) {
      return matched(feedName, brandCode, legacyOutput, candidateOutput)
    }
    if (legacyOutput typeis String and candidateOutput typeis String) {
      return compareStrings(feedName, brandCode, legacyOutput as String, candidateOutput as String)
    }
    if (isNumeric(legacyOutput) and isNumeric(candidateOutput)) {
      return compareNumbers(feedName, brandCode, legacyOutput, candidateOutput)
    }
    if (legacyOutput != null and legacyOutput.equals(candidateOutput)) {
      return matched(feedName, brandCode, legacyOutput, candidateOutput)
    }
    return new ReconciliationResult(feedName, brandCode, ReconciliationResult.BREACH, legacyOutput,
        candidateOutput, "outputs are not equal", ReconciliationResult.NO_DIFFERENCE_INDEX, null,
        _tolerance, null, notesCopy())
  }

  private function compareStrings(feedName : String, brandCode : String, legacyOutput : String, candidateOutput : String) : ReconciliationResult {
    if (legacyOutput == candidateOutput) {
      return matched(feedName, brandCode, legacyOutput, candidateOutput)
    }
    var index = firstDifference(legacyOutput, candidateOutput)
    var difference = "length legacy=" + legacyOutput.length() + " candidate=" + candidateOutput.length()
        + " firstDiff@" + index
        + " legacy=[" + window(legacyOutput, index) + "] candidate=[" + window(candidateOutput, index) + "]"
    return new ReconciliationResult(feedName, brandCode, ReconciliationResult.BREACH, legacyOutput,
        candidateOutput, difference, index, null, _tolerance, null, notesCopy())
  }

  private function compareNumbers(feedName : String, brandCode : String, legacyOutput : Object, candidateOutput : Object) : ReconciliationResult {
    var legacyNumber = toBigDecimal(legacyOutput)
    var candidateNumber = toBigDecimal(candidateOutput)
    var relative = _tolerance.relativeDifference(legacyNumber, candidateNumber)
    if (legacyNumber.compareTo(candidateNumber) == 0) {
      return matched(feedName, brandCode, legacyOutput, candidateOutput)
    }
    var outcome = _tolerance.permits(legacyNumber, candidateNumber)
        ? ReconciliationResult.WITHIN_TOLERANCE
        : ReconciliationResult.BREACH
    var difference = "legacy=" + legacyNumber.toPlainString() + " candidate=" + candidateNumber.toPlainString()
    return new ReconciliationResult(feedName, brandCode, outcome, legacyOutput, candidateOutput,
        difference, ReconciliationResult.NO_DIFFERENCE_INDEX, relative, _tolerance, null, notesCopy())
  }

  private function matched(feedName : String, brandCode : String, legacyOutput : Object, candidateOutput : Object) : ReconciliationResult {
    return new ReconciliationResult(feedName, brandCode, ReconciliationResult.MATCH, legacyOutput,
        candidateOutput, null, ReconciliationResult.NO_DIFFERENCE_INDEX, BigDecimal.ZERO, _tolerance,
        null, notesCopy())
  }

  private function recorded(result : ReconciliationResult) : ReconciliationResult {
    if (not result.Matched) {
      _recorder.record(result)
    }
    return result
  }

  private function notesCopy() : List<String> {
    var copy = new ArrayList<String>()
    copy.addAll(_notes)
    return copy
  }

  private function firstDifference(legacyOutput : String, candidateOutput : String) : int {
    var shortest = Math.min(legacyOutput.length(), candidateOutput.length())
    for (i in 0..|shortest) {
      if (legacyOutput.charAt(i) != candidateOutput.charAt(i)) {
        return i
      }
    }
    return shortest
  }

  private function window(value : String, index : int) : String {
    if (index >= value.length()) {
      return ""
    }
    var end = Math.min(value.length(), index + 8)
    return value.substring(index, end)
  }

  private function isNumeric(value : Object) : boolean {
    return value typeis java.lang.Number
  }

  private function toBigDecimal(value : Object) : BigDecimal {
    if (value typeis BigDecimal) {
      return value as BigDecimal
    }
    return new BigDecimal((value as java.lang.Number).toString())
  }
}

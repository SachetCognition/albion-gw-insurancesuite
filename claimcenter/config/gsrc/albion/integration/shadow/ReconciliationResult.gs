package albion.integration.shadow

uses java.lang.StringBuilder
uses java.lang.Throwable
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.ArrayList
uses java.util.Date
uses java.util.List

/*
 * ReconciliationResult - the structured outcome of one shadow run.
 *
 * The legacy output is always authoritative: AuthoritativeOutput returns it whatever the
 * candidate produced, and a candidate failure never becomes a caller-visible failure.
 */
class ReconciliationResult {

  public static final var MATCH : String = "MATCH"
  public static final var WITHIN_TOLERANCE : String = "WITHIN_TOLERANCE"
  public static final var BREACH : String = "BREACH"
  public static final var CANDIDATE_ERROR : String = "CANDIDATE_ERROR"

  public static final var NO_DIFFERENCE_INDEX : int = -1

  var _feedName : String as readonly FeedName
  var _brandCode : String as readonly BrandCode
  var _outcome : String as readonly Outcome
  var _legacyOutput : Object as readonly LegacyOutput
  var _candidateOutput : Object as readonly CandidateOutput
  var _difference : String as readonly Difference
  var _firstDifferenceIndex : int as readonly FirstDifferenceIndex
  var _relativeDifference : BigDecimal as readonly RelativeDifference
  var _tolerance : ShadowTolerance as readonly Tolerance
  var _candidateFailure : Throwable as readonly CandidateFailure
  var _recordedAt : Date as readonly RecordedAt
  var _notes : List<String> as readonly Notes

  construct(feedName : String,
            brandCode : String,
            outcome : String,
            legacyOutput : Object,
            candidateOutput : Object,
            difference : String,
            firstDifferenceIndex : int,
            relativeDifference : BigDecimal,
            tolerance : ShadowTolerance,
            candidateFailure : Throwable,
            notes : List<String>) {
    _feedName = feedName
    _brandCode = brandCode
    _outcome = outcome
    _legacyOutput = legacyOutput
    _candidateOutput = candidateOutput
    _difference = difference
    _firstDifferenceIndex = firstDifferenceIndex
    _relativeDifference = relativeDifference
    _tolerance = tolerance
    _candidateFailure = candidateFailure
    _recordedAt = new Date()
    _notes = notes == null ? new ArrayList<String>() : notes
  }

  /** The value callers must use. Always the legacy producer's output. */
  public property get AuthoritativeOutput() : Object {
    return _legacyOutput
  }

  public property get Matched() : boolean {
    return MATCH == _outcome
  }

  public property get WithinTolerance() : boolean {
    return WITHIN_TOLERANCE == _outcome
  }

  /** True when the difference must be treated as a control breach rather than accepted noise. */
  public property get Breach() : boolean {
    return BREACH == _outcome or CANDIDATE_ERROR == _outcome
  }

  /**
   * Machine-parseable record of the comparison. Field order is stable so that log-derived
   * evidence can be diffed and counted; values are sanitised so a record is always one line.
   */
  public function toStructuredRecord() : String {
    var record = new StringBuilder()
    append(record, "ts", new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").format(_recordedAt))
    append(record, "control", "shadow-run")
    append(record, "feed", _feedName)
    append(record, "brand", _brandCode)
    append(record, "outcome", _outcome)
    append(record, "tolerance", _tolerance == null ? null : _tolerance.Description)
    append(record, "toleranceMax", _tolerance == null ? null : _tolerance.MaxRelativeDifference.toPlainString())
    append(record, "relativeDifference", _relativeDifference == null ? null : _relativeDifference.toPlainString())
    append(record, "firstDifferenceIndex", java.lang.String.valueOf(_firstDifferenceIndex))
    append(record, "legacyLength", lengthOf(_legacyOutput))
    append(record, "candidateLength", lengthOf(_candidateOutput))
    append(record, "difference", _difference)
    append(record, "candidateFailure", _candidateFailure == null ? null : _candidateFailure.getClass().getName() + ": " + _candidateFailure.Message)
    for (note in _notes index i) {
      append(record, "note" + (i + 1), note)
    }
    return record.toString()
  }

  private function lengthOf(value : Object) : String {
    if (value == null) {
      return "null"
    }
    return value typeis String ? java.lang.String.valueOf((value as String).length()) : "n/a"
  }

  private function append(record : StringBuilder, key : String, value : String) {
    if (record.length() > 0) {
      record.append(" ")
    }
    record.append(key).append("=").append(sanitise(value))
  }

  private function sanitise(value : String) : String {
    if (value == null) {
      return "-"
    }
    var text = value.replaceAll("[\\r\\n\\t ]", "_")
    return text.length() == 0 ? "-" : text
  }
}

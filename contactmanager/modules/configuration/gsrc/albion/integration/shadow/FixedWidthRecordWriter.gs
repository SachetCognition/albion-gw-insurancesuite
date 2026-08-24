package albion.integration.shadow

uses java.lang.StringBuilder
uses java.text.SimpleDateFormat

/*
 * FixedWidthRecordWriter - shared field encoder used by the Phase 1 CANDIDATE record builders.
 *
 * This class exists so a candidate builder can be expressed as a field layout instead of a
 * hand-transcribed StringBuilder sequence. It is a byte-for-byte reproduction of the legacy
 * encoders, quirks included, because the candidate must not "fix" anything:
 *
 *   - pad(): silent truncation of over-length values (GWCC-25665 / CHG-34717, both wontfix);
 *   - padNum(): implied 2 decimal places, no decimal point, and COBOL trailing-overpunch
 *     negatives via the "JKLMNOPQR" mapping - including its failure on a final digit of 9;
 *   - formatDate(): null renders as "00000000";
 *   - build(): filler to the declared record length, then the length guard that throws
 *     IllegalStateException (seen in prod twice, both times on 29th Feb).
 *
 * The legacy builders are NOT refactored onto this class in Phase 1. They remain authoritative.
 */
class FixedWidthRecordWriter {

  var _recordLength : int
  var _fillerChar : String
  var _record : StringBuilder

  construct(recordLength : int, fillerChar : String) {
    _recordLength = recordLength
    _fillerChar = fillerChar
    _record = new StringBuilder(recordLength)
  }

  /** Literal field, e.g. the record type. No safe() normalisation, matching the legacy call. */
  public function literal(value : String, width : int) : FixedWidthRecordWriter {
    _record.append(pad(value, width))
    return this
  }

  /** Text field: pipe/CR/LF normalised then padded or silently truncated. */
  public function text(value : String, width : int) : FixedWidthRecordWriter {
    _record.append(pad(safe(value), width))
    return this
  }

  /** Numeric field: zero-padded, implied 2dp, COBOL trailing overpunch for negatives. */
  public function number(value : Object, width : int) : FixedWidthRecordWriter {
    _record.append(padNum(value, width))
    return this
  }

  public function date(value : Object, pattern : String) : FixedWidthRecordWriter {
    _record.append(formatDate(value, pattern))
    return this
  }

  public function build(recordName : String) : String {
    _record.append(pad("", _recordLength - _record.length()))
    if (_record.length() != _recordLength) {
      throw new java.lang.IllegalStateException(recordName + " record length " + _record.length() + " != " + _recordLength)
    }
    return _record.toString()
  }

  private function pad(s : String, w : int) : String {
    var value = s
    if (value == null) { value = "" }
    if (value.length() > w) { value = value.substring(0, w) }   // silent truncation, as per POLARIS
    return value + _fillerChar.repeat(w - value.length())
  }

  private function padNum(v : Object, w : int) : String {
    var n = (v == null) ? 0bd : (v as java.math.BigDecimal)
    var cents = n.movePointRight(2).setScale(0, java.math.RoundingMode.HALF_UP)
    var s = cents.toPlainString()
    if (s.startsWith("-")) {
      s = s.substring(1)
      var last = s.charAt(s.length()-1)
      s = s.substring(0, s.length()-1) + "JKLMNOPQR".charAt(last - '1' + 1)
    }
    while (s.length() < w) { s = "0" + s }
    return s
  }

  private function formatDate(v : Object, pattern : String) : String {
    return v == null ? "00000000" : new SimpleDateFormat(pattern).format(v)
  }

  private function safe(s : String) : String {
    return s == null ? "" : s.replaceAll("[|\\r\\n]", " ")
  }
}

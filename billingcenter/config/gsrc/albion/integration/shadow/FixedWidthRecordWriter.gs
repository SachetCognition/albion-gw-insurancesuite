package albion.integration.shadow

uses java.lang.StringBuilder
uses java.math.BigDecimal
uses java.math.RoundingMode
uses java.text.SimpleDateFormat

/**
 * Field-layout encoder for the candidate record builders. Reproduces the legacy encoders byte for byte, quirks
 * included, because a candidate must not change production output:
 *  - text(): "|", CR and LF become a space, then pad or silently truncate to the width;
 *  - number(): implied 2 decimal places (HALF_UP), no decimal point, zero padded, COBOL trailing overpunch
 *    "JKLMNOPQR" for negatives, including the StringIndexOutOfBoundsException on a final digit of 9;
 *  - date(): null renders as "00000000";
 *  - build(): filler to the record length, then the length guard.
 */
class FixedWidthRecordWriter {

  var _recordLength : int
  var _recordName : String
  var _record : StringBuilder

  construct(recordName : String, recordLength : int) {
    _recordName = recordName
    _recordLength = recordLength
    _record = new StringBuilder(recordLength)
  }

  /** Literal field (record type, mapped code): padded, no character normalisation. */
  function literal(value : String, width : int) : FixedWidthRecordWriter {
    _record.append(pad(value, width))
    return this
  }

  function text(value : Object, width : int) : FixedWidthRecordWriter {
    var s = value as String
    _record.append(pad(s == null ? "" : s.replaceAll("[|\\r\\n]", " "), width))
    return this
  }

  function number(value : Object, width : int) : FixedWidthRecordWriter {
    var n = value == null ? BigDecimal.ZERO : value as BigDecimal
    var s = n.movePointRight(2).setScale(0, RoundingMode.HALF_UP).toPlainString()
    if (s.startsWith("-")) {
      s = s.substring(1)
      var last = s.charAt(s.length() - 1)
      s = s.substring(0, s.length() - 1) + "JKLMNOPQR".charAt(last - '1' + 1)
    }
    while (s.length() < width) {
      s = "0" + s
    }
    _record.append(s)
    return this
  }

  function date(value : Object, pattern : String) : FixedWidthRecordWriter {
    _record.append(value == null ? "00000000" : new SimpleDateFormat(pattern).format(value))
    return this
  }

  function build() : String {
    _record.append(pad("", _recordLength - _record.length()))
    if (_record.length() != _recordLength) {
      throw new IllegalStateException(_recordName + " record length " + _record.length() + " != " + _recordLength)
    }
    return _record.toString()
  }

  private function pad(value : String, width : int) : String {
    var s = value == null ? "" : value
    if (s.length() > width) {
      s = s.substring(0, width)
    }
    return s + " ".repeat(width - s.length())
  }
}

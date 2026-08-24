package albion.integration.testsupport

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

abstract class RecordBuilderCharacterizationTestBase extends TestBase {

  protected function characterize(builder : block(src : KeyableBean) : String,
                                   recordType : String,
                                   recordLength : int,
                                   firstField : String,
                                   firstWidth : int,
                                   secondField : String,
                                   secondWidth : int,
                                   numberField : String,
                                   numberWidth : int,
                                   dateField : String) {
    assertRecord(builder, recordType, recordLength, firstField, firstWidth, null,
        secondField, secondWidth, null, numberField, numberWidth, null, dateField, null, null)

    var leapDay = new SimpleDateFormat("yyyyMMdd").parse("20200229")
    assertRecord(builder, recordType, recordLength, firstField, firstWidth,
        "FIRST|LINE\nOVER-LENGTH-ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        secondField, secondWidth, "SECOND\rLINE|OVER-LENGTH-ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numberField, numberWidth, -123.45bd, dateField, leapDay, "ALBDIR")

    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "UNKNOWN", null}
    for (brand in brands) {
      assertRecord(builder, recordType, recordLength, firstField, firstWidth, null,
          secondField, secondWidth, null, numberField, numberWidth, 0bd, dateField, null, brand)
    }
  }

  protected function characterizeNegativeOverpunch(builder : block(src : KeyableBean) : String,
                                                    recordType : String,
                                                    recordLength : int,
                                                    firstField : String,
                                                    firstWidth : int,
                                                    secondField : String,
                                                    secondWidth : int,
                                                    numberField : String,
                                                    numberWidth : int,
                                                    dateField : String) {
    for (digit in 0..9) {
      var value = new BigDecimal("-1.0" + digit)
      assertRecord(builder, recordType, recordLength, firstField, firstWidth, null,
          secondField, secondWidth, null, numberField, numberWidth, value, dateField, null, "HERIT")
    }
  }

  protected function characterizeCapturedSample(builder : block(src : KeyableBean) : String,
                                                 recordType : String,
                                                 recordLength : int,
                                                 firstField : String,
                                                 firstWidth : int,
                                                 firstValue : String,
                                                 secondField : String,
                                                 secondWidth : int,
                                                 secondValue : String,
                                                 numberField : String,
                                                 numberWidth : int,
                                                 dateField : String,
                                                 brand : String) {
    assertRecord(builder, recordType, recordLength, firstField, firstWidth, firstValue,
        secondField, secondWidth, secondValue, numberField, numberWidth, null, dateField, null, brand)
  }

  protected function characterizeOversizedNumberFailure(builder : block(src : KeyableBean) : String,
                                                         recordLength : int,
                                                         firstField : String,
                                                         secondField : String,
                                                         numberField : String,
                                                         dateField : String) {
    var source = mockSource(firstField, null, secondField, null, numberField,
        BigDecimal.TEN.pow(recordLength), dateField, null, "ALBDIR")
    try {
      builder(source)
      fail("Expected the production oversized-number failure")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e.Message) // Encodes current PROD guard-preemption behaviour, right or wrong.
    }
    EasyMock.verify(source)
  }

  private function assertRecord(builder : block(src : KeyableBean) : String,
                                recordType : String,
                                recordLength : int,
                                firstField : String,
                                firstWidth : int,
                                firstValue : String,
                                secondField : String,
                                secondWidth : int,
                                secondValue : String,
                                numberField : String,
                                numberWidth : int,
                                numberValue : BigDecimal,
                                dateField : String,
                                dateValue : Date,
                                brand : String) {
    var source = mockSource(firstField, firstValue, secondField, secondValue,
        numberField, numberValue, dateField, dateValue, brand)
    var actual = builder(source)
    var expected = expectedRecord(recordType, recordLength, firstValue, firstWidth,
        secondValue, secondWidth, numberValue, numberWidth, dateValue, brand)

    assertEquals(expected, actual) // Encodes current PROD bytes, right or wrong.
    assertEquals(recordLength, actual.length()) // Encodes current PROD fixed-width behaviour, right or wrong.
    EasyMock.verify(source)
  }

  private function mockSource(firstField : String,
                              firstValue : String,
                              secondField : String,
                              secondValue : String,
                              numberField : String,
                              numberValue : BigDecimal,
                              dateField : String,
                              dateValue : Date,
                              brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue(firstField)).andReturn(firstValue)
    EasyMock.expect(source.getFieldValue(secondField)).andReturn(secondValue)
    EasyMock.expect(source.getFieldValue(numberField)).andReturn(numberValue)
    EasyMock.expect(source.getFieldValue(dateField)).andReturn(dateValue)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function expectedRecord(recordType : String,
                                  recordLength : int,
                                  firstValue : String,
                                  firstWidth : int,
                                  secondValue : String,
                                  secondWidth : int,
                                  numberValue : BigDecimal,
                                  numberWidth : int,
                                  dateValue : Date,
                                  brand : String) : String {
    var prefix = pad(recordType, 4)
        + pad(safe(firstValue), firstWidth)
        + pad(safe(secondValue), secondWidth)
        + padNumber(numberValue, numberWidth)
        + formatDate(dateValue)
        + pad(brandCode(brand), 6)
    return prefix + " ".repeat(recordLength - prefix.length())
  }

  private function pad(value : String, width : int) : String {
    var normalized = value == null ? "" : value
    if (normalized.length() > width) {
      normalized = normalized.substring(0, width)
    }
    return normalized + " ".repeat(width - normalized.length())
  }

  private function padNumber(value : BigDecimal, width : int) : String {
    var number = value == null ? 0bd : value
    var encoded = number.movePointRight(2).setScale(0, java.math.RoundingMode.HALF_UP).toPlainString()
    if (encoded.startsWith("-")) {
      encoded = encoded.substring(1)
      var last = encoded.charAt(encoded.length() - 1)
      encoded = encoded.substring(0, encoded.length() - 1) + "JKLMNOPQR".charAt(last - '1' + 1)
    }
    while (encoded.length() < width) {
      encoded = "0" + encoded
    }
    return encoded
  }

  private function formatDate(value : Date) : String {
    return value == null ? "00000000" : new SimpleDateFormat("yyyyMMdd").format(value)
  }

  private function safe(value : String) : String {
    return value == null ? "" : value.replaceAll("[|\\r\\n]", " ")
  }

  private function brandCode(brand : String) : String {
    switch (brand) {
      case "ALBDIR": return "01AD00"
      case "ALBBRK": return "02BK00"
      case "RETPLS": return "07RP01"
      case "HERIT": return "00XX99"
      default: return "999999"
    }
  }
}

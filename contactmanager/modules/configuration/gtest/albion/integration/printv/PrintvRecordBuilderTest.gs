package albion.integration.printv

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses java.util.Map
uses org.easymock.EasyMock

class PrintvRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/printv/good_03.xml.
    characterize(\ src -> PrintvRecordBuilder.buildRecord(src), "PR16", 250,
        "InsuredSurname_Ext", 12, "ClaimNumber_Ext", 30,
        "RiskPostcode_Ext", 15, "PolicyNumber_Ext")
    characterizeCapturedSample(\ src -> PrintvRecordBuilder.buildRecord(src), "PR16", 250,
        "InsuredSurname_Ext", 12, "INC-4811", "ClaimNumber_Ext", 30, "P393799400B",
        "RiskPostcode_Ext", 15, "PolicyNumber_Ext", "RETPLS")
  }

  function testRecordLength() {
    assertEquals(250, PrintvRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }

  // ---------------------------------------------------------------- PR17 renewal invite record (draft layout)

  static final var PR16_FIELDS : String[] = {"InsuredSurname_Ext", "RiskPostcode_Ext", "PolicyNumber_Ext", "BrandCode_Ext"}
  static final var PR17_FIELDS : String[] = {"InsuredSurname_Ext", "RiskPostcode_Ext", "PolicyNumber_Ext", "BrandCode_Ext",
      "PriorPremium_Ext", "RenewalPremium_Ext", "EquivalentNBPremium_Ext", "NCDYears_Ext", "PolicyYear_Ext", "RenewalOptOut_Ext"}

  private function renewalInvite() : Map<String, Object> {
    var values = new HashMap<String, Object>()
    values.put("InsuredSurname_Ext", "TESTPERSON-OVERLONG")
    values.put("RiskPostcode_Ext", 12.34bd)
    values.put("PolicyNumber_Ext", new SimpleDateFormat("yyyyMMdd").parse("20260131"))
    values.put("BrandCode_Ext", "ALBDIR")
    values.put("PriorPremium_Ext", 412.30bd)
    values.put("RenewalPremium_Ext", 438.10bd)
    values.put("EquivalentNBPremium_Ext", 441.00bd)
    values.put("NCDYears_Ext", 7)
    values.put("PolicyYear_Ext", 4)
    values.put("RenewalOptOut_Ext", Boolean.TRUE)
    return values
  }

  private function mockFrom(fields : String[], values : Map<String, Object>) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    for (field in fields) {
      EasyMock.expect(source.getFieldValue(field)).andReturn(values.get(field))
    }
    EasyMock.replay(source)
    return source
  }

  private function pr17(values : Map<String, Object>) : String {
    var source = mockFrom(PR17_FIELDS, values)
    var record = PrintvRecordBuilder.buildRecordPR17(source)
    assertEquals(300, record.length())
    EasyMock.verify(source)
    return record
  }

  private function pr17With(field : String, value : Object) : String {
    var values = renewalInvite()
    values.put(field, value)
    return pr17(values)
  }

  private static function at(record : String, from : int, to : int) : String {
    return record.substring(from - 1, to)   // 1-based, inclusive, as the copybook
  }

  function testPR17FieldOffsets() {
    var record = pr17(renewalInvite())
    assertEquals("PR17", at(record, 1, 4))
    assertEquals("TESTPERSON-O", at(record, 5, 16))
    assertEquals(" ".repeat(30), at(record, 17, 46))
    assertEquals("000000000001234", at(record, 47, 61))
    assertEquals("20260131", at(record, 62, 69))
    assertEquals("01AD00", at(record, 70, 75))
    assertEquals("000000000041230", at(record, 76, 90))
    assertEquals("000000000043810", at(record, 91, 105))
    assertEquals("000000000044100", at(record, 106, 120))
    assertEquals("07", at(record, 121, 122))
    assertEquals("Y", at(record, 123, 123))
    assertEquals("Y", at(record, 124, 124))
    assertEquals(" ".repeat(176), at(record, 125, 300))
  }

  function testPR17RepeatsPR16Positions005To075() {
    var values = renewalInvite()
    var pr16 = PrintvRecordBuilder.buildRecord(mockFrom(PR16_FIELDS, values))
    assertEquals(at(pr16, 5, 75), at(pr17(values), 5, 75))
    var empty = new HashMap<String, Object>()
    assertEquals(at(PrintvRecordBuilder.buildRecord(mockFrom(PR16_FIELDS, empty)), 5, 75), at(pr17(empty), 5, 75))
  }

  function testPR17AllFieldsAbsent() {
    var record = pr17(new HashMap<String, Object>())
    assertEquals("PR17" + " ".repeat(42) + "0".repeat(15) + "00000000" + "999999" + "0".repeat(45) + "00NN" + " ".repeat(176), record)
  }

  function testPR17NegativePremiumsUseTrailingOverpunch() {
    // Same padNum as PR16: last digit d of a negative value becomes "JKLMNOPQR"[d]. Encodes current PROD encoding, right or wrong.
    var overpunch = "JKLMNOPQR"
    for (digit in 0..8) {
      var record = pr17With("PriorPremium_Ext", new BigDecimal("-1.0" + digit))
      assertEquals("0000000000010" + overpunch.charAt(digit), at(record, 76, 90).substring(1))
    }
    assertEquals("00000000004381J", at(pr17With("RenewalPremium_Ext", -438.10bd), 91, 105))
    assertEquals("00000000004410J", at(pr17With("EquivalentNBPremium_Ext", -441.00bd), 106, 120))
  }

  function testPR17NegativeNineOverpunchFails() {
    var source = EasyMock.createMock(KeyableBean)
    var values = renewalInvite()
    values.put("PriorPremium_Ext", new BigDecimal("-1.09"))
    for (field in PR17_FIELDS) {
      EasyMock.expect(source.getFieldValue(field)).andStubReturn(values.get(field))
    }
    EasyMock.replay(source)
    try {
      PrintvRecordBuilder.buildRecordPR17(source)
      fail("Expected the production negative-nine overpunch failure")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e.Message) // Same overpunch failure as PR16, right or wrong.
    }
  }

  function testPR17OverWidthPremiumShiftsLaterFields() {
    // padNum never truncates, so an over-width amount pushes the later fields right and eats filler; length stays 300.
    var record = pr17With("PriorPremium_Ext", new BigDecimal("12345678901234.56"))
    assertEquals("1234567890123456", at(record, 76, 91))
    assertEquals("000000000043810", at(record, 92, 106))
    assertEquals(" ".repeat(175), at(record, 126, 300))
  }

  function testPR17NcdYears() {
    assertEquals("00", at(pr17With("NCDYears_Ext", null), 121, 122))
    assertEquals("00", at(pr17With("NCDYears_Ext", 0), 121, 122))
    assertEquals("07", at(pr17With("NCDYears_Ext", 7), 121, 122))
    assertEquals("12", at(pr17With("NCDYears_Ext", 12), 121, 122))
    assertEquals("99", at(pr17With("NCDYears_Ext", 99), 121, 122))
    assertEquals("99", at(pr17With("NCDYears_Ext", 120), 121, 122))
    assertEquals("00", at(pr17With("NCDYears_Ext", -3), 121, 122))
    assertEquals("05", at(pr17With("NCDYears_Ext", 5.9bd), 121, 122))
  }

  function testPR17ShoppingAroundFromPolicyYearFour() {
    assertEquals("N", at(pr17With("PolicyYear_Ext", null), 123, 123))
    assertEquals("N", at(pr17With("PolicyYear_Ext", 1), 123, 123))
    assertEquals("N", at(pr17With("PolicyYear_Ext", 3), 123, 123))
    assertEquals("Y", at(pr17With("PolicyYear_Ext", 4), 123, 123))
    assertEquals("Y", at(pr17With("PolicyYear_Ext", 5), 123, 123))
  }

  function testPR17OptOutFlag() {
    var setValues : Object[] = {Boolean.TRUE, "Y", "y", " Y ", "TRUE", "true", "1"}
    for (value in setValues) {
      assertEquals(String.valueOf(value), "Y", at(pr17With("RenewalOptOut_Ext", value), 124, 124))
    }
    var unsetValues : Object[] = {null, Boolean.FALSE, "N", "false", "0", "", "YES", 1}
    for (value in unsetValues) {
      assertEquals(String.valueOf(value), "N", at(pr17With("RenewalOptOut_Ext", value), 124, 124))
    }
  }

  function testPR17BrandCodes() {
    assertEquals("01AD00", at(pr17With("BrandCode_Ext", "ALBDIR"), 70, 75))
    assertEquals("02BK00", at(pr17With("BrandCode_Ext", "ALBBRK"), 70, 75))
    assertEquals("07RP01", at(pr17With("BrandCode_Ext", "RETPLS"), 70, 75))
    assertEquals("00XX99", at(pr17With("BrandCode_Ext", "HERIT"), 70, 75))
    assertEquals("999999", at(pr17With("BrandCode_Ext", "UNKNOWN"), 70, 75))
    assertEquals("999999", at(pr17With("BrandCode_Ext", null), 70, 75)) // no brand -> 999999 default, as PR16
  }
}

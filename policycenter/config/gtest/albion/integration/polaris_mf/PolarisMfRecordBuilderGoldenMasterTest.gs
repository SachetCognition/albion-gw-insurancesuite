package albion.integration.polaris_mf

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/**
 * Golden-master (characterization) tests for the POLARIS_MF record: PolarisMfRecordBuilderV2 as it runs in production today,
 * and PolarisMfRecordBuilderCandidate, which must produce the same bytes before it can be considered for cutover.
 *
 * Each expectation is the record prefix today's builder emits; the rest of the 512-byte record is spaces. The values pin
 * current behaviour, defects included (silent truncation, COBOL trailing overpunch and its failure on a final 9, InsuredSurname_Ext rendered as a yyyyMMdd date, the 999999 brand sentinel). A failure means production
 * bytes changed: do not edit an expectation to make a change pass (docs/migration/strangler-phase1.md).
 */
class PolarisMfRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 512

  function testCapturedSamples() {
    // Replays the Ref and PolicyRef values of every captured sample in integration/samples/polaris_mf/ into the first two text fields.
    // edge_04.xml (UAT 25-Jun-2020)
    assertRecord("REG-48263", "AD68912542X", null, null, "HERIT",
        "PO92REG-48263      AD68912542X                   000000000000000000000XX99")
    // edge_06.xml (UAT 25-Jun-2018)
    assertRecord("CM-25873", "P315254666A", null, null, "ALBDIR",
        "PO92CM-25873       P315254666A                   000000000000000000001AD00")
    // good_01.xml (UAT 20-Dec-2024)
    assertRecord("GWPC-13292", "P365613684X", null, null, "ALBDIR",
        "PO92GWPC-13292     P365613684X                   000000000000000000001AD00")
    // good_05.xml (UAT 22-Apr-2018)
    assertRecord("INC-32140", "HH59177990A", null, null, "RETPLS",
        "PO92INC-32140      HH59177990A                   000000000000000000007RP01")
    // good_08.xml (SIT 17-Jun-2019)
    assertRecord("GWPC-449", "HH92613126A", null, null, "HERIT",
        "PO92GWPC-449       HH92613126A                   000000000000000000000XX99")
    // nak_03.xml (PROD (scrubbed... mostly) 14-Jul-2022)
    assertRecord("REG-13322", "P324048208C", null, null, "HERIT",
        "PO92REG-13322      P324048208C                   000000000000000000000XX99")
    // nak_09.xml (SIT 18-Jan-2025)
    assertRecord("GWPC-19902", "P372414339A", null, null, "RETPLS",
        "PO92GWPC-19902     P372414339A                   000000000000000000007RP01")
    // nak_10.xml (SIT 22-Mar-2020)
    assertRecord("GWCC-11880", "P359983410A", null, null, "HERIT",
        "PO92GWCC-11880     P359983410A                   000000000000000000000XX99")
    // prod_incident_02.xml (SIT 28-May-2019)
    assertRecord("HERIT-605", "HH56015617A", null, null, "HERIT",
        "PO92HERIT-605      HH56015617A                   000000000000000000000XX99")
    // prod_incident_07.xml (UAT 01-Nov-2020)
    assertRecord("GWCC-397", "P359743173B", null, null, "ALBDIR",
        "PO92GWCC-397       P359743173B                   000000000000000000001AD00")
  }

  function testBrandCodesAndUnknownBrandSentinel() {
    // BrandMappingService.brandMap: exact, case-sensitive match on four typecodes; anything else is the 999999 sentinel.
    assertRecord(null, null, null, null, "ALBDIR",
        "PO92                                             000000000000000000001AD00")
    assertRecord(null, null, null, null, "ALBBRK",
        "PO92                                             000000000000000000002BK00")
    assertRecord(null, null, null, null, "RETPLS",
        "PO92                                             000000000000000000007RP01")
    assertRecord(null, null, null, null, "HERIT",
        "PO92                                             000000000000000000000XX99")
    assertRecord(null, null, null, null, "ALBHNW",
        "PO92                                             0000000000000000000999999")
    assertRecord(null, null, null, null, "NOVABK",
        "PO92                                             0000000000000000000999999")
    assertRecord(null, null, null, null, "albdir",
        "PO92                                             0000000000000000000999999")
    assertRecord(null, null, null, null, null,
        "PO92                                             0000000000000000000999999")
  }

  function testOverLengthTextIsSilentlyTruncated() {
    // pad(): over-length values are cut to the field width with no error (silent truncation).
    assertRecord("AAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "PO92AAAAAAAAAAAAAAA                              000000000000000000001AD00")
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "PO92               BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB000000000000000000001AD00")
    assertRecord("CCCCCCCCCCCCCCC", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", null, null, "ALBDIR",
        "PO92CCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD000000000000000000001AD00")
  }

  function testRecordSeparatorAndLineEndsBecomeSpaces() {
    // safe(): "|", CR and LF each become one space; a tab is kept.
    assertRecord("A|B\rC\nD", "X|Y", null, null, "HERIT",
        "PO92A B C D        X Y                           000000000000000000000XX99")
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "PO92TAB\tHERE                                     000000000000000000000XX99")
  }

  function testAmountsUseImpliedDecimalsAndHalfUpRounding() {
    // padNum(): implied 2dp, no decimal point, zero padded, HALF_UP to whole cents.
    assertRecord(null, null, n("0"), null, "ALBDIR",
        "PO92                                             000000000000000000001AD00")
    assertRecord(null, null, n("1234.56"), null, "ALBDIR",
        "PO92                                             000001234560000000001AD00")
    assertRecord(null, null, n("999999999.99"), null, "ALBDIR",
        "PO92                                             999999999990000000001AD00")
    assertRecord(null, null, n("1.005"), null, "ALBDIR",
        "PO92                                             000000001010000000001AD00")
    assertRecord(null, null, n("1.004"), null, "ALBDIR",
        "PO92                                             000000001000000000001AD00")
    assertRecord(null, null, n("-0.005"), null, "ALBDIR",
        "PO92                                             0000000000K0000000001AD00")
  }

  function testNegativeAmountsUseTrailingOverpunch() {
    // Negative amounts: COBOL trailing overpunch, final digit 0..8 -> J..R.
    assertRecord(null, null, n("-1.00"), null, "HERIT",
        "PO92                                             0000000010J0000000000XX99")
    assertRecord(null, null, n("-1.01"), null, "HERIT",
        "PO92                                             0000000010K0000000000XX99")
    assertRecord(null, null, n("-1.02"), null, "HERIT",
        "PO92                                             0000000010L0000000000XX99")
    assertRecord(null, null, n("-1.03"), null, "HERIT",
        "PO92                                             0000000010M0000000000XX99")
    assertRecord(null, null, n("-1.04"), null, "HERIT",
        "PO92                                             0000000010N0000000000XX99")
    assertRecord(null, null, n("-1.05"), null, "HERIT",
        "PO92                                             0000000010O0000000000XX99")
    assertRecord(null, null, n("-1.06"), null, "HERIT",
        "PO92                                             0000000010P0000000000XX99")
    assertRecord(null, null, n("-1.07"), null, "HERIT",
        "PO92                                             0000000010Q0000000000XX99")
    assertRecord(null, null, n("-1.08"), null, "HERIT",
        "PO92                                             0000000010R0000000000XX99")
    assertRecord(null, null, n("-123.45"), null, "HERIT",
        "PO92                                             0000001234O0000000000XX99")
  }

  function testProductionFailuresArePreserved() {
    // A negative amount ending in 9 has no overpunch character: the builder throws and no record is produced.
    assertFailsAfterAmount(null, null, n("-1.09"), null, "HERIT")
    // An amount wider than its field is not truncated: every later field shifts right and the filler shrinks,
    // so the record is still 512 bytes long.
    assertRecord(null, null, n("10000000000.00"), null, "HERIT",
        "PO92                                             10000000000000000000000XX99")
  }

  function testDateFormatAndNullDate() {
    // formatDate(): yyyyMMdd; a null date is eight zeroes.
    assertRecord(null, null, null, d("20200229"), "ALBDIR",
        "PO92                                             000000000002020022901AD00")
    assertRecord(null, null, null, d("19870101"), "ALBDIR",
        "PO92                                             000000000001987010101AD00")
    assertRecord(null, null, null, null, "ALBDIR",
        "PO92                                             000000000000000000001AD00")
  }

  function testAllFieldsNull() {
    // Half-hydrated bean: every field null still yields a full record.
    assertRecord(null, null, null, null, null,
        "PO92                                             0000000000000000000999999")
  }

  private function assertRecord(vehicleVrm : String, inceptionDate : String, riskPostcode : BigDecimal, insuredSurname : Date, brand : String, expectedPrefix : String) {
    var expected = expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length())
    var src = source(vehicleVrm, inceptionDate, riskPostcode, insuredSurname, brand)
    assertEquals(expected, PolarisMfRecordBuilderV2.buildRecord(src))
    EasyMock.verify(src)
    src = source(vehicleVrm, inceptionDate, riskPostcode, insuredSurname, brand)
    assertEquals(expected, PolarisMfRecordBuilderCandidate.buildRecord(src))
    EasyMock.verify(src)
  }

  private function assertFailsAfterAmount(vehicleVrm : String, inceptionDate : String, riskPostcode : BigDecimal, insuredSurname : Date, brand : String) {
    assertFails(lenient(vehicleVrm, inceptionDate, riskPostcode, insuredSurname, brand))
  }

  /** Both builders throw StringIndexOutOfBoundsException, as the legacy builder does in production. */
  private function assertFails(src : KeyableBean) {
    var builders : List<block(bean : KeyableBean) : String> = {
        \ bean -> PolarisMfRecordBuilderV2.buildRecord(bean), \ bean -> PolarisMfRecordBuilderCandidate.buildRecord(bean)}
    for (builder in builders) {
      try {
        builder(src)
        fail("expected StringIndexOutOfBoundsException")
      } catch (e : java.lang.StringIndexOutOfBoundsException) {
        assertNotNull(e)
      }
    }
  }

  /** Strict source: each field is read exactly once (EasyMock.verify fails on a missing or extra read). */
  private function source(vehicleVrm : String, inceptionDate : String, riskPostcode : BigDecimal, insuredSurname : Date, brand : String) : KeyableBean {
    var src = EasyMock.createMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("VehicleVRM_Ext")).andReturn(vehicleVrm)
    EasyMock.expect(src.getFieldValue("InceptionDate_Ext")).andReturn(inceptionDate)
    EasyMock.expect(src.getFieldValue("RiskPostcode_Ext")).andReturn(riskPostcode)
    EasyMock.expect(src.getFieldValue("InsuredSurname_Ext")).andReturn(insuredSurname)
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(src)
    return src
  }

  private function lenient(vehicleVrm : String, inceptionDate : String, riskPostcode : BigDecimal, insuredSurname : Date, brand : String) : KeyableBean {
    var src = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("VehicleVRM_Ext")).andStubReturn(vehicleVrm)
    EasyMock.expect(src.getFieldValue("InceptionDate_Ext")).andStubReturn(inceptionDate)
    EasyMock.expect(src.getFieldValue("RiskPostcode_Ext")).andStubReturn(riskPostcode)
    EasyMock.expect(src.getFieldValue("InsuredSurname_Ext")).andStubReturn(insuredSurname)
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andStubReturn(brand)
    EasyMock.replay(src)
    return src
  }

  private function n(value : String) : BigDecimal {
    return new BigDecimal(value)
  }

  private function d(yyyyMMdd : String) : Date {
    return new SimpleDateFormat("yyyyMMdd").parse(yyyyMMdd)
  }
}

package albion.integration.ipt

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/**
 * Golden-master (characterization) tests for the IPT record: IptRecordBuilder as it runs in production today,
 * and IptRecordBuilderCandidate, which must produce the same bytes before it can be considered for cutover.
 *
 * Each expectation is the record prefix today's builder emits; the rest of the 512-byte record is spaces. The values pin
 * current behaviour, defects included (silent truncation, COBOL trailing overpunch and its failure on a final 9, the 999999 brand sentinel). A failure means production
 * bytes changed: do not edit an expectation to make a change pass (docs/migration/strangler-phase1.md).
 */
class IptRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 512

  function testCapturedSamples() {
    // Replays the Ref and PolicyRef values of every captured sample in integration/samples/ipt/ into the first two text fields.
    // edge_06.xml (SIT 23-Aug-2025)
    assertRecord("INC-26415", "AD10382081A", null, null, "RETPLS",
        "IP89INC-26415           AD10382081A                   000000000000000000007RP01")
    // good_01.xml (SIT 17-Oct-2022)
    assertRecord("DEF-20556", "P320430358A", null, null, "ALBDIR",
        "IP89DEF-20556           P320430358A                   000000000000000000001AD00")
    // good_04.xml (UAT 28-Jan-2018)
    assertRecord("HERIT-7253", "P355088892C", null, null, "ALBBRK",
        "IP89HERIT-7253          P355088892C                   000000000000000000002BK00")
    // good_05.xml (UAT 07-Sep-2021)
    assertRecord("DEF-19163", "HH88295663A", null, null, "HERIT",
        "IP89DEF-19163           HH88295663A                   000000000000000000000XX99")
    // nak_02.xml (PROD (scrubbed... mostly) 16-Feb-2025)
    assertRecord("GWPC-48234", "AD46450616X", null, null, "RETPLS",
        "IP89GWPC-48234          AD46450616X                   000000000000000000007RP01")
    // nak_03.xml (UAT 11-Feb-2021)
    assertRecord("HERIT-678", "P351657774X", null, null, "RETPLS",
        "IP89HERIT-678           P351657774X                   000000000000000000007RP01")
  }

  function testBrandCodesAndUnknownBrandSentinel() {
    // BrandMappingService.brandMap: exact, case-sensitive match on four typecodes; anything else is the 999999 sentinel.
    assertRecord(null, null, null, null, "ALBDIR",
        "IP89                                                  000000000000000000001AD00")
    assertRecord(null, null, null, null, "ALBBRK",
        "IP89                                                  000000000000000000002BK00")
    assertRecord(null, null, null, null, "RETPLS",
        "IP89                                                  000000000000000000007RP01")
    assertRecord(null, null, null, null, "HERIT",
        "IP89                                                  000000000000000000000XX99")
    assertRecord(null, null, null, null, "ALBHNW",
        "IP89                                                  0000000000000000000999999")
    assertRecord(null, null, null, null, "NOVABK",
        "IP89                                                  0000000000000000000999999")
    assertRecord(null, null, null, null, "albdir",
        "IP89                                                  0000000000000000000999999")
    assertRecord(null, null, null, null, null,
        "IP89                                                  0000000000000000000999999")
  }

  function testOverLengthTextIsSilentlyTruncated() {
    // pad(): over-length values are cut to the field width with no error (silent truncation).
    assertRecord("AAAAAAAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "IP89AAAAAAAAAAAAAAAAAAAA                              000000000000000000001AD00")
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "IP89                    BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB000000000000000000001AD00")
    assertRecord("CCCCCCCCCCCCCCCCCCCC", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", null, null, "ALBDIR",
        "IP89CCCCCCCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD000000000000000000001AD00")
  }

  function testRecordSeparatorAndLineEndsBecomeSpaces() {
    // safe(): "|", CR and LF each become one space; a tab is kept.
    assertRecord("A|B\rC\nD", "X|Y", null, null, "HERIT",
        "IP89A B C D             X Y                           000000000000000000000XX99")
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "IP89TAB\tHERE                                          000000000000000000000XX99")
  }

  function testAmountsUseImpliedDecimalsAndHalfUpRounding() {
    // padNum(): implied 2dp, no decimal point, zero padded, HALF_UP to whole cents.
    assertRecord(null, null, n("0"), null, "ALBDIR",
        "IP89                                                  000000000000000000001AD00")
    assertRecord(null, null, n("1234.56"), null, "ALBDIR",
        "IP89                                                  000001234560000000001AD00")
    assertRecord(null, null, n("999999999.99"), null, "ALBDIR",
        "IP89                                                  999999999990000000001AD00")
    assertRecord(null, null, n("1.005"), null, "ALBDIR",
        "IP89                                                  000000001010000000001AD00")
    assertRecord(null, null, n("1.004"), null, "ALBDIR",
        "IP89                                                  000000001000000000001AD00")
    assertRecord(null, null, n("-0.005"), null, "ALBDIR",
        "IP89                                                  0000000000K0000000001AD00")
  }

  function testNegativeAmountsUseTrailingOverpunch() {
    // Negative amounts: COBOL trailing overpunch, final digit 0..8 -> J..R.
    assertRecord(null, null, n("-1.00"), null, "HERIT",
        "IP89                                                  0000000010J0000000000XX99")
    assertRecord(null, null, n("-1.01"), null, "HERIT",
        "IP89                                                  0000000010K0000000000XX99")
    assertRecord(null, null, n("-1.02"), null, "HERIT",
        "IP89                                                  0000000010L0000000000XX99")
    assertRecord(null, null, n("-1.03"), null, "HERIT",
        "IP89                                                  0000000010M0000000000XX99")
    assertRecord(null, null, n("-1.04"), null, "HERIT",
        "IP89                                                  0000000010N0000000000XX99")
    assertRecord(null, null, n("-1.05"), null, "HERIT",
        "IP89                                                  0000000010O0000000000XX99")
    assertRecord(null, null, n("-1.06"), null, "HERIT",
        "IP89                                                  0000000010P0000000000XX99")
    assertRecord(null, null, n("-1.07"), null, "HERIT",
        "IP89                                                  0000000010Q0000000000XX99")
    assertRecord(null, null, n("-1.08"), null, "HERIT",
        "IP89                                                  0000000010R0000000000XX99")
    assertRecord(null, null, n("-123.45"), null, "HERIT",
        "IP89                                                  0000001234O0000000000XX99")
  }

  function testProductionFailuresArePreserved() {
    // A negative amount ending in 9 has no overpunch character: the builder throws and no record is produced.
    assertFailsAfterAmount(null, null, n("-1.09"), null, "HERIT")
    // An amount wider than its field is not truncated: every later field shifts right and the filler shrinks,
    // so the record is still 512 bytes long.
    assertRecord(null, null, n("10000000000.00"), null, "HERIT",
        "IP89                                                  10000000000000000000000XX99")
  }

  function testDateFormatAndNullDate() {
    // formatDate(): yyyyMMdd; a null date is eight zeroes.
    assertRecord(null, null, null, d("20200229"), "ALBDIR",
        "IP89                                                  000000000002020022901AD00")
    assertRecord(null, null, null, d("19870101"), "ALBDIR",
        "IP89                                                  000000000001987010101AD00")
    assertRecord(null, null, null, null, "ALBDIR",
        "IP89                                                  000000000000000000001AD00")
  }

  function testAllFieldsNull() {
    // Half-hydrated bean: every field null still yields a full record.
    assertRecord(null, null, null, null, null,
        "IP89                                                  0000000000000000000999999")
  }

  private function assertRecord(ernRef : String, policyNumber : String, niNumber : BigDecimal, vehicleVrm : Date, brand : String, expectedPrefix : String) {
    var expected = expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length())
    var src = source(ernRef, policyNumber, niNumber, vehicleVrm, brand)
    assertEquals(expected, IptRecordBuilder.buildRecord(src))
    EasyMock.verify(src)
    src = source(ernRef, policyNumber, niNumber, vehicleVrm, brand)
    assertEquals(expected, IptRecordBuilderCandidate.buildRecord(src))
    EasyMock.verify(src)
  }

  private function assertFailsAfterAmount(ernRef : String, policyNumber : String, niNumber : BigDecimal, vehicleVrm : Date, brand : String) {
    assertFails(lenient(ernRef, policyNumber, niNumber, vehicleVrm, brand))
  }

  /** Both builders throw StringIndexOutOfBoundsException, as the legacy builder does in production. */
  private function assertFails(src : KeyableBean) {
    var builders : List<block(bean : KeyableBean) : String> = {
        \ bean -> IptRecordBuilder.buildRecord(bean), \ bean -> IptRecordBuilderCandidate.buildRecord(bean)}
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
  private function source(ernRef : String, policyNumber : String, niNumber : BigDecimal, vehicleVrm : Date, brand : String) : KeyableBean {
    var src = EasyMock.createMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("ERNRef_Ext")).andReturn(ernRef)
    EasyMock.expect(src.getFieldValue("PolicyNumber_Ext")).andReturn(policyNumber)
    EasyMock.expect(src.getFieldValue("NINumber_Ext")).andReturn(niNumber)
    EasyMock.expect(src.getFieldValue("VehicleVRM_Ext")).andReturn(vehicleVrm)
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(src)
    return src
  }

  private function lenient(ernRef : String, policyNumber : String, niNumber : BigDecimal, vehicleVrm : Date, brand : String) : KeyableBean {
    var src = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("ERNRef_Ext")).andStubReturn(ernRef)
    EasyMock.expect(src.getFieldValue("PolicyNumber_Ext")).andStubReturn(policyNumber)
    EasyMock.expect(src.getFieldValue("NINumber_Ext")).andStubReturn(niNumber)
    EasyMock.expect(src.getFieldValue("VehicleVRM_Ext")).andStubReturn(vehicleVrm)
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

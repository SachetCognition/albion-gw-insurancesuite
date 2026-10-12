package albion.integration.polaris_mf

uses gw.testharness.TestBase
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/**
 * Golden-master (characterization) tests for the POLARIS_MF record: PolarisMfRecordBuilder as it runs in production today,
 * and PolarisMfRecordBuilderCandidate, which must produce the same bytes before it can be considered for cutover.
 *
 * Each expectation is the record prefix today's builder emits; the rest of the 512-byte record is spaces. The values pin
 * current behaviour, defects included (silent truncation, the ClaimNumber slot always zero because ClaimNumber_Ext is never read, the 999999 brand sentinel). A failure means production
 * bytes changed: do not edit an expectation to make a change pass (docs/migration/strangler-phase1.md).
 */
class PolarisMfRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 512

  function testCapturedSamples() {
    // Replays the Ref and PolicyRef values of every captured sample in integration/samples/polaris_mf/ into the first two text fields.
    // edge_04.xml (UAT 25-Jun-2020)
    assertRecord("REG-48263", "AD68912542X", null, "HERIT",
        "PO99REG-48263   AD68912542X                   0000000000000000000000000XX99")
    // edge_06.xml (UAT 25-Jun-2018)
    assertRecord("CM-25873", "P315254666A", null, "ALBDIR",
        "PO99CM-25873    P315254666A                   0000000000000000000000001AD00")
    // good_01.xml (UAT 20-Dec-2024)
    assertRecord("GWPC-13292", "P365613684X", null, "ALBDIR",
        "PO99GWPC-13292  P365613684X                   0000000000000000000000001AD00")
    // good_05.xml (UAT 22-Apr-2018)
    assertRecord("INC-32140", "HH59177990A", null, "RETPLS",
        "PO99INC-32140   HH59177990A                   0000000000000000000000007RP01")
    // good_08.xml (SIT 17-Jun-2019)
    assertRecord("GWPC-449", "HH92613126A", null, "HERIT",
        "PO99GWPC-449    HH92613126A                   0000000000000000000000000XX99")
    // nak_03.xml (PROD (scrubbed... mostly) 14-Jul-2022)
    assertRecord("REG-13322", "P324048208C", null, "HERIT",
        "PO99REG-13322   P324048208C                   0000000000000000000000000XX99")
    // nak_09.xml (SIT 18-Jan-2025)
    assertRecord("GWPC-19902", "P372414339A", null, "RETPLS",
        "PO99GWPC-19902  P372414339A                   0000000000000000000000007RP01")
    // nak_10.xml (SIT 22-Mar-2020)
    assertRecord("GWCC-11880", "P359983410A", null, "HERIT",
        "PO99GWCC-11880  P359983410A                   0000000000000000000000000XX99")
    // prod_incident_02.xml (SIT 28-May-2019)
    assertRecord("HERIT-605", "HH56015617A", null, "HERIT",
        "PO99HERIT-605   HH56015617A                   0000000000000000000000000XX99")
    // prod_incident_07.xml (UAT 01-Nov-2020)
    assertRecord("GWCC-397", "P359743173B", null, "ALBDIR",
        "PO99GWCC-397    P359743173B                   0000000000000000000000001AD00")
  }

  function testBrandCodesAndUnknownBrandSentinel() {
    // BrandMappingService.brandMap: exact, case-sensitive match on four typecodes; anything else is the 999999 sentinel.
    assertRecord(null, null, null, "ALBDIR",
        "PO99                                          0000000000000000000000001AD00")
    assertRecord(null, null, null, "ALBBRK",
        "PO99                                          0000000000000000000000002BK00")
    assertRecord(null, null, null, "RETPLS",
        "PO99                                          0000000000000000000000007RP01")
    assertRecord(null, null, null, "HERIT",
        "PO99                                          0000000000000000000000000XX99")
    assertRecord(null, null, null, "ALBHNW",
        "PO99                                          00000000000000000000000999999")
    assertRecord(null, null, null, "NOVABK",
        "PO99                                          00000000000000000000000999999")
    assertRecord(null, null, null, "albdir",
        "PO99                                          00000000000000000000000999999")
    assertRecord(null, null, null, null,
        "PO99                                          00000000000000000000000999999")
  }

  function testOverLengthTextIsSilentlyTruncated() {
    // pad(): over-length values are cut to the field width with no error (silent truncation).
    assertRecord("AAAAAAAAAAAAAAAAAAA", null, null, "ALBDIR",
        "PO99AAAAAAAAAAAA                              0000000000000000000000001AD00")
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, "ALBDIR",
        "PO99            BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0000000000000000000000001AD00")
    assertRecord("CCCCCCCCCCCC", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", null, "ALBDIR",
        "PO99CCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD0000000000000000000000001AD00")
  }

  function testRecordSeparatorAndLineEndsBecomeSpaces() {
    // safe(): "|", CR and LF each become one space; a tab is kept.
    assertRecord("A|B\rC\nD", "X|Y", null, "HERIT",
        "PO99A B C D     X Y                           0000000000000000000000000XX99")
    assertRecord("TAB\tHERE", null, null, "HERIT",
        "PO99TAB\tHERE                                  0000000000000000000000000XX99")
  }

  function testDateFormatAndNullDate() {
    // formatDate(): yyyyMMdd; a null date is eight zeroes.
    assertRecord(null, null, d("20200229"), "ALBDIR",
        "PO99                                          0000000000000002020022901AD00")
    assertRecord(null, null, d("19870101"), "ALBDIR",
        "PO99                                          0000000000000001987010101AD00")
    assertRecord(null, null, null, "ALBDIR",
        "PO99                                          0000000000000000000000001AD00")
  }

  function testAllFieldsNull() {
    // Half-hydrated bean: every field null still yields a full record.
    assertRecord(null, null, null, null,
        "PO99                                          00000000000000000000000999999")
  }

  private function assertRecord(insuredSurname : String, vehicleVrm : String, inceptionDate : Date, brand : String, expectedPrefix : String) {
    var expected = expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length())
    var src = source(insuredSurname, vehicleVrm, inceptionDate, brand)
    assertEquals(expected, PolarisMfRecordBuilder.buildRecord(src))
    EasyMock.verify(src)
    src = source(insuredSurname, vehicleVrm, inceptionDate, brand)
    assertEquals(expected, PolarisMfRecordBuilderCandidate.buildRecord(src))
    EasyMock.verify(src)
  }



  /** Strict source: each field is read exactly once (EasyMock.verify fails on a missing or extra read). */
  private function source(insuredSurname : String, vehicleVrm : String, inceptionDate : Date, brand : String) : KeyableBean {
    var src = EasyMock.createMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("InsuredSurname_Ext")).andReturn(insuredSurname)
    EasyMock.expect(src.getFieldValue("VehicleVRM_Ext")).andReturn(vehicleVrm)
    EasyMock.expect(src.getFieldValue("InceptionDate_Ext")).andReturn(inceptionDate)
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(src)
    return src
  }



  private function d(yyyyMMdd : String) : Date {
    return new SimpleDateFormat("yyyyMMdd").parse(yyyyMMdd)
  }
}

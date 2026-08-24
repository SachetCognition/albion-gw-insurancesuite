package albion.integration.crif

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * CrifRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for CrifRecordBuilder.
 *
 * Every assertion below pins CURRENT PRODUCTION BEHAVIOUR, right or wrong. A failure here
 * means production bytes changed, not that the expectation needs updating. Nothing in this
 * file is a specification of desired behaviour and no quirk asserted here may be "fixed"
 * outside a deliberate, separately-approved cut-over.
 *
 * Committed fixtures live alongside this test in goldenmaster/*.golden; each fixture records
 * the input, its provenance, and the exact expected 750-byte record.
 * tools/ci/verify_phase1_scaffold.py fails the build if a fixture and the literal asserted
 * here ever drift apart.
 */
class CrifRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 750

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_07.golden - PROD (scrubbed... mostly) 17-Aug-2017
    assertRecord("HERIT-17339", "HH36835900A", null, null, "HERIT",
        "CR58HERIT-17339    HH36835900A                   0000000000000000000000000XX99")

    // goldenmaster/good_01.golden - SIT 26-Apr-2018
    assertRecord("GWPC-9684", "AD86839051A", null, null, "HERIT",
        "CR58GWPC-9684      AD86839051A                   0000000000000000000000000XX99")

    // goldenmaster/good_02.golden - PROD (scrubbed... mostly) 13-Sep-2022
    assertRecord("PRB-47333", "HH14524509B", null, null, "RETPLS",
        "CR58PRB-47333      HH14524509B                   0000000000000000000000007RP01")

    // goldenmaster/good_03.golden - UAT 09-Oct-2020
    assertRecord("GWCC-46343", "P331061246B", null, null, "ALBBRK",
        "CR58GWCC-46343     P331061246B                   0000000000000000000000002BK00")

    // goldenmaster/good_09.golden - PROD (scrubbed... mostly) 17-Feb-2024
    assertRecord("CHG-11838", "AD14780539B", null, null, "HERIT",
        "CR58CHG-11838      AD14780539B                   0000000000000000000000000XX99")

    // goldenmaster/good_11.golden - SIT 22-Aug-2020
    assertRecord("CM-29181", "AD17671884A", null, null, "ALBBRK",
        "CR58CM-29181       AD17671884A                   0000000000000000000000002BK00")

    // goldenmaster/prod_incident_04.golden - SIT 11-Jan-2020
    assertRecord("GWBC-40919", "P340584658C", null, null, "ALBDIR",
        "CR58GWBC-40919     P340584658C                   0000000000000000000000001AD00")

    // goldenmaster/prod_incident_05.golden - PROD (scrubbed... mostly) 15-Aug-2017
    assertRecord("CM-6233", "AD89195281C", null, null, "ALBDIR",
        "CR58CM-6233        AD89195281C                   0000000000000000000000001AD00")

    // goldenmaster/prod_incident_06.golden - UAT 15-Jul-2023
    assertRecord("HERIT-41719", "P314474503X", null, null, "HERIT",
        "CR58HERIT-41719    P314474503X                   0000000000000000000000000XX99")

    // goldenmaster/prod_incident_08.golden - UAT 01-Mar-2017
    assertRecord("CHG-9403", "P392492938A", null, null, "ALBDIR",
        "CR58CHG-9403       P392492938A                   0000000000000000000000001AD00")

    // goldenmaster/prod_incident_10.golden - UAT 26-Sep-2024
    assertRecord("DEF-42641", "P324702501X", null, null, "ALBDIR",
        "CR58DEF-42641      P324702501X                   0000000000000000000000001AD00")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "CR58                                             0000000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "CR58                                             0000000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "CR58                                             0000000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "CR58                                             0000000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "CR58                                             00000000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "CR58                                             00000000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "CR58                                             00000000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 15 characters
    assertRecord("AAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "CR58AAAAAAAAAAAAAAA                              0000000000000000000000001AD00")

    // second field truncated at 30 characters
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "CR58               BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0000000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "CR58PIPE CR LF END A B                           0000000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "CR58TAB	HERE                                     0000000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 15, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "CR58                                             00000000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "CR58                                             00000000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "CR58                                             00000000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "CR58                                             00000000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "CR58                                             00000000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "CR58                                             00000000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "CR58                                             00000000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "CR58                                             00000000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "CR58                                             00000000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      CrifRecordBuilder.buildRecord(source)
      fail("Expected the production negative-nine overpunch failure")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e) // Pinned: the feed fails, it does not fall back.
    }
    // No EasyMock.verify here on purpose: the builder throws part-way through the record, so the
    // later field reads never happen. That partial read IS the production behaviour being pinned.
  }

  /** HALF_UP rounding to whole cents, away from zero on negatives. */
  function testHalfUpRoundingToImpliedCents() {
    // 1.005 rounds up to 101 cents
    assertRecord(null, null, new BigDecimal("1.005"), null, "ALBDIR",
        "CR58                                             0000000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "CR58                                             00000000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "CR58                                             0000000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. CrifRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but ClaimNumber_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "CR58                                             0000000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "CR58X                                            0000000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA750ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "CR58                                             00000000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(750, CrifRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("NINumber_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("VehicleVRM_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("AnnualPremium_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("ClaimNumber_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = CrifRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

package albion.integration.payhub

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * PayhubRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for PayhubRecordBuilder.
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
class PayhubRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 750

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_02.golden - UAT 18-May-2017
    assertRecord("PRB-2859", "HH95759006X", null, null, "ALBDIR",
        "PA15PRB-2859       HH95759000000000000000000000001AD00")

    // goldenmaster/edge_07.golden - UAT 12-May-2017
    assertRecord("CHG-24035", "AD36939541C", null, null, "ALBDIR",
        "PA15CHG-24035      AD36939500000000000000000000001AD00")

    // goldenmaster/good_04.golden - UAT 22-Jul-2021
    assertRecord("PRB-45704", "HH96184634A", null, null, "HERIT",
        "PA15PRB-45704      HH96184600000000000000000000000XX99")

    // goldenmaster/good_05.golden - PROD (scrubbed... mostly) 28-Oct-2016
    assertRecord("GWBC-40518", "HH58871879A", null, null, "ALBBRK",
        "PA15GWBC-40518     HH58871800000000000000000000002BK00")

    // goldenmaster/good_06.golden - UAT 13-Mar-2016
    assertRecord("GWBC-14871", "AD58643333B", null, null, "HERIT",
        "PA15GWBC-14871     AD58643300000000000000000000000XX99")

    // goldenmaster/good_08.golden - SIT 08-Oct-2023
    assertRecord("INC-47690", "HH16214784C", null, null, "ALBDIR",
        "PA15INC-47690      HH16214700000000000000000000001AD00")

    // goldenmaster/good_10.golden - PROD (scrubbed... mostly) 01-Dec-2020
    assertRecord("CHG-32169", "HH96764544A", null, null, "ALBDIR",
        "PA15CHG-32169      HH96764500000000000000000000001AD00")

    // goldenmaster/good_12.golden - PROD (scrubbed... mostly) 14-Sep-2022
    assertRecord("INC-37888", "HH16997177A", null, null, "RETPLS",
        "PA15INC-37888      HH16997100000000000000000000007RP01")

    // goldenmaster/nak_01.golden - UAT 26-Sep-2018
    assertRecord("PRB-14336", "HH75837437X", null, null, "ALBBRK",
        "PA15PRB-14336      HH75837400000000000000000000002BK00")

    // goldenmaster/nak_09.golden - PROD (scrubbed... mostly) 04-Dec-2020
    assertRecord("CM-22184", "AD64571868X", null, null, "HERIT",
        "PA15CM-22184       AD64571800000000000000000000000XX99")

    // goldenmaster/prod_incident_03.golden - UAT 15-Jan-2024
    assertRecord("GWPC-5181", "AD58625156B", null, null, "ALBDIR",
        "PA15GWPC-5181      AD58625100000000000000000000001AD00")

    // goldenmaster/prod_incident_11.golden - UAT 15-Nov-2017
    assertRecord("CM-3829", "HH27556554B", null, null, "ALBDIR",
        "PA15CM-3829        HH27556500000000000000000000001AD00")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "PA15                       00000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "PA15                       00000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "PA15                       00000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "PA15                       00000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "PA15                       000000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "PA15                       000000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "PA15                       000000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 15 characters
    assertRecord("AAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "PA15AAAAAAAAAAAAAAA        00000000000000000000001AD00")

    // second field truncated at 8 characters
    assertRecord(null, "BBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "PA15               BBBBBBBB00000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "PA15PIPE CR LF END A B     00000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "PA15TAB	HERE               00000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 13, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "PA15                       000000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "PA15                       000000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "PA15                       000000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "PA15                       000000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "PA15                       000000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "PA15                       000000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "PA15                       000000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "PA15                       000000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "PA15                       000000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      PayhubRecordBuilder.buildRecord(source)
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
        "PA15                       00000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "PA15                       000000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "PA15                       00000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. PayhubRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but ClaimNumber_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "PA15                       00000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "PA15X                      00000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA750ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "PA15                       000000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(750, PayhubRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("InsuredSurname_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("VehicleVRM_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("UPRN_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("ClaimNumber_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = PayhubRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

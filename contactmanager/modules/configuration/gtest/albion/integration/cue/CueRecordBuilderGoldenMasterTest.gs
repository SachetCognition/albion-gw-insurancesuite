package albion.integration.cue

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * CueRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for CueRecordBuilder.
 *
 * Every assertion below pins CURRENT PRODUCTION BEHAVIOUR, right or wrong. A failure here
 * means production bytes changed, not that the expectation needs updating. Nothing in this
 * file is a specification of desired behaviour and no quirk asserted here may be "fixed"
 * outside a deliberate, separately-approved cut-over.
 *
 * Committed fixtures live alongside this test in goldenmaster/*.golden; each fixture records
 * the input, its provenance, and the exact expected 400-byte record.
 * tools/ci/verify_phase1_scaffold.py fails the build if a fixture and the literal asserted
 * here ever drift apart.
 */
class CueRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 400

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_07.golden - SIT 16-Sep-2025
    assertRecord("DEF-44497", "HH66117015C", null, null, "ALBDIR",
        "CU86DEF-44497   HH66117015000000000000000000001AD00")

    // goldenmaster/edge_12.golden - UAT 03-Sep-2018
    assertRecord("PRB-32036", "AD18716035C", null, null, "RETPLS",
        "CU86PRB-32036   AD18716035000000000000000000007RP01")

    // goldenmaster/good_02.golden - UAT 21-Jul-2025
    assertRecord("GWBC-3232", "HH39736970X", null, null, "HERIT",
        "CU86GWBC-3232   HH39736970000000000000000000000XX99")

    // goldenmaster/good_04.golden - SIT 21-Feb-2017
    assertRecord("AGI-29640", "P332460495A", null, null, "ALBDIR",
        "CU86AGI-29640   P332460495000000000000000000001AD00")

    // goldenmaster/nak_01.golden - PROD (scrubbed... mostly) 26-Sep-2022
    assertRecord("PRB-4934", "P392580909C", null, null, "ALBDIR",
        "CU86PRB-4934    P392580909000000000000000000001AD00")

    // goldenmaster/nak_03.golden - SIT 27-Nov-2021
    assertRecord("GWCC-36190", "P331701870X", null, null, "HERIT",
        "CU86GWCC-36190  P331701870000000000000000000000XX99")

    // goldenmaster/nak_09.golden - PROD (scrubbed... mostly) 23-Aug-2020
    assertRecord("CM-37096", "AD41901467C", null, null, "ALBBRK",
        "CU86CM-37096    AD41901467000000000000000000002BK00")

    // goldenmaster/nak_10.golden - UAT 25-Apr-2020
    assertRecord("GWBC-32529", "P382682297C", null, null, "ALBBRK",
        "CU86GWBC-32529  P382682297000000000000000000002BK00")

    // goldenmaster/prod_incident_05.golden - SIT 22-Dec-2018
    assertRecord("GWCC-35564", "HH70353435C", null, null, "RETPLS",
        "CU86GWCC-35564  HH70353435000000000000000000007RP01")

    // goldenmaster/prod_incident_06.golden - PROD (scrubbed... mostly) 04-Oct-2020
    assertRecord("GWBC-992", "HH60601783B", null, null, "RETPLS",
        "CU86GWBC-992    HH60601783000000000000000000007RP01")

    // goldenmaster/prod_incident_08.golden - PROD (scrubbed... mostly) 07-Jun-2021
    assertRecord("REG-21234", "P378922226X", null, null, "ALBBRK",
        "CU86REG-21234   P378922226000000000000000000002BK00")

    // goldenmaster/prod_incident_11.golden - PROD (scrubbed... mostly) 17-Jun-2017
    assertRecord("PRB-33846", "HH45256406C", null, null, "ALBDIR",
        "CU86PRB-33846   HH45256406000000000000000000001AD00")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "CU86                      000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "CU86                      000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "CU86                      000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "CU86                      000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "CU86                      0000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "CU86                      0000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "CU86                      0000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 12 characters
    assertRecord("AAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "CU86AAAAAAAAAAAA          000000000000000000001AD00")

    // second field truncated at 10 characters
    assertRecord(null, "BBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "CU86            BBBBBBBBBB000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "CU86PIPE CR LF EA B       000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "CU86TAB	HERE              000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 11, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "CU86                      0000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "CU86                      0000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "CU86                      0000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "CU86                      0000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "CU86                      0000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "CU86                      0000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "CU86                      0000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "CU86                      0000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "CU86                      0000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      CueRecordBuilder.buildRecord(source)
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
        "CU86                      000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "CU86                      0000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "CU86                      000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. CueRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but SumInsured_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "CU86                      000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "CU86X                     000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA400ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "CU86                      0000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(400, CueRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("ERNRef_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("NINumber_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("AnnualPremium_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("SumInsured_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = CueRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

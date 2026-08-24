package albion.integration.mid

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * MidRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for MidRecordBuilder.
 *
 * Every assertion below pins CURRENT PRODUCTION BEHAVIOUR, right or wrong. A failure here
 * means production bytes changed, not that the expectation needs updating. Nothing in this
 * file is a specification of desired behaviour and no quirk asserted here may be "fixed"
 * outside a deliberate, separately-approved cut-over.
 *
 * Committed fixtures live alongside this test in goldenmaster/*.golden; each fixture records
 * the input, its provenance, and the exact expected 600-byte record.
 * tools/ci/verify_phase1_scaffold.py fails the build if a fixture and the literal asserted
 * here ever drift apart.
 */
class MidRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 600

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_03.golden - SIT 12-Dec-2021
    assertRecord("GWPC-31264", "P368799551A", null, null, "ALBBRK",
        "MI56GWPC-31264  P368799500000000000000000000002BK00")

    // goldenmaster/edge_06.golden - SIT 26-Jan-2024
    assertRecord("HERIT-34451", "HH97162394B", null, null, "ALBBRK",
        "MI56HERIT-34451 HH97162300000000000000000000002BK00")

    // goldenmaster/good_07.golden - PROD (scrubbed... mostly) 04-Feb-2016
    assertRecord("CHG-11781", "AD90893699A", null, null, "ALBDIR",
        "MI56CHG-11781   AD90893600000000000000000000001AD00")

    // goldenmaster/good_10.golden - PROD (scrubbed... mostly) 01-Oct-2024
    assertRecord("GWCC-14008", "HH58136919A", null, null, "RETPLS",
        "MI56GWCC-14008  HH58136900000000000000000000007RP01")

    // goldenmaster/good_12.golden - SIT 08-Oct-2020
    assertRecord("CHG-4376", "HH53636916B", null, null, "HERIT",
        "MI56CHG-4376    HH53636900000000000000000000000XX99")

    // goldenmaster/nak_02.golden - SIT 10-Jul-2021
    assertRecord("PRB-16903", "P367281859A", null, null, "ALBBRK",
        "MI56PRB-16903   P367281800000000000000000000002BK00")

    // goldenmaster/nak_04.golden - UAT 12-Mar-2018
    assertRecord("PRB-43033", "P366124862A", null, null, "ALBBRK",
        "MI56PRB-43033   P366124800000000000000000000002BK00")

    // goldenmaster/nak_08.golden - UAT 08-Jun-2022
    assertRecord("REG-35416", "AD75424585B", null, null, "RETPLS",
        "MI56REG-35416   AD75424500000000000000000000007RP01")

    // goldenmaster/nak_11.golden - SIT 03-Nov-2019
    assertRecord("AGI-3529", "P387143596C", null, null, "ALBBRK",
        "MI56AGI-3529    P387143500000000000000000000002BK00")

    // goldenmaster/prod_incident_01.golden - PROD (scrubbed... mostly) 23-Apr-2025
    assertRecord("CHG-26378", "AD62250414B", null, null, "HERIT",
        "MI56CHG-26378   AD62250400000000000000000000000XX99")

    // goldenmaster/prod_incident_05.golden - PROD (scrubbed... mostly) 11-May-2016
    assertRecord("CHG-34161", "HH98735659B", null, null, "ALBBRK",
        "MI56CHG-34161   HH98735600000000000000000000002BK00")

    // goldenmaster/prod_incident_09.golden - UAT 26-Jul-2018
    assertRecord("CHG-36770", "AD78927873X", null, null, "ALBBRK",
        "MI56CHG-36770   AD78927800000000000000000000002BK00")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "MI56                    00000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "MI56                    00000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "MI56                    00000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "MI56                    00000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "MI56                    000000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "MI56                    000000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "MI56                    000000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 12 characters
    assertRecord("AAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "MI56AAAAAAAAAAAA        00000000000000000000001AD00")

    // second field truncated at 8 characters
    assertRecord(null, "BBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "MI56            BBBBBBBB00000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "MI56PIPE CR LF EA B     00000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "MI56TAB	HERE            00000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 13, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "MI56                    000000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "MI56                    000000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "MI56                    000000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "MI56                    000000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "MI56                    000000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "MI56                    000000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "MI56                    000000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "MI56                    000000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "MI56                    000000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      MidRecordBuilder.buildRecord(source)
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
        "MI56                    00000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "MI56                    000000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "MI56                    00000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. MidRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but SumInsured_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "MI56                    00000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "MI56X                   00000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA600ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "MI56                    000000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(600, MidRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("PolicyNumber_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("AnnualPremium_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("UPRN_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("SumInsured_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = MidRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

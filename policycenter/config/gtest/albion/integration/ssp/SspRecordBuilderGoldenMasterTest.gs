package albion.integration.ssp

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * SspRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for SspRecordBuilder.
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
class SspRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 750

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_01.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK14585485X", null, null, null,
        "SS84AGI002         BK145854850000000000000000000999999")

    // goldenmaster/edge_06.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "AD13565444X", null, null, null,
        "SS84AGI002         AD135654440000000000000000000999999")

    // goldenmaster/edge_07.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "AD12148564X", null, null, null,
        "SS84AGI002         AD121485640000000000000000000999999")

    // goldenmaster/edge_08.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK34536725X", null, null, null,
        "SS84AGI002         BK345367250000000000000000000999999")

    // goldenmaster/edge_09.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK83156648X", null, null, null,
        "SS84AGI002         BK831566480000000000000000000999999")

    // goldenmaster/edge_10.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK29702199X", null, null, null,
        "SS84AGI002         BK297021990000000000000000000999999")

    // goldenmaster/nak_02.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK74426620X", null, null, null,
        "SS84AGI002         BK744266200000000000000000000999999")

    // goldenmaster/nak_04.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK38860850X", null, null, null,
        "SS84AGI002         BK388608500000000000000000000999999")

    // goldenmaster/prod_incident_03.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "BK80560083X", null, null, null,
        "SS84AGI002         BK805600830000000000000000000999999")

    // goldenmaster/prod_incident_05.golden - EDI capture; no Brand segment, null brand pins the 999999 sentinel
    assertRecord("AGI002", "AD49993828X", null, null, null,
        "SS84AGI002         AD499938280000000000000000000999999")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "SS84                         000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "SS84                         000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "SS84                         000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "SS84                         000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "SS84                         0000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "SS84                         0000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "SS84                         0000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 15 characters
    assertRecord("AAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "SS84AAAAAAAAAAAAAAA          000000000000000000001AD00")

    // second field truncated at 10 characters
    assertRecord(null, "BBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "SS84               BBBBBBBBBB000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "SS84PIPE CR LF END A B       000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "SS84TAB	HERE                 000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 11, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "SS84                         0000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "SS84                         0000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "SS84                         0000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "SS84                         0000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "SS84                         0000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "SS84                         0000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "SS84                         0000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "SS84                         0000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "SS84                         0000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      SspRecordBuilder.buildRecord(source)
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
        "SS84                         000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "SS84                         0000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "SS84                         000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. SspRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but AnnualPremium_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "SS84                         000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "SS84X                        000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA750ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "SS84                         0000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(750, SspRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("ClaimNumber_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("VehicleVRM_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("PolicyNumber_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("AnnualPremium_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = SspRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

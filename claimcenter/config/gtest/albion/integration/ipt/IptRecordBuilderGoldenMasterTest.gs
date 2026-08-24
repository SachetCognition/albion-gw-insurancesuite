package albion.integration.ipt

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * IptRecordBuilderGoldenMasterTest - Phase 1 golden-master / characterization coverage for IptRecordBuilder.
 *
 * Every assertion below pins CURRENT PRODUCTION BEHAVIOUR, right or wrong. A failure here
 * means production bytes changed, not that the expectation needs updating. Nothing in this
 * file is a specification of desired behaviour and no quirk asserted here may be "fixed"
 * outside a deliberate, separately-approved cut-over.
 *
 * Committed fixtures live alongside this test in goldenmaster/*.golden; each fixture records
 * the input, its provenance under integration/samples/, and the exact expected 512-byte record.
 * tools/ci/verify_phase1_scaffold.py fails the build if a fixture and the literal asserted
 * here ever drift apart.
 */
class IptRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 512

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is the sample file named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/good_01.golden - input from integration/samples/ipt/good_01.xml (SIT 17-Oct-2022)
    assertRecord("DEF-20556", "P320430358A", null, null, "ALBDIR",
        "IP89DEF-20556           P320430358A                   000000000000000000001AD00")

    // goldenmaster/good_04.golden - input from integration/samples/ipt/good_04.xml (UAT 28-Jan-2018)
    assertRecord("HERIT-7253", "P355088892C", null, null, "ALBBRK",
        "IP89HERIT-7253          P355088892C                   000000000000000000002BK00")

    // goldenmaster/good_05.golden - input from integration/samples/ipt/good_05.xml (UAT 07-Sep-2021)
    assertRecord("DEF-19163", "HH88295663A", null, null, "HERIT",
        "IP89DEF-19163           HH88295663A                   000000000000000000000XX99")

    // goldenmaster/edge_06.golden - input from integration/samples/ipt/edge_06.xml (SIT 23-Aug-2025)
    assertRecord("INC-26415", "AD10382081A", null, null, "RETPLS",
        "IP89INC-26415           AD10382081A                   000000000000000000007RP01")

    // goldenmaster/nak_02.golden - input from integration/samples/ipt/nak_02.xml (PROD (scrubbed) 16-Feb-2025)
    assertRecord("GWPC-48234", "AD46450616X", null, null, "RETPLS",
        "IP89GWPC-48234          AD46450616X                   000000000000000000007RP01")

    // goldenmaster/nak_03.golden - input from integration/samples/ipt/nak_03.xml (UAT 11-Feb-2021)
    assertRecord("HERIT-678", "P351657774X", null, null, "RETPLS",
        "IP89HERIT-678           P351657774X                   000000000000000000007RP01")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 1 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "IP89                                                  000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping, added by INC-9033
    assertRecord(null, null, null, null, "ALBBRK",
        "IP89                                                  000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "IP89                                                  000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "IP89                                                  000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "IP89                                                  0000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "IP89                                                  0000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "IP89                                                  0000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 20 characters
    assertRecord("AAAAAAAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "IP89AAAAAAAAAAAAAAAAAAAA                              000000000000000000001AD00")

    // second field truncated at 30 characters
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "IP89                    BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "IP89PIPE CR LF END      A B                           000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "IP89TAB\tHERE                                          000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 11, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "IP89                                                  0000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "IP89                                                  0000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "IP89                                                  0000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "IP89                                                  0000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "IP89                                                  0000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "IP89                                                  0000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "IP89                                                  0000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "IP89                                                  0000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "IP89                                                  0000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      IptRecordBuilder.buildRecord(source)
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
        "IP89                                                  000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "IP89                                                  0000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "IP89                                                  000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. IptRecordBuilder declares
   *   DATE_FMT = "yyyyMMdd"   // except VehicleVRM_Ext which is ddMMyy because 1987
   * but VehicleVRM_Ext is the ONLY date field in this record and it is formatted with DATE_FMT,
   * i.e. yyyyMMdd. The comment (and the interface doc it echoes) does not match the code.
   * Production emits yyyyMMdd, so that is what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "IP89                                                  000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "IP89X                                                 000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA512ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "IP89                                                  0000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(512, IptRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("ERNRef_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("PolicyNumber_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("NINumber_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("VehicleVRM_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = IptRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

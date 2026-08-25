package albion.integration.credit

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

/*
 * CreditRecordBuilderGoldenMasterTest - Phase 2 golden-master / characterization coverage for CreditRecordBuilder.
 *
 * Every assertion below pins CURRENT PRODUCTION BEHAVIOUR, right or wrong. A failure here
 * means production bytes changed, not that the expectation needs updating. Nothing in this
 * file is a specification of desired behaviour and no quirk asserted here may be "fixed"
 * outside a deliberate, separately-approved cut-over.
 *
 * Committed fixtures live alongside this test in goldenmaster (.golden files); each fixture records
 * the input, its provenance, and the exact expected 300-byte record.
 * tools/ci/verify_phase1_scaffold.py fails the build if a fixture and the literal asserted
 * here ever drift apart.
 */
class CreditRecordBuilderGoldenMasterTest extends TestBase {

  static final var RECORD_LENGTH : int = 300

  /**
   * Every committed golden-master fixture, replayed against the legacy builder.
   * Provenance for each input is named in the comment.
   */
  function testCommittedGoldenMasterFixtures() {
    // goldenmaster/edge_07.golden - UAT 07-Nov-2025
    assertRecord("GWCC-9453", "HH42897689C", null, null, "ALBDIR",
        "CR61GWCC-9453      HH42897689C                   0000000000000000000000001AD00")

    // goldenmaster/edge_12.golden - UAT 20-Apr-2025
    assertRecord("DEF-42009", "P329520793A", null, null, "ALBDIR",
        "CR61DEF-42009      P329520793A                   0000000000000000000000001AD00")

    // goldenmaster/good_01.golden - UAT 05-Sep-2020
    assertRecord("PRB-14118", "P382409352X", null, null, "HERIT",
        "CR61PRB-14118      P382409352X                   0000000000000000000000000XX99")

    // goldenmaster/good_03.golden - SIT 04-Jan-2025
    assertRecord("GWCC-43221", "P374685360A", null, null, "ALBBRK",
        "CR61GWCC-43221     P374685360A                   0000000000000000000000002BK00")

    // goldenmaster/good_04.golden - SIT 09-Feb-2024
    assertRecord("GWCC-25522", "AD99160161X", null, null, "ALBDIR",
        "CR61GWCC-25522     AD99160161X                   0000000000000000000000001AD00")

    // goldenmaster/good_05.golden - UAT 05-Jan-2023
    assertRecord("CHG-2564", "P379083335A", null, null, "ALBDIR",
        "CR61CHG-2564       P379083335A                   0000000000000000000000001AD00")

    // goldenmaster/nak_02.golden - UAT 03-Mar-2018
    assertRecord("CM-12616", "AD35917123A", null, null, "ALBDIR",
        "CR61CM-12616       AD35917123A                   0000000000000000000000001AD00")

    // goldenmaster/nak_06.golden - PROD (scrubbed... mostly) 25-Feb-2021
    assertRecord("GWBC-36817", "HH99796436A", null, null, "ALBDIR",
        "CR61GWBC-36817     HH99796436A                   0000000000000000000000001AD00")

    // goldenmaster/nak_08.golden - PROD (scrubbed... mostly) 06-Oct-2021
    assertRecord("REG-5634", "HH50150134X", null, null, "RETPLS",
        "CR61REG-5634       HH50150134X                   0000000000000000000000007RP01")

    // goldenmaster/nak_10.golden - SIT 12-Jun-2020
    assertRecord("REG-23380", "HH27763773X", null, null, "ALBDIR",
        "CR61REG-23380      HH27763773X                   0000000000000000000000001AD00")

    // goldenmaster/prod_incident_09.golden - SIT 23-Dec-2018
    assertRecord("CM-3422", "P392598302B", null, null, "HERIT",
        "CR61CM-3422        P392598302B                   0000000000000000000000000XX99")

    // goldenmaster/prod_incident_11.golden - UAT 17-Aug-2018
    assertRecord("HERIT-11955", "P338842562A", null, null, "HERIT",
        "CR61HERIT-11955    P338842562A                   0000000000000000000000000XX99")
  }

  /**
   * brandMap() codes as production emits them. These values predate the brand typelist and are
   * ALSO maintained in integration/polaris/mappings/brand_xref.csv; the two sources have drifted
   * before (AGI-5452 / AGI-30921). Phase 2 pins both copies as-is and does not converge them.
   */
  function testBrandCodeMatrixIncludingUnknownAndNull() {
    // ALBDIR -> 01AD00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBDIR",
        "CR61                                             0000000000000000000000001AD00")

    // ALBBRK -> 02BK00 : pinned PROD mapping
    assertRecord(null, null, null, null, "ALBBRK",
        "CR61                                             0000000000000000000000002BK00")

    // RETPLS -> 07RP01 : pinned PROD mapping; 07RP00 retired after the Novabank exit and must not be reused
    assertRecord(null, null, null, null, "RETPLS",
        "CR61                                             0000000000000000000000007RP01")

    // HERIT -> 00XX99 : pinned PROD mapping
    assertRecord(null, null, null, null, "HERIT",
        "CR61                                             0000000000000000000000000XX99")

    // NOVABANK -> 999999 : unknown brand falls through to the default sentinel that ops grep for daily
    assertRecord(null, null, null, null, "NOVABANK",
        "CR61                                             00000000000000000000000999999")

    // None -> 999999 : null brand also yields the default sentinel - no exception, no log
    assertRecord(null, null, null, null, null,
        "CR61                                             00000000000000000000000999999")

    // albdir -> 999999 : brandMap() is CASE SENSITIVE: lower case does NOT match and silently becomes the default sentinel
    assertRecord(null, null, null, null, "albdir",
        "CR61                                             00000000000000000000000999999")
  }

  /**
   * Silent truncation in pad() - over-length input is cut to the field width with no error and
   * no log entry (GWCC-25665 / CHG-34717, both wontfix). Data loss here is current PROD behaviour.
   */
  function testOverLengthValuesAreSilentlyTruncated() {
    // first field truncated at 15 characters
    assertRecord("AAAAAAAAAAAAAAAAAAAAAA", null, null, null, "ALBDIR",
        "CR61AAAAAAAAAAAAAAA                              0000000000000000000000001AD00")

    // second field truncated at 30 characters
    assertRecord(null, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, "ALBDIR",
        "CR61               BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0000000000000000000000001AD00")
  }

  /**
   * safe() maps the record separator and both line-end characters to a single space so a value
   * can never break the fixed-width stream. Note it does NOT strip tabs.
   */
  function testPipeAndLineEndNormalisation() {
    // pipe, CR and LF each become one space
    assertRecord("PIPE|CR\rLF\nEND", "A|B", null, null, "HERIT",
        "CR61PIPE CR LF END A B                           0000000000000000000000000XX99")

    // tab survives - not in the safe() character class
    assertRecord("TAB\tHERE", null, null, null, "HERIT",
        "CR61TAB	HERE                                     0000000000000000000000000XX99")
  }

  /**
   * padNum(): implied 2 decimal places, no decimal point, zero padded to 15, and negatives signed
   * with the COBOL trailing overpunch "JKLMNOPQR" mapping. The final digit carries the sign.
   */
  function testNegativeBigDecimalTrailingOverpunchMatrix() {
    // -1.00 -> trailing overpunch 'J'
    assertRecord(null, null, new BigDecimal("-1.00"), null, "HERIT",
        "CR61                                             00000000000010J0000000000XX99")

    // -1.01 -> trailing overpunch 'K'
    assertRecord(null, null, new BigDecimal("-1.01"), null, "HERIT",
        "CR61                                             00000000000010K0000000000XX99")

    // -1.02 -> trailing overpunch 'L'
    assertRecord(null, null, new BigDecimal("-1.02"), null, "HERIT",
        "CR61                                             00000000000010L0000000000XX99")

    // -1.03 -> trailing overpunch 'M'
    assertRecord(null, null, new BigDecimal("-1.03"), null, "HERIT",
        "CR61                                             00000000000010M0000000000XX99")

    // -1.04 -> trailing overpunch 'N'
    assertRecord(null, null, new BigDecimal("-1.04"), null, "HERIT",
        "CR61                                             00000000000010N0000000000XX99")

    // -1.05 -> trailing overpunch 'O'
    assertRecord(null, null, new BigDecimal("-1.05"), null, "HERIT",
        "CR61                                             00000000000010O0000000000XX99")

    // -1.06 -> trailing overpunch 'P'
    assertRecord(null, null, new BigDecimal("-1.06"), null, "HERIT",
        "CR61                                             00000000000010P0000000000XX99")

    // -1.07 -> trailing overpunch 'Q'
    assertRecord(null, null, new BigDecimal("-1.07"), null, "HERIT",
        "CR61                                             00000000000010Q0000000000XX99")

    // -1.08 -> trailing overpunch 'R'
    assertRecord(null, null, new BigDecimal("-1.08"), null, "HERIT",
        "CR61                                             00000000000010R0000000000XX99")
  }

  /**
   * The overpunch mapping has only 9 characters, so a negative amount whose final cent digit is 9
   * throws StringIndexOutOfBoundsException instead of producing a record. Current PROD behaviour.
   */
  function testNegativeAmountEndingInNineStillFails() {
    var source = mockSource(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      CreditRecordBuilder.buildRecord(source)
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
        "CR61                                             0000000000001010000000001AD00")

    // -0.005 rounds away from zero to 1 cent, then takes overpunch 'K'
    assertRecord(null, null, new BigDecimal("-0.005"), null, "ALBDIR",
        "CR61                                             00000000000000K0000000001AD00")

    // null amount is encoded as zero, not as spaces
    assertRecord(null, null, null, null, "ALBDIR",
        "CR61                                             0000000000000000000000001AD00")
  }

  /**
   * DATE_FORMAT DRIFT - FINDING, NOT FIXED HERE. CreditRecordBuilder declares DATE_FMT = "yyyyMMdd"
   * with a comment claiming ddMMyy, but SumInsured_Ext is the ONLY date field in this record
   * and it is formatted with DATE_FMT, i.e. yyyyMMdd. Production emits yyyyMMdd, so that is
   * what is pinned here. Reported, deliberately not corrected.
   */
  function testDateFieldUsesYyyyMMddDespiteTheDdMMyyComment() {
    var record = assertRecord(null, null, null, leapDay(), "ALBDIR",
        "CR61                                             0000000000000002020022901AD00")
    assertTrue(record.contains("20200229")) // yyyyMMdd, NOT the "290220" the comment implies.
    assertFalse(record.contains("290220"))
  }

  /** A null date is rendered as eight zeroes rather than spaces or an error. */
  function testNullDateIsEightZeroes() {
    // date null -> 00000000
    assertRecord("X", null, null, null, "ALBDIR",
        "CR61X                                            0000000000000000000000001AD00")
  }

  /** Half-hydrated bean: every readable field null. Production emits a full, well-formed record. */
  function testFullyNullBeanStillProducesA300ByteRecord() {
    // all fields null, brand null
    assertRecord(null, null, null, null, null,
        "CR61                                             00000000000000000000000999999")
  }

  /** The declared record length is part of the mainframe contract. */
  function testRecordLengthConstantIsPinned() {
    assertEquals(300, CreditRecordBuilder.RECORD_LENGTH)
  }

  /** Mocks the source bean. The builder reads each field exactly once, in layout order. */
  private function mockSource(first : String, second : String, number : BigDecimal, date : Date, brand : String) : KeyableBean {
    var source = EasyMock.createMock(KeyableBean)
    EasyMock.expect(source.getFieldValue("RiskPostcode_Ext")).andReturn(first)
    EasyMock.expect(source.getFieldValue("InceptionDate_Ext")).andReturn(second)
    EasyMock.expect(source.getFieldValue("PolicyNumber_Ext")).andReturn(number)
    EasyMock.expect(source.getFieldValue("SumInsured_Ext")).andReturn(date)
    EasyMock.expect(source.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(source)
    return source
  }

  private function assertRecord(first : String, second : String, number : BigDecimal, date : Date,
                               brand : String, expectedPrefix : String) : String {
    var source = mockSource(first, second, number, date, brand)
    var actual = CreditRecordBuilder.buildRecord(source)
    assertEquals(expectedPrefix + " ".repeat(RECORD_LENGTH - expectedPrefix.length()), actual)
    assertEquals(RECORD_LENGTH, actual.length())
    EasyMock.verify(source)
    return actual
  }

  private function leapDay() : Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }
}

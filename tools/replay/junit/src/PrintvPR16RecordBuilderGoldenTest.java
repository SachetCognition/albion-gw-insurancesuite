import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * ContactManager PRINTV PR16 (albion.integration.printv.PrintvRecordBuilder.buildRecord), 250 bytes: 001-004 PR16,
 * 005-016 InsuredSurname_Ext (truncated to 12), 017-046 ClaimNumber (blank), 047-061 RiskPostcode_Ext (implied 2dp,
 * trailing overpunch for negatives), 062-069 PolicyNumber_Ext as yyyyMMdd, 070-075 brand, 076-250 spaces.
 */
public class PrintvPR16RecordBuilderGoldenTest {
  static final String BUILDER = "albion.integration.printv.PrintvRecordBuilder";

  static String pr16(KeyableBean bean) throws Throwable {
    return (String) GosuRuntime.call(BUILDER, "buildRecord", bean);
  }

  @Test
  public void goldenRecord() throws Throwable {
    String record = pr16(Fixtures.bean("InsuredSurname_Ext", "TESTPERSON", "RiskPostcode_Ext", Fixtures.dec("123.45"),
        "PolicyNumber_Ext", Fixtures.date("2026-01-31"), "BrandCode_Ext", "ALBDIR"));
    Fixtures.assertRecord(Fixtures.record(250, "PR16", "TESTPERSON  ", Fixtures.left("", 30), "000000000012345",
        "20260131", "01AD00"), record);
  }

  @Test
  public void offsets() throws Throwable {
    String record = pr16(Fixtures.bean("InsuredSurname_Ext", "TESTPERSONLONGSURNAME", "RiskPostcode_Ext",
        Fixtures.dec("-12.34"), "PolicyNumber_Ext", Fixtures.date("2027-02-28"), "BrandCode_Ext", "RETPLS"));
    assertEquals("PR16", Fixtures.at(record, 1, 4));
    assertEquals("TESTPERSONLO", Fixtures.at(record, 5, 16));
    assertEquals(Fixtures.left("", 30), Fixtures.at(record, 17, 46));
    assertEquals("00000000000123N", Fixtures.at(record, 47, 61));
    assertEquals("20270228", Fixtures.at(record, 62, 69));
    assertEquals("07RP01", Fixtures.at(record, 70, 75));
    assertEquals(Fixtures.left("", 175), Fixtures.at(record, 76, 250));
  }

  @Test
  public void brandDefaultsAndNulls() throws Throwable {
    String record = pr16(Fixtures.bean());
    Fixtures.assertRecord(Fixtures.record(250, "PR16", Fixtures.left("", 42), "000000000000000", "00000000", "999999"),
        record);
    assertEquals("00XX99", Fixtures.at(pr16(Fixtures.bean("BrandCode_Ext", "HERIT")), 70, 75));
    assertEquals("02BK00", Fixtures.at(pr16(Fixtures.bean("BrandCode_Ext", "ALBBRK")), 70, 75));
    assertEquals("999999", Fixtures.at(pr16(Fixtures.bean("BrandCode_Ext", "albdir")), 70, 75));
  }

  @Test
  public void lengthGuard() throws Throwable {
    assertEquals(250, GosuRuntime.staticField(BUILDER, "RECORD_LENGTH"));
    // a 16-digit amount is not truncated: the later fields shift right and the filler absorbs the extra byte
    String shifted = pr16(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("10000000000000.00")));
    assertEquals(250, shifted.length());
    assertEquals("1000000000000000", Fixtures.at(shifted, 47, 62));
    assertEquals("999999", Fixtures.at(shifted, 71, 76));
    // content wider than the record fails in the filler pad before the length guard is reached
    Throwable overflow = Fixtures.failure(() -> pr16(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("1E+240"))));
    assertEquals(StringIndexOutOfBoundsException.class, overflow.getClass());
  }

  @Test
  public void negativeTrailingNineHasNoOverpunch() {
    Throwable t = Fixtures.failure(() -> pr16(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("-0.09"))));
    assertEquals(StringIndexOutOfBoundsException.class, t.getClass());
  }

  @Test
  public void nullBeanFails() {
    assertEquals(NullPointerException.class, Fixtures.failure(() -> pr16(null)).getClass());
  }
}

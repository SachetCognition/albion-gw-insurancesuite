import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * ClaimCenter IPT (albion.integration.ipt.IptRecordBuilder), 512 bytes: 001-004 IP89, 005-024 ERNRef_Ext,
 * 025-054 PolicyNumber_Ext, 055-065 NINumber_Ext (implied 2dp, trailing overpunch), 066-073 VehicleVRM_Ext as yyyyMMdd,
 * 074-079 brand, 080-512 spaces.
 * The candidate (albion.integration.ipt.IptRecordBuilderCandidate) must emit the same bytes as the legacy builder.
 */
public class IptRecordBuilderGoldenTest {
  static final String LEGACY = "albion.integration.ipt.IptRecordBuilder";
  static final String CANDIDATE = "albion.integration.ipt.IptRecordBuilderCandidate";

  static String legacy(KeyableBean bean) throws Throwable {
    return (String) GosuRuntime.call(LEGACY, "buildRecord", bean);
  }

  static String candidate(KeyableBean bean) throws Throwable {
    return (String) GosuRuntime.call(CANDIDATE, "buildRecord", bean);
  }

  static String both(KeyableBean bean) throws Throwable {
    String record = legacy(bean);
    Fixtures.assertRecord(record, candidate(bean));
    return record;
  }

  @Test
  public void goldenRecord() throws Throwable {
    Fixtures.assertRecord(Fixtures.record(512, "IP89", Fixtures.left("SYN-ERN-0001", 20), Fixtures.left("SYN-POL-0001", 30), "00000012345", "20260131", "01AD00"), both(Fixtures.bean("ERNRef_Ext", "SYN-ERN-0001", "PolicyNumber_Ext", "SYN-POL-0001", "NINumber_Ext", Fixtures.dec("123.45"),
        "VehicleVRM_Ext", Fixtures.date("2026-01-31"), "BrandCode_Ext", "ALBDIR")));
  }

  @Test
  public void offsets() throws Throwable {
    String record = both(Fixtures.bean("ERNRef_Ext", "SYN-ERN-0002-TOO-LONG-FOR-FIELD", "PolicyNumber_Ext", "SYN-POL-0002",
        "NINumber_Ext", Fixtures.dec("-12.34"), "VehicleVRM_Ext", Fixtures.date("2027-02-28"), "BrandCode_Ext", "HERIT"));
    assertEquals("IP89", Fixtures.at(record, 1, 4));
    assertEquals("SYN-ERN-0002-TOO-LON", Fixtures.at(record, 5, 24));
    assertEquals(Fixtures.left("SYN-POL-0002", 30), Fixtures.at(record, 25, 54));
    assertEquals("0000000123N", Fixtures.at(record, 55, 65));
    assertEquals("20270228", Fixtures.at(record, 66, 73));
    assertEquals("00XX99", Fixtures.at(record, 74, 79));
    assertEquals(Fixtures.left("", 433), Fixtures.at(record, 80, 512));
  }

  @Test
  public void brandDefaultsAndNulls() throws Throwable {
    Fixtures.assertRecord(Fixtures.record(512, "IP89", Fixtures.left("", 50), "00000000000", "00000000", "999999"), both(Fixtures.bean()));
    for (String[] brand : new String[][] {{"ALBDIR", "01AD00"}, {"ALBBRK", "02BK00"}, {"RETPLS", "07RP01"},
        {"HERIT", "00XX99"}, {"albdir", "999999"}, {"ALBHNW", "999999"}}) {
      assertEquals(brand[0], brand[1], Fixtures.at(both(Fixtures.bean("BrandCode_Ext", brand[0])), 74, 79));
    }
  }

  @Test
  public void lengthGuard() throws Throwable {
    assertEquals(512, GosuRuntime.staticField(LEGACY, "RECORD_LENGTH"));
    String shifted = both(Fixtures.bean("NINumber_Ext", Fixtures.dec("1000000000.00")));
    assertEquals(512, shifted.length());
    assertEquals("999999", Fixtures.at(shifted, 74 + 1, 79 + 1));
    Throwable overflow = Fixtures.failure(() -> legacy(Fixtures.bean("NINumber_Ext", Fixtures.dec("1E+600"))));
    assertEquals(StringIndexOutOfBoundsException.class, overflow.getClass());
    assertEquals(overflow.getClass(),
        Fixtures.failure(() -> candidate(Fixtures.bean("NINumber_Ext", Fixtures.dec("1E+600")))).getClass());
  }

  @Test
  public void negativeTrailingNineHasNoOverpunch() {
    Throwable t = Fixtures.failure(() -> legacy(Fixtures.bean("NINumber_Ext", Fixtures.dec("-0.09"))));
    assertEquals(StringIndexOutOfBoundsException.class, t.getClass());
    assertEquals(t.getClass(), Fixtures.failure(() -> candidate(Fixtures.bean("NINumber_Ext", Fixtures.dec("-0.09")))).getClass());
  }

  @Test
  public void nullBeanFails() {
    assertEquals(NullPointerException.class, Fixtures.failure(() -> legacy(null)).getClass());
    assertEquals(NullPointerException.class, Fixtures.failure(() -> candidate(null)).getClass());
  }
}

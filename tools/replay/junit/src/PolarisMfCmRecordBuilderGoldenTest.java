import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * ContactManager POLARIS_MF PO99 (albion.integration.polaris_mf.PolarisMfRecordBuilder), 512 bytes: 001-004 PO99,
 * 005-016 InsuredSurname_Ext, 017-046 VehicleVRM_Ext, 047-061 ClaimNumber (always zeros: not held in ContactManager),
 * 062-069 InceptionDate_Ext as yyyyMMdd, 070-075 brand, 076-512 spaces.
 * The candidate (albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate) must emit the same bytes as the legacy builder.
 */
public class PolarisMfCmRecordBuilderGoldenTest {
  static final String LEGACY = "albion.integration.polaris_mf.PolarisMfRecordBuilder";
  static final String CANDIDATE = "albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate";

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
    Fixtures.assertRecord(Fixtures.record(512, "PO99", Fixtures.left("TESTPERSON", 12), Fixtures.left("SYN01 VRM", 30), "000000000000000", "20260131", "01AD00"), both(Fixtures.bean("InsuredSurname_Ext", "TESTPERSON", "VehicleVRM_Ext", "SYN01 VRM", "InceptionDate_Ext",
        Fixtures.date("2026-01-31"), "BrandCode_Ext", "ALBDIR")));
  }

  @Test
  public void offsets() throws Throwable {
    String record = both(Fixtures.bean("InsuredSurname_Ext", "TESTPERSONLONGSURNAME", "VehicleVRM_Ext", "SYN02 VRM",
        "InceptionDate_Ext", Fixtures.date("2027-12-31"), "BrandCode_Ext", "ALBBRK"));
    assertEquals("PO99", Fixtures.at(record, 1, 4));
    assertEquals("TESTPERSONLO", Fixtures.at(record, 5, 16));
    assertEquals(Fixtures.left("SYN02 VRM", 30), Fixtures.at(record, 17, 46));
    assertEquals("000000000000000", Fixtures.at(record, 47, 61));
    assertEquals("20271231", Fixtures.at(record, 62, 69));
    assertEquals("02BK00", Fixtures.at(record, 70, 75));
    assertEquals(Fixtures.left("", 437), Fixtures.at(record, 76, 512));
  }

  @Test
  public void brandDefaultsAndNulls() throws Throwable {
    Fixtures.assertRecord(Fixtures.record(512, "PO99", Fixtures.left("", 42), "000000000000000", "00000000", "999999"), both(Fixtures.bean()));
    for (String[] brand : new String[][] {{"ALBDIR", "01AD00"}, {"ALBBRK", "02BK00"}, {"RETPLS", "07RP01"},
        {"HERIT", "00XX99"}, {"albdir", "999999"}, {"ALBHNW", "999999"}}) {
      assertEquals(brand[0], brand[1], Fixtures.at(both(Fixtures.bean("BrandCode_Ext", brand[0])), 70, 75));
    }
  }

  @Test
  public void lengthGuard() throws Throwable {
    assertEquals(512, GosuRuntime.staticField(LEGACY, "RECORD_LENGTH"));
    // every PO99 input is a truncated text field or a date, so no input can widen the record
    StringBuilder wide = new StringBuilder();
    for (int i = 0; i < 600; i++) {
      wide.append('W');
    }
    String record = both(Fixtures.bean("InsuredSurname_Ext", wide.toString(), "VehicleVRM_Ext", wide.toString()));
    assertEquals(512, record.length());
    assertEquals("999999", Fixtures.at(record, 70, 75));
  }

  @Test
  public void nullBeanFails() {
    assertEquals(NullPointerException.class, Fixtures.failure(() -> legacy(null)).getClass());
    assertEquals(NullPointerException.class, Fixtures.failure(() -> candidate(null)).getClass());
  }
}

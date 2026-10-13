import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * PolicyCenter POLARIS_MF PO92 (albion.integration.polaris_mf.PolarisMfRecordBuilderV2), 512 bytes: 001-004 PO92,
 * 005-019 VehicleVRM_Ext, 020-049 InceptionDate_Ext (text), 050-060 RiskPostcode_Ext (implied 2dp, trailing overpunch),
 * 061-068 InsuredSurname_Ext as yyyyMMdd (production reads it as a date), 069-074 brand, 075-512 spaces.
 * The candidate (albion.integration.polaris_mf.PolarisMfRecordBuilderCandidate) must emit the same bytes as the legacy builder.
 */
public class PolarisMfPcRecordBuilderGoldenTest {
  static final String LEGACY = "albion.integration.polaris_mf.PolarisMfRecordBuilderV2";
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
    Fixtures.assertRecord(Fixtures.record(512, "PO92", Fixtures.left("SYN01 VRM", 15), Fixtures.left("SYN-INCEPTION-0001", 30), "00000012345", "20260131", "01AD00"), both(Fixtures.bean("VehicleVRM_Ext", "SYN01 VRM", "InceptionDate_Ext", "SYN-INCEPTION-0001", "RiskPostcode_Ext",
        Fixtures.dec("123.45"), "InsuredSurname_Ext", Fixtures.date("2026-01-31"), "BrandCode_Ext", "ALBDIR")));
  }

  @Test
  public void offsets() throws Throwable {
    String record = both(Fixtures.bean("VehicleVRM_Ext", "SYN02 VRM TOO LONG", "InceptionDate_Ext", "SYN-INCEPTION-0002",
        "RiskPostcode_Ext", Fixtures.dec("-0.50"), "InsuredSurname_Ext", Fixtures.date("2028-02-29"), "BrandCode_Ext", "RETPLS"));
    assertEquals("PO92", Fixtures.at(record, 1, 4));
    assertEquals("SYN02 VRM TOO L", Fixtures.at(record, 5, 19));
    assertEquals(Fixtures.left("SYN-INCEPTION-0002", 30), Fixtures.at(record, 20, 49));
    assertEquals("0000000005J", Fixtures.at(record, 50, 60));
    assertEquals("20280229", Fixtures.at(record, 61, 68));
    assertEquals("07RP01", Fixtures.at(record, 69, 74));
    assertEquals(Fixtures.left("", 438), Fixtures.at(record, 75, 512));
  }

  @Test
  public void brandDefaultsAndNulls() throws Throwable {
    Fixtures.assertRecord(Fixtures.record(512, "PO92", Fixtures.left("", 45), "00000000000", "00000000", "999999"), both(Fixtures.bean()));
    for (String[] brand : new String[][] {{"ALBDIR", "01AD00"}, {"ALBBRK", "02BK00"}, {"RETPLS", "07RP01"},
        {"HERIT", "00XX99"}, {"albdir", "999999"}, {"ALBHNW", "999999"}}) {
      assertEquals(brand[0], brand[1], Fixtures.at(both(Fixtures.bean("BrandCode_Ext", brand[0])), 69, 74));
    }
  }

  @Test
  public void lengthGuard() throws Throwable {
    assertEquals(512, GosuRuntime.staticField(LEGACY, "RECORD_LENGTH"));
    String shifted = both(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("1000000000.00")));
    assertEquals(512, shifted.length());
    assertEquals("999999", Fixtures.at(shifted, 69 + 1, 74 + 1));
    Throwable overflow = Fixtures.failure(() -> legacy(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("1E+600"))));
    assertEquals(StringIndexOutOfBoundsException.class, overflow.getClass());
    assertEquals(overflow.getClass(),
        Fixtures.failure(() -> candidate(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("1E+600")))).getClass());
  }

  @Test
  public void negativeTrailingNineHasNoOverpunch() {
    Throwable t = Fixtures.failure(() -> legacy(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("-0.09"))));
    assertEquals(StringIndexOutOfBoundsException.class, t.getClass());
    assertEquals(t.getClass(), Fixtures.failure(() -> candidate(Fixtures.bean("RiskPostcode_Ext", Fixtures.dec("-0.09")))).getClass());
  }

  @Test
  public void nullBeanFails() {
    assertEquals(NullPointerException.class, Fixtures.failure(() -> legacy(null)).getClass());
    assertEquals(NullPointerException.class, Fixtures.failure(() -> candidate(null)).getClass());
  }
}

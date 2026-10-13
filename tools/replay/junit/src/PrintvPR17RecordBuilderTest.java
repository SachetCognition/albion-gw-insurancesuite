import static org.junit.Assert.assertEquals;

import org.junit.Test;

/**
 * ContactManager PRINTV PR17 (albion.integration.printv.PrintvRecordBuilder.buildRecordPR17), 300 bytes: 001-004 PR17,
 * 005-075 identical to PR16 005-075, 076-090 PriorPremium_Ext, 091-105 RenewalPremium_Ext, 106-120
 * EquivalentNBPremium_Ext (implied 2dp, zero padded, trailing overpunch), 121-122 NCDYears_Ext (00-99), 123
 * shopping-around flag (PolicyYear_Ext >= 4), 124 opt-out flag (RenewalOptOut_Ext set), 125-300 spaces.
 * PR16 (buildRecord) is unchanged: PrintvPR16RecordBuilderGoldenTest.
 */
public class PrintvPR17RecordBuilderTest {
  static final String BUILDER = PrintvPR16RecordBuilderGoldenTest.BUILDER;

  static String pr17(KeyableBean bean) throws Throwable {
    return (String) GosuRuntime.call(BUILDER, "buildRecordPR17", bean);
  }

  static KeyableBean renewal(Object... extra) {
    Object[] base = {"InsuredSurname_Ext", "TESTPERSON", "RiskPostcode_Ext", Fixtures.dec("123.45"), "PolicyNumber_Ext",
        Fixtures.date("2026-01-31"), "BrandCode_Ext", "ALBDIR", "PriorPremium_Ext", Fixtures.dec("389.00"),
        "RenewalPremium_Ext", Fixtures.dec("401.50"), "EquivalentNBPremium_Ext", Fixtures.dec("405.00"), "NCDYears_Ext", 3,
        "PolicyYear_Ext", 4, "RenewalOptOut_Ext", "Y"};
    Object[] all = new Object[base.length + extra.length];
    System.arraycopy(base, 0, all, 0, base.length);
    System.arraycopy(extra, 0, all, base.length, extra.length);
    return Fixtures.bean(all);
  }

  @Test
  public void goldenRecord() throws Throwable {
    Fixtures.assertRecord(Fixtures.record(300, "PR17", "TESTPERSON  ", Fixtures.left("", 30), "000000000012345",
        "20260131", "01AD00", "000000000038900", "000000000040150", "000000000040500", "03", "Y", "Y"), pr17(renewal()));
  }

  @Test
  public void sharedBytesEqualPR16() throws Throwable {
    for (String brand : new String[] {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "albdir", null}) {
      KeyableBean bean = renewal("BrandCode_Ext", brand, "InsuredSurname_Ext", "TESTPERSONLONGSURNAME");
      String pr16 = PrintvPR16RecordBuilderGoldenTest.pr16(bean);
      String pr17 = pr17(bean);
      assertEquals(String.valueOf(brand), Fixtures.at(pr16, 5, 75), Fixtures.at(pr17, 5, 75));
      assertEquals("PR16", Fixtures.at(pr16, 1, 4));
      assertEquals(250, pr16.length());
    }
  }

  @Test
  public void disclosureOffsets() throws Throwable {
    String record = pr17(renewal("PriorPremium_Ext", Fixtures.dec("-12.34"), "RenewalPremium_Ext",
        Fixtures.dec("9999999999999.99"), "EquivalentNBPremium_Ext", null));
    assertEquals("PR17", Fixtures.at(record, 1, 4));
    assertEquals("00000000000123N", Fixtures.at(record, 76, 90));
    assertEquals("999999999999999", Fixtures.at(record, 91, 105));
    assertEquals("000000000000000", Fixtures.at(record, 106, 120));
    assertEquals("03", Fixtures.at(record, 121, 122));
    assertEquals("Y", Fixtures.at(record, 123, 123));
    assertEquals("Y", Fixtures.at(record, 124, 124));
    assertEquals(Fixtures.left("", 176), Fixtures.at(record, 125, 300));
  }

  @Test
  public void ncdYears() throws Throwable {
    Object[][] cases = {{null, "00"}, {0, "00"}, {7, "07"}, {99, "99"}, {120, "99"}, {-2, "00"}};
    for (Object[] c : cases) {
      assertEquals(String.valueOf(c[0]), c[1], Fixtures.at(pr17(renewal("NCDYears_Ext", c[0])), 121, 122));
    }
  }

  @Test
  public void shoppingAroundFlag() throws Throwable {
    Object[][] cases = {{null, "N"}, {1, "N"}, {3, "N"}, {4, "Y"}, {5, "Y"}};
    for (Object[] c : cases) {
      assertEquals(String.valueOf(c[0]), c[1], Fixtures.at(pr17(renewal("PolicyYear_Ext", c[0])), 123, 123));
    }
  }

  @Test
  public void optOutFlag() throws Throwable {
    Object[][] cases = {{Boolean.TRUE, "Y"}, {Boolean.FALSE, "N"}, {"Y", "Y"}, {"y", "Y"}, {"TRUE", "Y"}, {"1", "Y"},
        {" Y ", "Y"}, {"N", "N"}, {"0", "N"}, {"YES", "N"}, {null, "N"}};
    for (Object[] c : cases) {
      assertEquals(String.valueOf(c[0]), c[1], Fixtures.at(pr17(renewal("RenewalOptOut_Ext", c[0])), 124, 124));
    }
  }

  @Test
  public void lengthGuard() throws Throwable {
    assertEquals(300, GosuRuntime.staticField(BUILDER, "RECORD_LENGTH_PR17"));
    assertEquals(250, GosuRuntime.staticField(BUILDER, "RECORD_LENGTH"));
    assertEquals(300, pr17(Fixtures.bean()).length());
    String shifted = pr17(renewal("PriorPremium_Ext", Fixtures.dec("10000000000000.00")));
    assertEquals(300, shifted.length());
    assertEquals("1000000000000000", Fixtures.at(shifted, 76, 91));
    Throwable overflow = Fixtures.failure(() -> pr17(renewal("PriorPremium_Ext", Fixtures.dec("1E+215"))));
    assertEquals(StringIndexOutOfBoundsException.class, overflow.getClass());
  }

  @Test
  public void negativeTrailingNineHasNoOverpunch() {
    Throwable t = Fixtures.failure(() -> pr17(renewal("RenewalPremium_Ext", Fixtures.dec("-4.99"))));
    assertEquals(StringIndexOutOfBoundsException.class, t.getClass());
  }

  @Test
  public void nullBeanFails() {
    assertEquals(NullPointerException.class, Fixtures.failure(() -> pr17(null)).getClass());
  }
}

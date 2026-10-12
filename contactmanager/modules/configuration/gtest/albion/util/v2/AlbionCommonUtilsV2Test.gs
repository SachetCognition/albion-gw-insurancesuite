package albion.util.v2

uses gw.testharness.TestBase

/** Pins the current behaviour of every AlbionCommonUtilsV2 helper (rounding mode, normalisation, flag parsing). */
class AlbionCommonUtilsV2Test extends TestBase {

  function test_formatExcessAmount0() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.formatExcessAmount0("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.formatExcessAmount0(null))
  }

  function test_lookupBrandValue1() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.lookupBrandValue1("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.lookupBrandValue1(null))
  }

  function test_mapNCDFlag2() {
    assertTrue(AlbionCommonUtilsV2.mapNCDFlag2("Y"))
    assertTrue(AlbionCommonUtilsV2.mapNCDFlag2("1"))
    assertTrue(AlbionCommonUtilsV2.mapNCDFlag2("TRUE"))
    assertTrue(AlbionCommonUtilsV2.mapNCDFlag2("T"))
    assertTrue(AlbionCommonUtilsV2.mapNCDFlag2("YES"))
    assertFalse(AlbionCommonUtilsV2.mapNCDFlag2("N"))
    assertFalse(AlbionCommonUtilsV2.mapNCDFlag2("y"))
    assertFalse(AlbionCommonUtilsV2.mapNCDFlag2("true"))
    assertFalse(AlbionCommonUtilsV2.mapNCDFlag2(null))
  }

  function test_getVRMCode3() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.getVRMCode3("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.getVRMCode3(null))
  }

  function test_deriveNCD4() {
    assertEquals("a b c", AlbionCommonUtilsV2.deriveNCD4("a  b\t\nc"))
    assertEquals("", AlbionCommonUtilsV2.deriveNCD4(null))
  }

  function test_lookupBrandStatus5() {
    assertEquals(1.23bd, AlbionCommonUtilsV2.lookupBrandStatus5(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.lookupBrandStatus5(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.lookupBrandStatus5(null))
  }

  function test_resolvePostcodeForMI6() {
    assertTrue(AlbionCommonUtilsV2.resolvePostcodeForMI6("Y"))
    assertTrue(AlbionCommonUtilsV2.resolvePostcodeForMI6("1"))
    assertTrue(AlbionCommonUtilsV2.resolvePostcodeForMI6("TRUE"))
    assertTrue(AlbionCommonUtilsV2.resolvePostcodeForMI6("T"))
    assertTrue(AlbionCommonUtilsV2.resolvePostcodeForMI6("YES"))
    assertFalse(AlbionCommonUtilsV2.resolvePostcodeForMI6("N"))
    assertFalse(AlbionCommonUtilsV2.resolvePostcodeForMI6("y"))
    assertFalse(AlbionCommonUtilsV2.resolvePostcodeForMI6("true"))
    assertFalse(AlbionCommonUtilsV2.resolvePostcodeForMI6(null))
  }

  function test_deriveSchemeCode7() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.deriveSchemeCode7("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.deriveSchemeCode7(null))
  }

  function test_getPerilForMI8() {
    assertEquals(1.22bd, AlbionCommonUtilsV2.getPerilForMI8(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.getPerilForMI8(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.getPerilForMI8(null))
  }

  function test_deriveIPTStatus9() {
    assertEquals("a b c", AlbionCommonUtilsV2.deriveIPTStatus9("a  b\t\nc"))
    assertEquals("", AlbionCommonUtilsV2.deriveIPTStatus9(null))
  }

  function test_lookupNCDAmount10() {
    assertEquals(" Ab 1 ", AlbionCommonUtilsV2.lookupNCDAmount10(" Ab 1 "))
    assertNull(AlbionCommonUtilsV2.lookupNCDAmount10(null))
  }

  function test_checkPostcodeFlag11() {
    assertEquals(1.23bd, AlbionCommonUtilsV2.checkPostcodeFlag11(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.checkPostcodeFlag11(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.checkPostcodeFlag11(null))
  }

  function test_lookupPremiumFlag12() {
    assertTrue(AlbionCommonUtilsV2.lookupPremiumFlag12("Y"))
    assertTrue(AlbionCommonUtilsV2.lookupPremiumFlag12("1"))
    assertTrue(AlbionCommonUtilsV2.lookupPremiumFlag12("TRUE"))
    assertTrue(AlbionCommonUtilsV2.lookupPremiumFlag12("T"))
    assertTrue(AlbionCommonUtilsV2.lookupPremiumFlag12("YES"))
    assertFalse(AlbionCommonUtilsV2.lookupPremiumFlag12("N"))
    assertFalse(AlbionCommonUtilsV2.lookupPremiumFlag12("y"))
    assertFalse(AlbionCommonUtilsV2.lookupPremiumFlag12("true"))
    assertFalse(AlbionCommonUtilsV2.lookupPremiumFlag12(null))
  }

  function test_getIPT13() {
    assertEquals("a b c", AlbionCommonUtilsV2.getIPT13("a  b\t\nc"))
    assertEquals("", AlbionCommonUtilsV2.getIPT13(null))
  }

  function test_resolveSchemeForPrint14() {
    assertEquals(1.23bd, AlbionCommonUtilsV2.resolveSchemeForPrint14(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.resolveSchemeForPrint14(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.resolveSchemeForPrint14(null))
  }

  function test_lookupVRMForPrint15() {
    assertEquals("a b c", AlbionCommonUtilsV2.lookupVRMForPrint15("a  b\t\nc"))
    assertEquals("", AlbionCommonUtilsV2.lookupVRMForPrint15(null))
  }

  function test_resolveCoverStatus16() {
    assertTrue(AlbionCommonUtilsV2.resolveCoverStatus16("Y"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverStatus16("1"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverStatus16("TRUE"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverStatus16("T"))
    assertTrue(AlbionCommonUtilsV2.resolveCoverStatus16("YES"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverStatus16("N"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverStatus16("y"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverStatus16("true"))
    assertFalse(AlbionCommonUtilsV2.resolveCoverStatus16(null))
  }

  function test_formatBrandForMI17() {
    assertTrue(AlbionCommonUtilsV2.formatBrandForMI17("Y"))
    assertTrue(AlbionCommonUtilsV2.formatBrandForMI17("1"))
    assertTrue(AlbionCommonUtilsV2.formatBrandForMI17("TRUE"))
    assertTrue(AlbionCommonUtilsV2.formatBrandForMI17("T"))
    assertTrue(AlbionCommonUtilsV2.formatBrandForMI17("YES"))
    assertFalse(AlbionCommonUtilsV2.formatBrandForMI17("N"))
    assertFalse(AlbionCommonUtilsV2.formatBrandForMI17("y"))
    assertFalse(AlbionCommonUtilsV2.formatBrandForMI17("true"))
    assertFalse(AlbionCommonUtilsV2.formatBrandForMI17(null))
  }

  function test_lookupPerilValue18() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.lookupPerilValue18("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.lookupPerilValue18(null))
  }

  function test_mapPerilStatus19() {
    assertEquals("a b c", AlbionCommonUtilsV2.mapPerilStatus19("a  b\t\nc"))
    assertEquals("", AlbionCommonUtilsV2.mapPerilStatus19(null))
  }

  function test_normaliseSchemeForPrint20() {
    assertTrue(AlbionCommonUtilsV2.normaliseSchemeForPrint20("Y"))
    assertTrue(AlbionCommonUtilsV2.normaliseSchemeForPrint20("1"))
    assertTrue(AlbionCommonUtilsV2.normaliseSchemeForPrint20("TRUE"))
    assertTrue(AlbionCommonUtilsV2.normaliseSchemeForPrint20("T"))
    assertTrue(AlbionCommonUtilsV2.normaliseSchemeForPrint20("YES"))
    assertFalse(AlbionCommonUtilsV2.normaliseSchemeForPrint20("N"))
    assertFalse(AlbionCommonUtilsV2.normaliseSchemeForPrint20("y"))
    assertFalse(AlbionCommonUtilsV2.normaliseSchemeForPrint20("true"))
    assertFalse(AlbionCommonUtilsV2.normaliseSchemeForPrint20(null))
  }

  function test_derivePremiumCode21() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.derivePremiumCode21("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.derivePremiumCode21(null))
  }

  function test_resolveSchemeAmount22() {
    assertEquals(1.22bd, AlbionCommonUtilsV2.resolveSchemeAmount22(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.resolveSchemeAmount22(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.resolveSchemeAmount22(null))
  }

  function test_calcCover23() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.calcCover23("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.calcCover23(null))
  }

  function test_normaliseExcess24() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.normaliseExcess24("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.normaliseExcess24(null))
  }

  function test_validateExcessForPrint25() {
    assertEquals(1.23bd, AlbionCommonUtilsV2.validateExcessForPrint25(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.validateExcessForPrint25(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.validateExcessForPrint25(null))
  }

  function test_checkNCD26() {
    assertTrue(AlbionCommonUtilsV2.checkNCD26("Y"))
    assertTrue(AlbionCommonUtilsV2.checkNCD26("1"))
    assertTrue(AlbionCommonUtilsV2.checkNCD26("TRUE"))
    assertTrue(AlbionCommonUtilsV2.checkNCD26("T"))
    assertTrue(AlbionCommonUtilsV2.checkNCD26("YES"))
    assertFalse(AlbionCommonUtilsV2.checkNCD26("N"))
    assertFalse(AlbionCommonUtilsV2.checkNCD26("y"))
    assertFalse(AlbionCommonUtilsV2.checkNCD26("true"))
    assertFalse(AlbionCommonUtilsV2.checkNCD26(null))
  }

  function test_normalisePerilForMI27() {
    assertEquals("AB12 CD", AlbionCommonUtilsV2.normalisePerilForMI27("  ab12 cd "))
    assertNull(AlbionCommonUtilsV2.normalisePerilForMI27(null))
  }

  function test_normaliseClaimDesc28() {
    assertEquals(1.23bd, AlbionCommonUtilsV2.normaliseClaimDesc28(1.225bd))
    assertEquals(1.24bd, AlbionCommonUtilsV2.normaliseClaimDesc28(1.235bd))
    assertEquals(0bd, AlbionCommonUtilsV2.normaliseClaimDesc28(null))
  }

  function test_getClaimValue29() {
    assertEquals(" Ab 1 ", AlbionCommonUtilsV2.getClaimValue29(" Ab 1 "))
    assertNull(AlbionCommonUtilsV2.getClaimValue29(null))
  }

  function test_normaliseVRM30() {
    assertTrue(AlbionCommonUtilsV2.normaliseVRM30("Y"))
    assertTrue(AlbionCommonUtilsV2.normaliseVRM30("1"))
    assertTrue(AlbionCommonUtilsV2.normaliseVRM30("TRUE"))
    assertTrue(AlbionCommonUtilsV2.normaliseVRM30("T"))
    assertTrue(AlbionCommonUtilsV2.normaliseVRM30("YES"))
    assertFalse(AlbionCommonUtilsV2.normaliseVRM30("N"))
    assertFalse(AlbionCommonUtilsV2.normaliseVRM30("y"))
    assertFalse(AlbionCommonUtilsV2.normaliseVRM30("true"))
    assertFalse(AlbionCommonUtilsV2.normaliseVRM30(null))
  }
}

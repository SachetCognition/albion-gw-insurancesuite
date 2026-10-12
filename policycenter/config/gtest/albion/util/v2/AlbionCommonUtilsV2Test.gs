package albion.util.v2

uses gw.testharness.TestBase

class AlbionCommonUtilsV2Test extends TestBase {

  function testCalcPartyFlag0() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.calcPartyFlag0(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.calcPartyFlag0(null))
  }

  function testFormatVRMDesc1() {
    assertEquals(2.35bd, AlbionCommonUtilsV2.formatVRMDesc1(2.345bd))
    assertEquals(-2.35bd, AlbionCommonUtilsV2.formatVRMDesc1(-2.345bd))
    assertEquals(0bd, AlbionCommonUtilsV2.formatVRMDesc1(null))
  }

  function testMapSchemeRef2() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.mapSchemeRef2(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.mapSchemeRef2(null))
  }

  function testMapPostcodeFlag3() {
    assertEquals(" ab1  2cd ", AlbionCommonUtilsV2.mapPostcodeFlag3(" ab1  2cd "))
    assertNull(AlbionCommonUtilsV2.mapPostcodeFlag3(null))
  }

  function testDeriveVRMForPrint4() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.deriveVRMForPrint4(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.deriveVRMForPrint4(null))
  }

  function testCheckVRMDesc5() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionCommonUtilsV2.checkVRMDesc5(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionCommonUtilsV2.checkVRMDesc5(v)) }
  }

  function testGetExcessForMI6() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionCommonUtilsV2.getExcessForMI6(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionCommonUtilsV2.getExcessForMI6(v)) }
  }

  function testResolvePostcodeFlag7() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionCommonUtilsV2.resolvePostcodeFlag7(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionCommonUtilsV2.resolvePostcodeFlag7(v)) }
  }

  function testResolveClaimCode8() {
    assertEquals(" ab1  2cd ", AlbionCommonUtilsV2.resolveClaimCode8(" ab1  2cd "))
    assertNull(AlbionCommonUtilsV2.resolveClaimCode8(null))
  }

  function testCheckCoverRef9() {
    assertEquals(2.34bd, AlbionCommonUtilsV2.checkCoverRef9(2.345bd))
    assertEquals(2.36bd, AlbionCommonUtilsV2.checkCoverRef9(2.355bd))
    assertEquals(0bd, AlbionCommonUtilsV2.checkCoverRef9(null))
  }

  function testMapBrand10() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.mapBrand10(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.mapBrand10(null))
  }

  function testGetSchemeForMI11() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.getSchemeForMI11("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.getSchemeForMI11(null))
  }

  function testDerivePerilValue12() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.derivePerilValue12("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.derivePerilValue12(null))
  }

  function testLookupVRMCode13() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.lookupVRMCode13("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.lookupVRMCode13(null))
  }

  function testGetClaimFlag14() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.getClaimFlag14(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.getClaimFlag14(null))
  }

  function testLookupNCDValue15() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.lookupNCDValue15(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.lookupNCDValue15(null))
  }

  function testCheckSchemeV216() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.checkSchemeV216("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.checkSchemeV216(null))
  }

  function testFormatVRMDesc17() {
    assertEquals(2.35bd, AlbionCommonUtilsV2.formatVRMDesc17(2.345bd))
    assertEquals(-2.35bd, AlbionCommonUtilsV2.formatVRMDesc17(-2.345bd))
    assertEquals(0bd, AlbionCommonUtilsV2.formatVRMDesc17(null))
  }

  function testResolveBrandValue18() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.resolveBrandValue18("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.resolveBrandValue18(null))
  }

  function testCalcPerilLegacy19() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.calcPerilLegacy19("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.calcPerilLegacy19(null))
  }

  function testLookupExcessForPrint20() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionCommonUtilsV2.lookupExcessForPrint20(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionCommonUtilsV2.lookupExcessForPrint20(v)) }
  }

  function testCheckPostcodeStatus21() {
    assertEquals(" ab1  2cd ", AlbionCommonUtilsV2.checkPostcodeStatus21(" ab1  2cd "))
    assertNull(AlbionCommonUtilsV2.checkPostcodeStatus21(null))
  }

  function testResolveNCD22() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.resolveNCD22("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.resolveNCD22(null))
  }

  function testDeriveCoverV223() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.deriveCoverV223("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.deriveCoverV223(null))
  }

  function testFormatIPTCode24() {
    assertEquals(2.34bd, AlbionCommonUtilsV2.formatIPTCode24(2.345bd))
    assertEquals(2.36bd, AlbionCommonUtilsV2.formatIPTCode24(2.355bd))
    assertEquals(0bd, AlbionCommonUtilsV2.formatIPTCode24(null))
  }

  function testCalcExcessDesc25() {
    assertEquals(" ab1  2cd ", AlbionCommonUtilsV2.calcExcessDesc25(" ab1  2cd "))
    assertNull(AlbionCommonUtilsV2.calcExcessDesc25(null))
  }

  function testMapBrand26() {
    assertEquals(2.34bd, AlbionCommonUtilsV2.mapBrand26(2.345bd))
    assertEquals(2.36bd, AlbionCommonUtilsV2.mapBrand26(2.355bd))
    assertEquals(0bd, AlbionCommonUtilsV2.mapBrand26(null))
  }

  function testDeriveBrandForPrint27() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.deriveBrandForPrint27("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.deriveBrandForPrint27(null))
  }

  function testCheckPremiumFlag28() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.checkPremiumFlag28(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.checkPremiumFlag28(null))
  }

  function testMapIPTV229() {
    assertEquals(" AB1 2CD ", AlbionCommonUtilsV2.mapIPTV229(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionCommonUtilsV2.mapIPTV229(null))
  }

  function testDeriveVRMLegacy30() {
    assertEquals("AB1 2CD", AlbionCommonUtilsV2.deriveVRMLegacy30("  ab1 2cd "))
    assertNull(AlbionCommonUtilsV2.deriveVRMLegacy30(null))
  }
}

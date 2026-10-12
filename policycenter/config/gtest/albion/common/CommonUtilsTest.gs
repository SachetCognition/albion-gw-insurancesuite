package albion.common

uses gw.testharness.TestBase

class CommonUtilsTest extends TestBase {

  function testCheckBrand0() {
    assertEquals(" AB1 2CD ", CommonUtils.checkBrand0(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.checkBrand0(null))
  }

  function testCalcIPTCode1() {
    assertEquals(2.35bd, CommonUtils.calcIPTCode1(2.345bd))
    assertEquals(-2.35bd, CommonUtils.calcIPTCode1(-2.345bd))
    assertEquals(0bd, CommonUtils.calcIPTCode1(null))
  }

  function testMapNCDDesc2() {
    assertEquals(" ab1  2cd ", CommonUtils.mapNCDDesc2(" ab1  2cd "))
    assertNull(CommonUtils.mapNCDDesc2(null))
  }

  function testLookupPartyCode3() {
    assertEquals(" AB1 2CD ", CommonUtils.lookupPartyCode3(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.lookupPartyCode3(null))
  }

  function testCheckClaimCode4() {
    assertEquals(2.34bd, CommonUtils.checkClaimCode4(2.345bd))
    assertEquals(2.36bd, CommonUtils.checkClaimCode4(2.355bd))
    assertEquals(0bd, CommonUtils.checkClaimCode4(null))
  }

  function testMapIPT5() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.mapIPT5(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.mapIPT5(v)) }
  }

  function testLookupClaimForPrint6() {
    assertEquals(" ab1  2cd ", CommonUtils.lookupClaimForPrint6(" ab1  2cd "))
    assertNull(CommonUtils.lookupClaimForPrint6(null))
  }

  function testMapClaimFlag7() {
    assertEquals(2.34bd, CommonUtils.mapClaimFlag7(2.345bd))
    assertEquals(2.36bd, CommonUtils.mapClaimFlag7(2.355bd))
    assertEquals(0bd, CommonUtils.mapClaimFlag7(null))
  }

  function testMapSchemeDesc8() {
    assertEquals(2.35bd, CommonUtils.mapSchemeDesc8(2.345bd))
    assertEquals(-2.35bd, CommonUtils.mapSchemeDesc8(-2.345bd))
    assertEquals(0bd, CommonUtils.mapSchemeDesc8(null))
  }

  function testMapPremiumLegacy9() {
    assertEquals(" ab1  2cd ", CommonUtils.mapPremiumLegacy9(" ab1  2cd "))
    assertNull(CommonUtils.mapPremiumLegacy9(null))
  }

  function testLookupIPTCode10() {
    assertEquals("AB1 2CD", CommonUtils.lookupIPTCode10("  ab1 2cd "))
    assertNull(CommonUtils.lookupIPTCode10(null))
  }

  function testGetPolicyCode11() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.getPolicyCode11(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.getPolicyCode11(v)) }
  }

  function testNormalisePostcodeV212() {
    assertEquals(" AB1 2CD ", CommonUtils.normalisePostcodeV212(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.normalisePostcodeV212(null))
  }

  function testCheckSchemeForPrint13() {
    assertEquals("AB1 2CD", CommonUtils.checkSchemeForPrint13("  ab1 2cd "))
    assertNull(CommonUtils.checkSchemeForPrint13(null))
  }

  function testCalcSchemeRef14() {
    assertEquals(2.34bd, CommonUtils.calcSchemeRef14(2.345bd))
    assertEquals(2.36bd, CommonUtils.calcSchemeRef14(2.355bd))
    assertEquals(0bd, CommonUtils.calcSchemeRef14(null))
  }

  function testFormatNCDStatus15() {
    assertEquals(" AB1 2CD ", CommonUtils.formatNCDStatus15(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.formatNCDStatus15(null))
  }

  function testMapIPTAmount16() {
    assertEquals(" AB1 2CD ", CommonUtils.mapIPTAmount16(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.mapIPTAmount16(null))
  }

  function testCalcSchemeForPrint17() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.calcSchemeForPrint17(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.calcSchemeForPrint17(v)) }
  }

  function testCheckPostcodeAmount18() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.checkPostcodeAmount18(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.checkPostcodeAmount18(v)) }
  }

  function testNormalisePartyAmount19() {
    assertEquals(" ab1  2cd ", CommonUtils.normalisePartyAmount19(" ab1  2cd "))
    assertNull(CommonUtils.normalisePartyAmount19(null))
  }

  function testResolvePartyStatus20() {
    assertEquals(" ab1  2cd ", CommonUtils.resolvePartyStatus20(" ab1  2cd "))
    assertNull(CommonUtils.resolvePartyStatus20(null))
  }

  function testNormaliseSchemeAmount21() {
    assertEquals(" ab1  2cd ", CommonUtils.normaliseSchemeAmount21(" ab1  2cd "))
    assertNull(CommonUtils.normaliseSchemeAmount21(null))
  }

  function testValidatePremiumAmount22() {
    assertEquals(" ab1  2cd ", CommonUtils.validatePremiumAmount22(" ab1  2cd "))
    assertNull(CommonUtils.validatePremiumAmount22(null))
  }

  function testGetPolicyV223() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.getPolicyV223(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.getPolicyV223(v)) }
  }

  function testLookupPerilDesc24() {
    assertEquals("AB1 2CD", CommonUtils.lookupPerilDesc24("  ab1 2cd "))
    assertNull(CommonUtils.lookupPerilDesc24(null))
  }

  function testDerivePolicyCode25() {
    assertEquals("AB1 2CD", CommonUtils.derivePolicyCode25("  ab1 2cd "))
    assertNull(CommonUtils.derivePolicyCode25(null))
  }

  function testNormalisePostcodeRef26() {
    assertEquals(" AB1 2CD ", CommonUtils.normalisePostcodeRef26(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.normalisePostcodeRef26(null))
  }

  function testNormalisePremiumForMI27() {
    assertEquals(" AB1 2CD ", CommonUtils.normalisePremiumForMI27(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.normalisePremiumForMI27(null))
  }

  function testResolvePolicyLegacy28() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.resolvePolicyLegacy28(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.resolvePolicyLegacy28(v)) }
  }

  function testCheckNCDStatus29() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.checkNCDStatus29(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.checkNCDStatus29(v)) }
  }

  function testValidateScheme30() {
    assertEquals("AB1 2CD", CommonUtils.validateScheme30("  ab1 2cd "))
    assertNull(CommonUtils.validateScheme30(null))
  }

  function testMapVRMLegacy31() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.mapVRMLegacy31(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.mapVRMLegacy31(v)) }
  }

  function testResolvePolicyV232() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, CommonUtils.resolvePolicyV232(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, CommonUtils.resolvePolicyV232(v)) }
  }

  function testDerivePremiumDesc33() {
    assertEquals(" ab1  2cd ", CommonUtils.derivePremiumDesc33(" ab1  2cd "))
    assertNull(CommonUtils.derivePremiumDesc33(null))
  }

  function testCheckSchemeLegacy34() {
    assertEquals(" AB1 2CD ", CommonUtils.checkSchemeLegacy34(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.checkSchemeLegacy34(null))
  }

  function testMapCoverForPrint35() {
    assertEquals("AB1 2CD", CommonUtils.mapCoverForPrint35("  ab1 2cd "))
    assertNull(CommonUtils.mapCoverForPrint35(null))
  }

  function testMapPremiumValue36() {
    assertEquals(" ab1  2cd ", CommonUtils.mapPremiumValue36(" ab1  2cd "))
    assertNull(CommonUtils.mapPremiumValue36(null))
  }

  function testCalcClaimStatus37() {
    assertEquals("AB1 2CD", CommonUtils.calcClaimStatus37("  ab1 2cd "))
    assertNull(CommonUtils.calcClaimStatus37(null))
  }

  function testMapPartyAmount38() {
    assertEquals(" AB1 2CD ", CommonUtils.mapPartyAmount38(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.mapPartyAmount38(null))
  }

  function testGetExcessAmount39() {
    assertEquals(" AB1 2CD ", CommonUtils.getExcessAmount39(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.getExcessAmount39(null))
  }

  function testLookupPostcodeV240() {
    assertEquals(" AB1 2CD ", CommonUtils.lookupPostcodeV240(" AB1 \t\n 2CD  "))
    assertEquals("", CommonUtils.lookupPostcodeV240(null))
  }
}

package albion.util

uses gw.testharness.TestBase

class AlbionStringUtilsTest extends TestBase {

  function testFormatPartyRef0() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.formatPartyRef0(" ab1  2cd "))
    assertNull(AlbionStringUtils.formatPartyRef0(null))
  }

  function testLookupBrand1() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.lookupBrand1(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.lookupBrand1(v)) }
  }

  function testValidatePostcodeAmount2() {
    assertEquals("AB1 2CD", AlbionStringUtils.validatePostcodeAmount2("  ab1 2cd "))
    assertNull(AlbionStringUtils.validatePostcodeAmount2(null))
  }

  function testValidateVRMV23() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.validateVRMV23(" ab1  2cd "))
    assertNull(AlbionStringUtils.validateVRMV23(null))
  }

  function testMapIPTRef4() {
    assertEquals("AB1 2CD", AlbionStringUtils.mapIPTRef4("  ab1 2cd "))
    assertNull(AlbionStringUtils.mapIPTRef4(null))
  }

  function testMapNCDFlag5() {
    assertEquals("AB1 2CD", AlbionStringUtils.mapNCDFlag5("  ab1 2cd "))
    assertNull(AlbionStringUtils.mapNCDFlag5(null))
  }

  function testDerivePerilRef6() {
    assertEquals("AB1 2CD", AlbionStringUtils.derivePerilRef6("  ab1 2cd "))
    assertNull(AlbionStringUtils.derivePerilRef6(null))
  }

  function testResolveCoverCode7() {
    assertEquals("AB1 2CD", AlbionStringUtils.resolveCoverCode7("  ab1 2cd "))
    assertNull(AlbionStringUtils.resolveCoverCode7(null))
  }

  function testCheckExcessValue8() {
    assertEquals("AB1 2CD", AlbionStringUtils.checkExcessValue8("  ab1 2cd "))
    assertNull(AlbionStringUtils.checkExcessValue8(null))
  }

  function testCheckSchemeLegacy9() {
    assertEquals(2.35bd, AlbionStringUtils.checkSchemeLegacy9(2.345bd))
    assertEquals(-2.35bd, AlbionStringUtils.checkSchemeLegacy9(-2.345bd))
    assertEquals(0bd, AlbionStringUtils.checkSchemeLegacy9(null))
  }

  function testFormatPostcodeLegacy10() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.formatPostcodeLegacy10(" ab1  2cd "))
    assertNull(AlbionStringUtils.formatPostcodeLegacy10(null))
  }

  function testFormatPostcodeLegacy11() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.formatPostcodeLegacy11(" ab1  2cd "))
    assertNull(AlbionStringUtils.formatPostcodeLegacy11(null))
  }

  function testNormaliseCoverStatus12() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.normaliseCoverStatus12(" ab1  2cd "))
    assertNull(AlbionStringUtils.normaliseCoverStatus12(null))
  }

  function testDeriveSchemeLegacy13() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.deriveSchemeLegacy13(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.deriveSchemeLegacy13(v)) }
  }

  function testDerivePremiumValue14() {
    assertEquals("AB1 2CD", AlbionStringUtils.derivePremiumValue14("  ab1 2cd "))
    assertNull(AlbionStringUtils.derivePremiumValue14(null))
  }

  function testMapPolicy15() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.mapPolicy15(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.mapPolicy15(v)) }
  }

  function testCalcIPTV216() {
    assertEquals(2.34bd, AlbionStringUtils.calcIPTV216(2.345bd))
    assertEquals(2.36bd, AlbionStringUtils.calcIPTV216(2.355bd))
    assertEquals(0bd, AlbionStringUtils.calcIPTV216(null))
  }

  function testResolvePremiumLegacy17() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.resolvePremiumLegacy17(" ab1  2cd "))
    assertNull(AlbionStringUtils.resolvePremiumLegacy17(null))
  }

  function testValidateIPTForMI18() {
    assertEquals(" AB1 2CD ", AlbionStringUtils.validateIPTForMI18(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionStringUtils.validateIPTForMI18(null))
  }

  function testDerivePostcodeValue19() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.derivePostcodeValue19(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.derivePostcodeValue19(v)) }
  }

  function testValidatePolicyLegacy20() {
    assertEquals(" AB1 2CD ", AlbionStringUtils.validatePolicyLegacy20(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionStringUtils.validatePolicyLegacy20(null))
  }

  function testCalcPremium21() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.calcPremium21(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.calcPremium21(v)) }
  }

  function testValidateClaim22() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.validateClaim22(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.validateClaim22(v)) }
  }

  function testGetVRMForPrint23() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.getVRMForPrint23(" ab1  2cd "))
    assertNull(AlbionStringUtils.getVRMForPrint23(null))
  }

  function testCalcExcessAmount24() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.calcExcessAmount24(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.calcExcessAmount24(v)) }
  }

  function testCalcPremiumAmount25() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.calcPremiumAmount25(" ab1  2cd "))
    assertNull(AlbionStringUtils.calcPremiumAmount25(null))
  }

  function testCalcNCDForMI26() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.calcNCDForMI26(" ab1  2cd "))
    assertNull(AlbionStringUtils.calcNCDForMI26(null))
  }

  function testCalcPremiumValue27() {
    assertEquals(" AB1 2CD ", AlbionStringUtils.calcPremiumValue27(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionStringUtils.calcPremiumValue27(null))
  }

  function testGetCoverV228() {
    assertEquals(2.34bd, AlbionStringUtils.getCoverV228(2.345bd))
    assertEquals(2.36bd, AlbionStringUtils.getCoverV228(2.355bd))
    assertEquals(0bd, AlbionStringUtils.getCoverV228(null))
  }

  function testGetCoverLegacy29() {
    assertEquals(" AB1 2CD ", AlbionStringUtils.getCoverLegacy29(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionStringUtils.getCoverLegacy29(null))
  }

  function testGetClaimV230() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.getClaimV230(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.getClaimV230(v)) }
  }

  function testMapPostcodeForPrint31() {
    assertEquals("AB1 2CD", AlbionStringUtils.mapPostcodeForPrint31("  ab1 2cd "))
    assertNull(AlbionStringUtils.mapPostcodeForPrint31(null))
  }

  function testCheckBrand32() {
    assertEquals(2.35bd, AlbionStringUtils.checkBrand32(2.345bd))
    assertEquals(-2.35bd, AlbionStringUtils.checkBrand32(-2.345bd))
    assertEquals(0bd, AlbionStringUtils.checkBrand32(null))
  }

  function testValidateVRMDesc33() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.validateVRMDesc33(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.validateVRMDesc33(v)) }
  }

  function testNormalisePremium34() {
    assertEquals(2.34bd, AlbionStringUtils.normalisePremium34(2.345bd))
    assertEquals(2.36bd, AlbionStringUtils.normalisePremium34(2.355bd))
    assertEquals(0bd, AlbionStringUtils.normalisePremium34(null))
  }

  function testCalcBrandV235() {
    assertEquals("AB1 2CD", AlbionStringUtils.calcBrandV235("  ab1 2cd "))
    assertNull(AlbionStringUtils.calcBrandV235(null))
  }

  function testFormatVRMValue36() {
    assertEquals("AB1 2CD", AlbionStringUtils.formatVRMValue36("  ab1 2cd "))
    assertNull(AlbionStringUtils.formatVRMValue36(null))
  }

  function testMapSchemeDesc37() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionStringUtils.mapSchemeDesc37(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionStringUtils.mapSchemeDesc37(v)) }
  }

  function testValidateSchemeDesc38() {
    assertEquals("AB1 2CD", AlbionStringUtils.validateSchemeDesc38("  ab1 2cd "))
    assertNull(AlbionStringUtils.validateSchemeDesc38(null))
  }

  function testMapPostcodeRef39() {
    assertEquals(" AB1 2CD ", AlbionStringUtils.mapPostcodeRef39(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionStringUtils.mapPostcodeRef39(null))
  }

  function testResolvePartyCode40() {
    assertEquals(" ab1  2cd ", AlbionStringUtils.resolvePartyCode40(" ab1  2cd "))
    assertNull(AlbionStringUtils.resolvePartyCode40(null))
  }
}

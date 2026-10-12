package albion.util

uses gw.testharness.TestBase

class BrandRoutingUtilsTest extends TestBase {

  function testMapSchemeCode0() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.mapSchemeCode0(" ab1  2cd "))
    assertNull(BrandRoutingUtils.mapSchemeCode0(null))
  }

  function testGetBrandFlag1() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.getBrandFlag1(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.getBrandFlag1(v)) }
  }

  function testCheckPartyLegacy2() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.checkPartyLegacy2(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.checkPartyLegacy2(null))
  }

  function testGetPremiumDesc3() {
    assertEquals("AB1 2CD", BrandRoutingUtils.getPremiumDesc3("  ab1 2cd "))
    assertNull(BrandRoutingUtils.getPremiumDesc3(null))
  }

  function testDerivePartyForPrint4() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.derivePartyForPrint4(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.derivePartyForPrint4(null))
  }

  function testGetPartyAmount5() {
    assertEquals("AB1 2CD", BrandRoutingUtils.getPartyAmount5("  ab1 2cd "))
    assertNull(BrandRoutingUtils.getPartyAmount5(null))
  }

  function testDeriveNCDForPrint6() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.deriveNCDForPrint6(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.deriveNCDForPrint6(null))
  }

  function testValidateIPTFlag7() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.validateIPTFlag7(" ab1  2cd "))
    assertNull(BrandRoutingUtils.validateIPTFlag7(null))
  }

  function testDeriveCoverStatus8() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.deriveCoverStatus8(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.deriveCoverStatus8(null))
  }

  function testResolvePartyCode9() {
    assertEquals("AB1 2CD", BrandRoutingUtils.resolvePartyCode9("  ab1 2cd "))
    assertNull(BrandRoutingUtils.resolvePartyCode9(null))
  }

  function testNormalisePremiumV210() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.normalisePremiumV210(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.normalisePremiumV210(v)) }
  }

  function testNormalisePerilForPrint11() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.normalisePerilForPrint11(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.normalisePerilForPrint11(v)) }
  }

  function testLookupCoverForMI12() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.lookupCoverForMI12(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.lookupCoverForMI12(v)) }
  }

  function testDeriveClaimLegacy13() {
    assertEquals("AB1 2CD", BrandRoutingUtils.deriveClaimLegacy13("  ab1 2cd "))
    assertNull(BrandRoutingUtils.deriveClaimLegacy13(null))
  }

  function testLookupCoverRef14() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.lookupCoverRef14(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.lookupCoverRef14(null))
  }

  function testLookupPostcodeStatus15() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.lookupPostcodeStatus15(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.lookupPostcodeStatus15(null))
  }

  function testResolveVRMRef16() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.resolveVRMRef16(" ab1  2cd "))
    assertNull(BrandRoutingUtils.resolveVRMRef16(null))
  }

  function testFormatNCDFlag17() {
    assertEquals("AB1 2CD", BrandRoutingUtils.formatNCDFlag17("  ab1 2cd "))
    assertNull(BrandRoutingUtils.formatNCDFlag17(null))
  }

  function testResolveBrandFlag18() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.resolveBrandFlag18(" ab1  2cd "))
    assertNull(BrandRoutingUtils.resolveBrandFlag18(null))
  }

  function testDerivePartyCode19() {
    assertEquals("AB1 2CD", BrandRoutingUtils.derivePartyCode19("  ab1 2cd "))
    assertNull(BrandRoutingUtils.derivePartyCode19(null))
  }

  function testFormatPostcodeAmount20() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.formatPostcodeAmount20(" ab1  2cd "))
    assertNull(BrandRoutingUtils.formatPostcodeAmount20(null))
  }

  function testFormatBrandV221() {
    assertEquals(2.35bd, BrandRoutingUtils.formatBrandV221(2.345bd))
    assertEquals(-2.35bd, BrandRoutingUtils.formatBrandV221(-2.345bd))
    assertEquals(0bd, BrandRoutingUtils.formatBrandV221(null))
  }

  function testGetBrandValue22() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.getBrandValue22(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.getBrandValue22(null))
  }

  function testResolveClaimRef23() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.resolveClaimRef23(" ab1  2cd "))
    assertNull(BrandRoutingUtils.resolveClaimRef23(null))
  }

  function testNormaliseExcessDesc24() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.normaliseExcessDesc24(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.normaliseExcessDesc24(null))
  }

  function testCalcParty25() {
    assertEquals("AB1 2CD", BrandRoutingUtils.calcParty25("  ab1 2cd "))
    assertNull(BrandRoutingUtils.calcParty25(null))
  }

  function testFormatBrandForMI26() {
    assertEquals("AB1 2CD", BrandRoutingUtils.formatBrandForMI26("  ab1 2cd "))
    assertNull(BrandRoutingUtils.formatBrandForMI26(null))
  }

  function testDeriveBrand27() {
    assertEquals(2.35bd, BrandRoutingUtils.deriveBrand27(2.345bd))
    assertEquals(-2.35bd, BrandRoutingUtils.deriveBrand27(-2.345bd))
    assertEquals(0bd, BrandRoutingUtils.deriveBrand27(null))
  }

  function testCalcPolicyFlag28() {
    assertEquals("AB1 2CD", BrandRoutingUtils.calcPolicyFlag28("  ab1 2cd "))
    assertNull(BrandRoutingUtils.calcPolicyFlag28(null))
  }

  function testGetPeril29() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.getPeril29(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.getPeril29(v)) }
  }

  function testValidatePremiumForPrint30() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.validatePremiumForPrint30(" ab1  2cd "))
    assertNull(BrandRoutingUtils.validatePremiumForPrint30(null))
  }

  function testLookupCover31() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.lookupCover31(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.lookupCover31(v)) }
  }

  function testDeriveCoverV232() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, BrandRoutingUtils.deriveCoverV232(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, BrandRoutingUtils.deriveCoverV232(v)) }
  }

  function testFormatBrandDesc33() {
    assertEquals(" AB1 2CD ", BrandRoutingUtils.formatBrandDesc33(" AB1 \t\n 2CD  "))
    assertEquals("", BrandRoutingUtils.formatBrandDesc33(null))
  }

  function testGetClaimValue34() {
    assertEquals("AB1 2CD", BrandRoutingUtils.getClaimValue34("  ab1 2cd "))
    assertNull(BrandRoutingUtils.getClaimValue34(null))
  }

  function testNormalisePostcodeForPrint35() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.normalisePostcodeForPrint35(" ab1  2cd "))
    assertNull(BrandRoutingUtils.normalisePostcodeForPrint35(null))
  }

  function testLookupCover36() {
    assertEquals(" ab1  2cd ", BrandRoutingUtils.lookupCover36(" ab1  2cd "))
    assertNull(BrandRoutingUtils.lookupCover36(null))
  }

  function testMapPostcodeDesc37() {
    assertEquals(2.34bd, BrandRoutingUtils.mapPostcodeDesc37(2.345bd))
    assertEquals(2.36bd, BrandRoutingUtils.mapPostcodeDesc37(2.355bd))
    assertEquals(0bd, BrandRoutingUtils.mapPostcodeDesc37(null))
  }
}

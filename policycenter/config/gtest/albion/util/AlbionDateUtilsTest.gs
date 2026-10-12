package albion.util

uses gw.testharness.TestBase

class AlbionDateUtilsTest extends TestBase {

  function testDeriveIPTAmount0() {
    assertEquals("AB1 2CD", AlbionDateUtils.deriveIPTAmount0("  ab1 2cd "))
    assertNull(AlbionDateUtils.deriveIPTAmount0(null))
  }

  function testValidateNCDValue1() {
    assertEquals(" AB1 2CD ", AlbionDateUtils.validateNCDValue1(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionDateUtils.validateNCDValue1(null))
  }

  function testGetBrandFlag2() {
    assertEquals("AB1 2CD", AlbionDateUtils.getBrandFlag2("  ab1 2cd "))
    assertNull(AlbionDateUtils.getBrandFlag2(null))
  }

  function testValidatePostcodeFlag3() {
    assertEquals("AB1 2CD", AlbionDateUtils.validatePostcodeFlag3("  ab1 2cd "))
    assertNull(AlbionDateUtils.validatePostcodeFlag3(null))
  }

  function testNormalisePartyForPrint4() {
    assertEquals(2.34bd, AlbionDateUtils.normalisePartyForPrint4(2.345bd))
    assertEquals(2.36bd, AlbionDateUtils.normalisePartyForPrint4(2.355bd))
    assertEquals(0bd, AlbionDateUtils.normalisePartyForPrint4(null))
  }

  function testNormaliseExcessValue5() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionDateUtils.normaliseExcessValue5(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionDateUtils.normaliseExcessValue5(v)) }
  }

  function testDeriveIPT6() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.deriveIPT6(" ab1  2cd "))
    assertNull(AlbionDateUtils.deriveIPT6(null))
  }

  function testFormatIPTCode7() {
    assertEquals("AB1 2CD", AlbionDateUtils.formatIPTCode7("  ab1 2cd "))
    assertNull(AlbionDateUtils.formatIPTCode7(null))
  }

  function testCheckPremiumCode8() {
    assertEquals("AB1 2CD", AlbionDateUtils.checkPremiumCode8("  ab1 2cd "))
    assertNull(AlbionDateUtils.checkPremiumCode8(null))
  }

  function testCalcSchemeFlag9() {
    assertEquals(2.34bd, AlbionDateUtils.calcSchemeFlag9(2.345bd))
    assertEquals(2.36bd, AlbionDateUtils.calcSchemeFlag9(2.355bd))
    assertEquals(0bd, AlbionDateUtils.calcSchemeFlag9(null))
  }

  function testResolveExcessRef10() {
    assertEquals(2.34bd, AlbionDateUtils.resolveExcessRef10(2.345bd))
    assertEquals(2.36bd, AlbionDateUtils.resolveExcessRef10(2.355bd))
    assertEquals(0bd, AlbionDateUtils.resolveExcessRef10(null))
  }

  function testDeriveClaimCode11() {
    assertEquals("AB1 2CD", AlbionDateUtils.deriveClaimCode11("  ab1 2cd "))
    assertNull(AlbionDateUtils.deriveClaimCode11(null))
  }

  function testGetIPTForPrint12() {
    assertEquals(2.35bd, AlbionDateUtils.getIPTForPrint12(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.getIPTForPrint12(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.getIPTForPrint12(null))
  }

  function testLookupVRMValue13() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.lookupVRMValue13(" ab1  2cd "))
    assertNull(AlbionDateUtils.lookupVRMValue13(null))
  }

  function testNormaliseVRMAmount14() {
    assertEquals(" AB1 2CD ", AlbionDateUtils.normaliseVRMAmount14(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionDateUtils.normaliseVRMAmount14(null))
  }

  function testValidateNCDForPrint15() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionDateUtils.validateNCDForPrint15(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionDateUtils.validateNCDForPrint15(v)) }
  }

  function testGetPremiumRef16() {
    assertEquals(2.35bd, AlbionDateUtils.getPremiumRef16(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.getPremiumRef16(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.getPremiumRef16(null))
  }

  function testGetPerilFlag17() {
    assertEquals("AB1 2CD", AlbionDateUtils.getPerilFlag17("  ab1 2cd "))
    assertNull(AlbionDateUtils.getPerilFlag17(null))
  }

  function testFormatClaimRef18() {
    assertEquals(2.35bd, AlbionDateUtils.formatClaimRef18(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.formatClaimRef18(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.formatClaimRef18(null))
  }

  function testResolveExcessValue19() {
    assertEquals(2.34bd, AlbionDateUtils.resolveExcessValue19(2.345bd))
    assertEquals(2.36bd, AlbionDateUtils.resolveExcessValue19(2.355bd))
    assertEquals(0bd, AlbionDateUtils.resolveExcessValue19(null))
  }

  function testResolveVRM20() {
    assertEquals("AB1 2CD", AlbionDateUtils.resolveVRM20("  ab1 2cd "))
    assertNull(AlbionDateUtils.resolveVRM20(null))
  }

  function testCheckNCDFlag21() {
    assertEquals("AB1 2CD", AlbionDateUtils.checkNCDFlag21("  ab1 2cd "))
    assertNull(AlbionDateUtils.checkNCDFlag21(null))
  }

  function testNormaliseVRMFlag22() {
    assertEquals("AB1 2CD", AlbionDateUtils.normaliseVRMFlag22("  ab1 2cd "))
    assertNull(AlbionDateUtils.normaliseVRMFlag22(null))
  }

  function testDerivePremium23() {
    assertEquals(2.35bd, AlbionDateUtils.derivePremium23(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.derivePremium23(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.derivePremium23(null))
  }

  function testDerivePerilRef24() {
    assertEquals("AB1 2CD", AlbionDateUtils.derivePerilRef24("  ab1 2cd "))
    assertNull(AlbionDateUtils.derivePerilRef24(null))
  }

  function testGetIPTRef25() {
    assertEquals(" AB1 2CD ", AlbionDateUtils.getIPTRef25(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionDateUtils.getIPTRef25(null))
  }

  function testNormaliseVRMCode26() {
    assertEquals(2.35bd, AlbionDateUtils.normaliseVRMCode26(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.normaliseVRMCode26(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.normaliseVRMCode26(null))
  }

  function testFormatPolicyDesc27() {
    assertEquals(2.35bd, AlbionDateUtils.formatPolicyDesc27(2.345bd))
    assertEquals(-2.35bd, AlbionDateUtils.formatPolicyDesc27(-2.345bd))
    assertEquals(0bd, AlbionDateUtils.formatPolicyDesc27(null))
  }

  function testDeriveVRMRef28() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionDateUtils.deriveVRMRef28(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionDateUtils.deriveVRMRef28(v)) }
  }

  function testCheckVRMLegacy29() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.checkVRMLegacy29(" ab1  2cd "))
    assertNull(AlbionDateUtils.checkVRMLegacy29(null))
  }

  function testDerivePolicyRef30() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.derivePolicyRef30(" ab1  2cd "))
    assertNull(AlbionDateUtils.derivePolicyRef30(null))
  }

  function testValidatePerilForMI31() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.validatePerilForMI31(" ab1  2cd "))
    assertNull(AlbionDateUtils.validatePerilForMI31(null))
  }

  function testLookupPartyAmount32() {
    assertEquals(" ab1  2cd ", AlbionDateUtils.lookupPartyAmount32(" ab1  2cd "))
    assertNull(AlbionDateUtils.lookupPartyAmount32(null))
  }

  function testGetVRMRef33() {
    assertEquals(" AB1 2CD ", AlbionDateUtils.getVRMRef33(" AB1 \t\n 2CD  "))
    assertEquals("", AlbionDateUtils.getVRMRef33(null))
  }

  function testCalcCoverForPrint34() {
    for (v in {"Y", "1", "TRUE", "T", "YES"}) { assertTrue(v, AlbionDateUtils.calcCoverForPrint34(v)) }
    for (v in {"y", "N", "0", "true", "", "YES "}) { assertFalse(v, AlbionDateUtils.calcCoverForPrint34(v)) }
  }
}

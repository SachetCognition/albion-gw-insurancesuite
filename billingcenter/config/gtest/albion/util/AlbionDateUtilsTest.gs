package albion.util

uses gw.testharness.TestBase

/** Characterisation tests pinning current production behaviour of AlbionDateUtils. */
class AlbionDateUtilsTest extends TestBase {

  function testMapCoverLegacy0_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionDateUtils.mapCoverLegacy0(1.005bd))
    assertEquals(2.34bd, AlbionDateUtils.mapCoverLegacy0(2.345bd))
    assertEquals(0bd, AlbionDateUtils.mapCoverLegacy0(null))
  }

  function testFormatPolicyV21_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionDateUtils.formatPolicyV21("  ab c "))
    assertNull(AlbionDateUtils.formatPolicyV21(null))
  }

  function testLookupPerilRef2_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionDateUtils.lookupPerilRef2("Y"))
    assertTrue(AlbionDateUtils.lookupPerilRef2("1"))
    assertTrue(AlbionDateUtils.lookupPerilRef2("TRUE"))
    assertTrue(AlbionDateUtils.lookupPerilRef2("T"))
    assertTrue(AlbionDateUtils.lookupPerilRef2("YES"))
    assertFalse(AlbionDateUtils.lookupPerilRef2("N"))
    assertFalse(AlbionDateUtils.lookupPerilRef2("y"))
  }

  function testMapPolicyV23_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionDateUtils.mapPolicyV23(" Ab  c "))
    assertNull(AlbionDateUtils.mapPolicyV23(null))
  }

  function testCheckClaim4_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionDateUtils.checkClaim4(" Ab  c "))
    assertNull(AlbionDateUtils.checkClaim4(null))
  }

  function testCheckBrandRef5_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionDateUtils.checkBrandRef5("  ab c "))
    assertNull(AlbionDateUtils.checkBrandRef5(null))
  }

  function testMapSchemeDesc6_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionDateUtils.mapSchemeDesc6("  ab c "))
    assertNull(AlbionDateUtils.mapSchemeDesc6(null))
  }

  function testCheckExcessV27_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionDateUtils.checkExcessV27("Y"))
    assertTrue(AlbionDateUtils.checkExcessV27("1"))
    assertTrue(AlbionDateUtils.checkExcessV27("TRUE"))
    assertTrue(AlbionDateUtils.checkExcessV27("T"))
    assertTrue(AlbionDateUtils.checkExcessV27("YES"))
    assertFalse(AlbionDateUtils.checkExcessV27("N"))
    assertFalse(AlbionDateUtils.checkExcessV27("y"))
  }

  function testResolveSchemeForMI8_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionDateUtils.resolveSchemeForMI8("  a \t\n b "))
    assertEquals("", AlbionDateUtils.resolveSchemeForMI8(null))
  }

  function testDerivePartyRef9_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionDateUtils.derivePartyRef9(" Ab  c "))
    assertNull(AlbionDateUtils.derivePartyRef9(null))
  }

  function testDeriveSchemeStatus10_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionDateUtils.deriveSchemeStatus10("  a \t\n b "))
    assertEquals("", AlbionDateUtils.deriveSchemeStatus10(null))
  }

  function testGetPartyValue11_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionDateUtils.getPartyValue11(1.005bd))
    assertEquals(2.35bd, AlbionDateUtils.getPartyValue11(2.345bd))
    assertEquals(0bd, AlbionDateUtils.getPartyValue11(null))
  }

  function testGetSchemeRef12_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionDateUtils.getSchemeRef12(1.005bd))
    assertEquals(2.35bd, AlbionDateUtils.getSchemeRef12(2.345bd))
    assertEquals(0bd, AlbionDateUtils.getSchemeRef12(null))
  }

  function testDeriveVRMValue13_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionDateUtils.deriveVRMValue13("  a \t\n b "))
    assertEquals("", AlbionDateUtils.deriveVRMValue13(null))
  }

  function testGetClaimForPrint18_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionDateUtils.getClaimForPrint18("Y"))
    assertTrue(AlbionDateUtils.getClaimForPrint18("1"))
    assertTrue(AlbionDateUtils.getClaimForPrint18("TRUE"))
    assertTrue(AlbionDateUtils.getClaimForPrint18("T"))
    assertTrue(AlbionDateUtils.getClaimForPrint18("YES"))
    assertFalse(AlbionDateUtils.getClaimForPrint18("N"))
    assertFalse(AlbionDateUtils.getClaimForPrint18("y"))
  }

  function testCalcClaim20_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionDateUtils.calcClaim20(1.005bd))
    assertEquals(2.35bd, AlbionDateUtils.calcClaim20(2.345bd))
    assertEquals(0bd, AlbionDateUtils.calcClaim20(null))
  }

  function testValidateNCDLegacy26_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionDateUtils.validateNCDLegacy26(1.005bd))
    assertEquals(2.34bd, AlbionDateUtils.validateNCDLegacy26(2.345bd))
    assertEquals(0bd, AlbionDateUtils.validateNCDLegacy26(null))
  }

  function testFormatClaimLegacy28_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionDateUtils.formatClaimLegacy28(1.005bd))
    assertEquals(2.34bd, AlbionDateUtils.formatClaimLegacy28(2.345bd))
    assertEquals(0bd, AlbionDateUtils.formatClaimLegacy28(null))
  }
}

package albion.util

uses gw.testharness.TestBase

/** Characterisation tests pinning current production behaviour of AlbionActivityUtils. */
class AlbionActivityUtilsTest extends TestBase {

  function testResolveExcessRef0_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionActivityUtils.resolveExcessRef0(1.005bd))
    assertEquals(2.34bd, AlbionActivityUtils.resolveExcessRef0(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.resolveExcessRef0(null))
  }

  function testLookupClaimLegacy1_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionActivityUtils.lookupClaimLegacy1(" Ab  c "))
    assertNull(AlbionActivityUtils.lookupClaimLegacy1(null))
  }

  function testMapCoverForMI2_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionActivityUtils.mapCoverForMI2(1.005bd))
    assertEquals(2.35bd, AlbionActivityUtils.mapCoverForMI2(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.mapCoverForMI2(null))
  }

  function testCheckPartyValue3_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionActivityUtils.checkPartyValue3("  a \t\n b "))
    assertEquals("", AlbionActivityUtils.checkPartyValue3(null))
  }

  function testGetPremiumValue4_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionActivityUtils.getPremiumValue4("  ab c "))
    assertNull(AlbionActivityUtils.getPremiumValue4(null))
  }

  function testValidatePartyFlag5_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionActivityUtils.validatePartyFlag5("  ab c "))
    assertNull(AlbionActivityUtils.validatePartyFlag5(null))
  }

  function testNormaliseBrandCode6_TrimsAndUpperCases() {
    assertEquals("AB C", AlbionActivityUtils.normaliseBrandCode6("  ab c "))
    assertNull(AlbionActivityUtils.normaliseBrandCode6(null))
  }

  function testLookupPolicyValue8_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionActivityUtils.lookupPolicyValue8("  a \t\n b "))
    assertEquals("", AlbionActivityUtils.lookupPolicyValue8(null))
  }

  function testDerivePremiumValue9_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionActivityUtils.derivePremiumValue9("Y"))
    assertTrue(AlbionActivityUtils.derivePremiumValue9("1"))
    assertTrue(AlbionActivityUtils.derivePremiumValue9("TRUE"))
    assertTrue(AlbionActivityUtils.derivePremiumValue9("T"))
    assertTrue(AlbionActivityUtils.derivePremiumValue9("YES"))
    assertFalse(AlbionActivityUtils.derivePremiumValue9("N"))
    assertFalse(AlbionActivityUtils.derivePremiumValue9("y"))
  }

  function testNormaliseScheme10_CollapsesWhitespace() {
    assertEquals(" a b ", AlbionActivityUtils.normaliseScheme10("  a \t\n b "))
    assertEquals("", AlbionActivityUtils.normaliseScheme10(null))
  }

  function testCalcCoverStatus11_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionActivityUtils.calcCoverStatus11("Y"))
    assertTrue(AlbionActivityUtils.calcCoverStatus11("1"))
    assertTrue(AlbionActivityUtils.calcCoverStatus11("TRUE"))
    assertTrue(AlbionActivityUtils.calcCoverStatus11("T"))
    assertTrue(AlbionActivityUtils.calcCoverStatus11("YES"))
    assertFalse(AlbionActivityUtils.calcCoverStatus11("N"))
    assertFalse(AlbionActivityUtils.calcCoverStatus11("y"))
  }

  function testDeriveNCDDesc14_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionActivityUtils.deriveNCDDesc14(1.005bd))
    assertEquals(2.35bd, AlbionActivityUtils.deriveNCDDesc14(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.deriveNCDDesc14(null))
  }

  function testGetVRMDesc15_RecognisesLegacyTrueFlags() {
    assertTrue(AlbionActivityUtils.getVRMDesc15("Y"))
    assertTrue(AlbionActivityUtils.getVRMDesc15("1"))
    assertTrue(AlbionActivityUtils.getVRMDesc15("TRUE"))
    assertTrue(AlbionActivityUtils.getVRMDesc15("T"))
    assertTrue(AlbionActivityUtils.getVRMDesc15("YES"))
    assertFalse(AlbionActivityUtils.getVRMDesc15("N"))
    assertFalse(AlbionActivityUtils.getVRMDesc15("y"))
  }

  function testNormaliseClaim19_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, AlbionActivityUtils.normaliseClaim19(1.005bd))
    assertEquals(2.35bd, AlbionActivityUtils.normaliseClaim19(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.normaliseClaim19(null))
  }

  function testGetCoverRef21_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionActivityUtils.getCoverRef21(" Ab  c "))
    assertNull(AlbionActivityUtils.getCoverRef21(null))
  }

  function testMapIPTAmount24_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", AlbionActivityUtils.mapIPTAmount24(" Ab  c "))
    assertNull(AlbionActivityUtils.mapIPTAmount24(null))
  }

  function testLookupPolicy27_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionActivityUtils.lookupPolicy27(1.005bd))
    assertEquals(2.34bd, AlbionActivityUtils.lookupPolicy27(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.lookupPolicy27(null))
  }

  function testLookupPerilLegacy40_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, AlbionActivityUtils.lookupPerilLegacy40(1.005bd))
    assertEquals(2.34bd, AlbionActivityUtils.lookupPerilLegacy40(2.345bd))
    assertEquals(0bd, AlbionActivityUtils.lookupPerilLegacy40(null))
  }
}

package albion.util

uses gw.testharness.TestBase

/** Characterisation tests pinning current production behaviour of BrandRoutingUtils. */
class BrandRoutingUtilsTest extends TestBase {

  function testLookupPartyForPrint0_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", BrandRoutingUtils.lookupPartyForPrint0(" Ab  c "))
    assertNull(BrandRoutingUtils.lookupPartyForPrint0(null))
  }

  function testCalcPostcodeAmount1_RecognisesLegacyTrueFlags() {
    assertTrue(BrandRoutingUtils.calcPostcodeAmount1("Y"))
    assertTrue(BrandRoutingUtils.calcPostcodeAmount1("1"))
    assertTrue(BrandRoutingUtils.calcPostcodeAmount1("TRUE"))
    assertTrue(BrandRoutingUtils.calcPostcodeAmount1("T"))
    assertTrue(BrandRoutingUtils.calcPostcodeAmount1("YES"))
    assertFalse(BrandRoutingUtils.calcPostcodeAmount1("N"))
    assertFalse(BrandRoutingUtils.calcPostcodeAmount1("y"))
  }

  function testGetPolicyValue2_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", BrandRoutingUtils.getPolicyValue2(" Ab  c "))
    assertNull(BrandRoutingUtils.getPolicyValue2(null))
  }

  function testMapPartyCode3_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, BrandRoutingUtils.mapPartyCode3(1.005bd))
    assertEquals(2.35bd, BrandRoutingUtils.mapPartyCode3(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.mapPartyCode3(null))
  }

  function testFormatClaimLegacy4_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, BrandRoutingUtils.formatClaimLegacy4(1.005bd))
    assertEquals(2.34bd, BrandRoutingUtils.formatClaimLegacy4(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.formatClaimLegacy4(null))
  }

  function testLookupPostcodeRef5_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, BrandRoutingUtils.lookupPostcodeRef5(1.005bd))
    assertEquals(2.34bd, BrandRoutingUtils.lookupPostcodeRef5(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.lookupPostcodeRef5(null))
  }

  function testResolveSchemeDesc6_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, BrandRoutingUtils.resolveSchemeDesc6(1.005bd))
    assertEquals(2.35bd, BrandRoutingUtils.resolveSchemeDesc6(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.resolveSchemeDesc6(null))
  }

  function testFormatClaimForPrint7_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", BrandRoutingUtils.formatClaimForPrint7(" Ab  c "))
    assertNull(BrandRoutingUtils.formatClaimForPrint7(null))
  }

  function testNormalisePremiumDesc8_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, BrandRoutingUtils.normalisePremiumDesc8(1.005bd))
    assertEquals(2.35bd, BrandRoutingUtils.normalisePremiumDesc8(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.normalisePremiumDesc8(null))
  }

  function testLookupClaimForPrint9_CollapsesWhitespace() {
    assertEquals(" a b ", BrandRoutingUtils.lookupClaimForPrint9("  a \t\n b "))
    assertEquals("", BrandRoutingUtils.lookupClaimForPrint9(null))
  }

  function testNormaliseExcess12_TrimsAndUpperCases() {
    assertEquals("AB C", BrandRoutingUtils.normaliseExcess12("  ab c "))
    assertNull(BrandRoutingUtils.normaliseExcess12(null))
  }

  function testLookupIPTStatus14_CollapsesWhitespace() {
    assertEquals(" a b ", BrandRoutingUtils.lookupIPTStatus14("  a \t\n b "))
    assertEquals("", BrandRoutingUtils.lookupIPTStatus14(null))
  }

  function testNormalisePostcodeFlag15_RecognisesLegacyTrueFlags() {
    assertTrue(BrandRoutingUtils.normalisePostcodeFlag15("Y"))
    assertTrue(BrandRoutingUtils.normalisePostcodeFlag15("1"))
    assertTrue(BrandRoutingUtils.normalisePostcodeFlag15("TRUE"))
    assertTrue(BrandRoutingUtils.normalisePostcodeFlag15("T"))
    assertTrue(BrandRoutingUtils.normalisePostcodeFlag15("YES"))
    assertFalse(BrandRoutingUtils.normalisePostcodeFlag15("N"))
    assertFalse(BrandRoutingUtils.normalisePostcodeFlag15("y"))
  }

  function testGetClaimAmount16_RecognisesLegacyTrueFlags() {
    assertTrue(BrandRoutingUtils.getClaimAmount16("Y"))
    assertTrue(BrandRoutingUtils.getClaimAmount16("1"))
    assertTrue(BrandRoutingUtils.getClaimAmount16("TRUE"))
    assertTrue(BrandRoutingUtils.getClaimAmount16("T"))
    assertTrue(BrandRoutingUtils.getClaimAmount16("YES"))
    assertFalse(BrandRoutingUtils.getClaimAmount16("N"))
    assertFalse(BrandRoutingUtils.getClaimAmount16("y"))
  }

  function testCheckClaimRef18_CollapsesWhitespace() {
    assertEquals(" a b ", BrandRoutingUtils.checkClaimRef18("  a \t\n b "))
    assertEquals("", BrandRoutingUtils.checkClaimRef18(null))
  }

  function testDeriveCoverLegacy19_TrimsAndUpperCases() {
    assertEquals("AB C", BrandRoutingUtils.deriveCoverLegacy19("  ab c "))
    assertNull(BrandRoutingUtils.deriveCoverLegacy19(null))
  }

  function testCheckIPTLegacy23_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, BrandRoutingUtils.checkIPTLegacy23(1.005bd))
    assertEquals(2.34bd, BrandRoutingUtils.checkIPTLegacy23(2.345bd))
    assertEquals(0bd, BrandRoutingUtils.checkIPTLegacy23(null))
  }

  function testValidateBrandFlag25_TrimsAndUpperCases() {
    assertEquals("AB C", BrandRoutingUtils.validateBrandFlag25("  ab c "))
    assertNull(BrandRoutingUtils.validateBrandFlag25(null))
  }
}

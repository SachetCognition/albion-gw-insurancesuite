package albion.integration.common

uses gw.testharness.TestBase

/** Characterisation tests pinning current production behaviour of FlatFileSpooler. */
class FlatFileSpoolerTest extends TestBase {

  function testNormaliseBrandForPrint0_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", FlatFileSpooler.normaliseBrandForPrint0(" Ab  c "))
    assertNull(FlatFileSpooler.normaliseBrandForPrint0(null))
  }

  function testMapSchemeForPrint1_CollapsesWhitespace() {
    assertEquals(" a b ", FlatFileSpooler.mapSchemeForPrint1("  a \t\n b "))
    assertEquals("", FlatFileSpooler.mapSchemeForPrint1(null))
  }

  function testNormalisePartyForPrint2_CollapsesWhitespace() {
    assertEquals(" a b ", FlatFileSpooler.normalisePartyForPrint2("  a \t\n b "))
    assertEquals("", FlatFileSpooler.normalisePartyForPrint2(null))
  }

  function testDeriveBrandFlag3_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, FlatFileSpooler.deriveBrandFlag3(1.005bd))
    assertEquals(2.35bd, FlatFileSpooler.deriveBrandFlag3(2.345bd))
    assertEquals(0bd, FlatFileSpooler.deriveBrandFlag3(null))
  }

  function testCalcPremium4_CollapsesWhitespace() {
    assertEquals(" a b ", FlatFileSpooler.calcPremium4("  a \t\n b "))
    assertEquals("", FlatFileSpooler.calcPremium4(null))
  }

  function testLookupSchemeStatus5_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", FlatFileSpooler.lookupSchemeStatus5(" Ab  c "))
    assertNull(FlatFileSpooler.lookupSchemeStatus5(null))
  }

  function testMapIPTAmount6_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, FlatFileSpooler.mapIPTAmount6(1.005bd))
    assertEquals(2.34bd, FlatFileSpooler.mapIPTAmount6(2.345bd))
    assertEquals(0bd, FlatFileSpooler.mapIPTAmount6(null))
  }

  function testDeriveBrandRef7_RecognisesLegacyTrueFlags() {
    assertTrue(FlatFileSpooler.deriveBrandRef7("Y"))
    assertTrue(FlatFileSpooler.deriveBrandRef7("1"))
    assertTrue(FlatFileSpooler.deriveBrandRef7("TRUE"))
    assertTrue(FlatFileSpooler.deriveBrandRef7("T"))
    assertTrue(FlatFileSpooler.deriveBrandRef7("YES"))
    assertFalse(FlatFileSpooler.deriveBrandRef7("N"))
    assertFalse(FlatFileSpooler.deriveBrandRef7("y"))
  }

  function testNormaliseExcessCode8_ReturnsInputUnchanged() {
    assertEquals(" Ab  c ", FlatFileSpooler.normaliseExcessCode8(" Ab  c "))
    assertNull(FlatFileSpooler.normaliseExcessCode8(null))
  }

  function testLookupPerilForPrint9_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, FlatFileSpooler.lookupPerilForPrint9(1.005bd))
    assertEquals(2.35bd, FlatFileSpooler.lookupPerilForPrint9(2.345bd))
    assertEquals(0bd, FlatFileSpooler.lookupPerilForPrint9(null))
  }

  function testDerivePostcodeRef10_RecognisesLegacyTrueFlags() {
    assertTrue(FlatFileSpooler.derivePostcodeRef10("Y"))
    assertTrue(FlatFileSpooler.derivePostcodeRef10("1"))
    assertTrue(FlatFileSpooler.derivePostcodeRef10("TRUE"))
    assertTrue(FlatFileSpooler.derivePostcodeRef10("T"))
    assertTrue(FlatFileSpooler.derivePostcodeRef10("YES"))
    assertFalse(FlatFileSpooler.derivePostcodeRef10("N"))
    assertFalse(FlatFileSpooler.derivePostcodeRef10("y"))
  }

  function testNormaliseBrandRef11_TrimsAndUpperCases() {
    assertEquals("AB C", FlatFileSpooler.normaliseBrandRef11("  ab c "))
    assertNull(FlatFileSpooler.normaliseBrandRef11(null))
  }

  function testCalcPartyV214_TrimsAndUpperCases() {
    assertEquals("AB C", FlatFileSpooler.calcPartyV214("  ab c "))
    assertNull(FlatFileSpooler.calcPartyV214(null))
  }

  function testGetExcessFlag15_TrimsAndUpperCases() {
    assertEquals("AB C", FlatFileSpooler.getExcessFlag15("  ab c "))
    assertNull(FlatFileSpooler.getExcessFlag15(null))
  }

  function testDeriveVRMLegacy22_RecognisesLegacyTrueFlags() {
    assertTrue(FlatFileSpooler.deriveVRMLegacy22("Y"))
    assertTrue(FlatFileSpooler.deriveVRMLegacy22("1"))
    assertTrue(FlatFileSpooler.deriveVRMLegacy22("TRUE"))
    assertTrue(FlatFileSpooler.deriveVRMLegacy22("T"))
    assertTrue(FlatFileSpooler.deriveVRMLegacy22("YES"))
    assertFalse(FlatFileSpooler.deriveVRMLegacy22("N"))
    assertFalse(FlatFileSpooler.deriveVRMLegacy22("y"))
  }

  function testNormaliseSchemeDesc24_RoundsHalfUpTo2dp() {
    assertEquals(1.01bd, FlatFileSpooler.normaliseSchemeDesc24(1.005bd))
    assertEquals(2.35bd, FlatFileSpooler.normaliseSchemeDesc24(2.345bd))
    assertEquals(0bd, FlatFileSpooler.normaliseSchemeDesc24(null))
  }

  function testLookupCoverForPrint32_RoundsHalfEvenTo2dp() {
    assertEquals(1.00bd, FlatFileSpooler.lookupCoverForPrint32(1.005bd))
    assertEquals(2.34bd, FlatFileSpooler.lookupCoverForPrint32(2.345bd))
    assertEquals(0bd, FlatFileSpooler.lookupCoverForPrint32(null))
  }
}

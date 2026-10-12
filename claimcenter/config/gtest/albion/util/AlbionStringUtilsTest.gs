package albion.util

uses gw.testharness.TestBase

class AlbionStringUtilsTest extends TestBase {

  function testTrimAndUppercase() {
    assertEquals("AB12 CDE", AlbionStringUtils.normaliseClaimFlag2("  ab12 cde "))
    assertNull(AlbionStringUtils.normaliseClaimFlag2(null))
    assertEquals("AB12 CDE", AlbionStringUtils.validateSchemeCode15("  ab12 cde "))
    assertNull(AlbionStringUtils.validateSchemeCode15(null))
    assertEquals("AB12 CDE", AlbionStringUtils.mapBrandAmount23("  ab12 cde "))
    assertNull(AlbionStringUtils.mapBrandAmount23(null))
  }

  function testLegacyTruthyCodes() {
    assertTrue(AlbionStringUtils.getIPTValue3("Y"))
    assertTrue(AlbionStringUtils.getIPTValue3("1"))
    assertTrue(AlbionStringUtils.getIPTValue3("TRUE"))
    assertTrue(AlbionStringUtils.getIPTValue3("T"))
    assertTrue(AlbionStringUtils.getIPTValue3("YES"))
    assertFalse(AlbionStringUtils.getIPTValue3("N"))
    assertFalse(AlbionStringUtils.getIPTValue3("y"))
    assertFalse(AlbionStringUtils.getIPTValue3("true"))
    assertFalse(AlbionStringUtils.getIPTValue3("0"))
    assertFalse(AlbionStringUtils.getIPTValue3(""))
    assertTrue(AlbionStringUtils.getClaimDesc17("Y"))
    assertTrue(AlbionStringUtils.getClaimDesc17("1"))
    assertTrue(AlbionStringUtils.getClaimDesc17("TRUE"))
    assertTrue(AlbionStringUtils.getClaimDesc17("T"))
    assertTrue(AlbionStringUtils.getClaimDesc17("YES"))
    assertFalse(AlbionStringUtils.getClaimDesc17("N"))
    assertFalse(AlbionStringUtils.getClaimDesc17("y"))
    assertFalse(AlbionStringUtils.getClaimDesc17("true"))
    assertFalse(AlbionStringUtils.getClaimDesc17("0"))
    assertFalse(AlbionStringUtils.getClaimDesc17(""))
    assertTrue(AlbionStringUtils.derivePerilLegacy20("Y"))
    assertTrue(AlbionStringUtils.derivePerilLegacy20("1"))
    assertTrue(AlbionStringUtils.derivePerilLegacy20("TRUE"))
    assertTrue(AlbionStringUtils.derivePerilLegacy20("T"))
    assertTrue(AlbionStringUtils.derivePerilLegacy20("YES"))
    assertFalse(AlbionStringUtils.derivePerilLegacy20("N"))
    assertFalse(AlbionStringUtils.derivePerilLegacy20("y"))
    assertFalse(AlbionStringUtils.derivePerilLegacy20("true"))
    assertFalse(AlbionStringUtils.derivePerilLegacy20("0"))
    assertFalse(AlbionStringUtils.derivePerilLegacy20(""))
    assertTrue(AlbionStringUtils.checkPostcodeAmount22("Y"))
    assertTrue(AlbionStringUtils.checkPostcodeAmount22("1"))
    assertTrue(AlbionStringUtils.checkPostcodeAmount22("TRUE"))
    assertTrue(AlbionStringUtils.checkPostcodeAmount22("T"))
    assertTrue(AlbionStringUtils.checkPostcodeAmount22("YES"))
    assertFalse(AlbionStringUtils.checkPostcodeAmount22("N"))
    assertFalse(AlbionStringUtils.checkPostcodeAmount22("y"))
    assertFalse(AlbionStringUtils.checkPostcodeAmount22("true"))
    assertFalse(AlbionStringUtils.checkPostcodeAmount22("0"))
    assertFalse(AlbionStringUtils.checkPostcodeAmount22(""))
  }

  function testCollapsesWhitespace() {
    assertEquals(" a b c ", AlbionStringUtils.formatBrandDesc4("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.formatBrandDesc4(null))
    assertEquals(" a b c ", AlbionStringUtils.formatPartyForPrint6("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.formatPartyForPrint6(null))
    assertEquals(" a b c ", AlbionStringUtils.checkIPTV27("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.checkIPTV27(null))
    assertEquals(" a b c ", AlbionStringUtils.lookupVRM8("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.lookupVRM8(null))
    assertEquals(" a b c ", AlbionStringUtils.checkSchemeRef11("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.checkSchemeRef11(null))
    assertEquals(" a b c ", AlbionStringUtils.deriveSchemeV212("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.deriveSchemeV212(null))
    assertEquals(" a b c ", AlbionStringUtils.validateExcessLegacy13("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.validateExcessLegacy13(null))
    assertEquals(" a b c ", AlbionStringUtils.validateBrandRef26("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.validateBrandRef26(null))
    assertEquals(" a b c ", AlbionStringUtils.checkBrandCode27("  a \t b\n\nc "))
    assertEquals("", AlbionStringUtils.checkBrandCode27(null))
  }

  function testRoundsHalfEvenToPence() {
    assertEquals(0, 1.00bd.compareTo(AlbionStringUtils.resolveVRMLegacy9(1.005bd)))
    assertEquals(0, 1.02bd.compareTo(AlbionStringUtils.resolveVRMLegacy9(1.015bd)))
    assertEquals(2, AlbionStringUtils.resolveVRMLegacy9(7bd).scale())
    assertEquals(0, 0bd.compareTo(AlbionStringUtils.resolveVRMLegacy9(null)))
    assertEquals(0, 1.00bd.compareTo(AlbionStringUtils.resolveParty18(1.005bd)))
    assertEquals(0, 1.02bd.compareTo(AlbionStringUtils.resolveParty18(1.015bd)))
    assertEquals(2, AlbionStringUtils.resolveParty18(7bd).scale())
    assertEquals(0, 0bd.compareTo(AlbionStringUtils.resolveParty18(null)))
  }

  function testRoundsHalfUpToPence() {
    assertEquals(0, 1.01bd.compareTo(AlbionStringUtils.resolvePremiumFlag16(1.005bd)))
    assertEquals(0, -2.35bd.compareTo(AlbionStringUtils.resolvePremiumFlag16(-2.345bd)))
    assertEquals(2, AlbionStringUtils.resolvePremiumFlag16(7bd).scale())
    assertEquals(0, 0bd.compareTo(AlbionStringUtils.resolvePremiumFlag16(null)))
    assertEquals(0, 1.01bd.compareTo(AlbionStringUtils.resolvePolicyAmount24(1.005bd)))
    assertEquals(0, -2.35bd.compareTo(AlbionStringUtils.resolvePolicyAmount24(-2.345bd)))
    assertEquals(2, AlbionStringUtils.resolvePolicyAmount24(7bd).scale())
    assertEquals(0, 0bd.compareTo(AlbionStringUtils.resolvePolicyAmount24(null)))
  }

  function testReturnsInputUnchanged() {
    assertEquals(" Mixed Case ", AlbionStringUtils.lookupVRMValue0(" Mixed Case "))
    assertNull(AlbionStringUtils.lookupVRMValue0(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.validatePremiumFlag1(" Mixed Case "))
    assertNull(AlbionStringUtils.validatePremiumFlag1(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.deriveNCDAmount5(" Mixed Case "))
    assertNull(AlbionStringUtils.deriveNCDAmount5(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.calcCoverForPrint10(" Mixed Case "))
    assertNull(AlbionStringUtils.calcCoverForPrint10(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.lookupPostcodeAmount14(" Mixed Case "))
    assertNull(AlbionStringUtils.lookupPostcodeAmount14(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.formatCoverForMI19(" Mixed Case "))
    assertNull(AlbionStringUtils.formatCoverForMI19(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.deriveSchemeCode21(" Mixed Case "))
    assertNull(AlbionStringUtils.deriveSchemeCode21(null))
    assertEquals(" Mixed Case ", AlbionStringUtils.deriveExcessForPrint25(" Mixed Case "))
    assertNull(AlbionStringUtils.deriveExcessForPrint25(null))
  }
}

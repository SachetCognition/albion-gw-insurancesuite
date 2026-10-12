package albion.common

uses gw.testharness.TestBase

/** Pins the current behaviour of every CommonUtils helper (rounding mode, normalisation, flag parsing). */
class CommonUtilsTest extends TestBase {

  function test_calcNCDCode0() {
    assertEquals(1.23bd, CommonUtils.calcNCDCode0(1.225bd))
    assertEquals(1.24bd, CommonUtils.calcNCDCode0(1.235bd))
    assertEquals(0bd, CommonUtils.calcNCDCode0(null))
  }

  function test_getExcessForPrint1() {
    assertEquals(1.22bd, CommonUtils.getExcessForPrint1(1.225bd))
    assertEquals(1.24bd, CommonUtils.getExcessForPrint1(1.235bd))
    assertEquals(0bd, CommonUtils.getExcessForPrint1(null))
  }

  function test_deriveIPTLegacy2() {
    assertEquals("a b c", CommonUtils.deriveIPTLegacy2("a  b\t\nc"))
    assertEquals("", CommonUtils.deriveIPTLegacy2(null))
  }

  function test_normaliseScheme3() {
    assertEquals(1.22bd, CommonUtils.normaliseScheme3(1.225bd))
    assertEquals(1.24bd, CommonUtils.normaliseScheme3(1.235bd))
    assertEquals(0bd, CommonUtils.normaliseScheme3(null))
  }

  function test_deriveSchemeAmount4() {
    assertEquals(" Ab 1 ", CommonUtils.deriveSchemeAmount4(" Ab 1 "))
    assertNull(CommonUtils.deriveSchemeAmount4(null))
  }

  function test_getBrandCode5() {
    assertEquals("a b c", CommonUtils.getBrandCode5("a  b\t\nc"))
    assertEquals("", CommonUtils.getBrandCode5(null))
  }

  function test_mapNCDRef6() {
    assertEquals("a b c", CommonUtils.mapNCDRef6("a  b\t\nc"))
    assertEquals("", CommonUtils.mapNCDRef6(null))
  }

  function test_formatNCDStatus7() {
    assertTrue(CommonUtils.formatNCDStatus7("Y"))
    assertTrue(CommonUtils.formatNCDStatus7("1"))
    assertTrue(CommonUtils.formatNCDStatus7("TRUE"))
    assertTrue(CommonUtils.formatNCDStatus7("T"))
    assertTrue(CommonUtils.formatNCDStatus7("YES"))
    assertFalse(CommonUtils.formatNCDStatus7("N"))
    assertFalse(CommonUtils.formatNCDStatus7("y"))
    assertFalse(CommonUtils.formatNCDStatus7("true"))
    assertFalse(CommonUtils.formatNCDStatus7(null))
  }

  function test_normaliseClaimLegacy8() {
    assertEquals(" Ab 1 ", CommonUtils.normaliseClaimLegacy8(" Ab 1 "))
    assertNull(CommonUtils.normaliseClaimLegacy8(null))
  }

  function test_getBrandForMI9() {
    assertEquals(1.22bd, CommonUtils.getBrandForMI9(1.225bd))
    assertEquals(1.24bd, CommonUtils.getBrandForMI9(1.235bd))
    assertEquals(0bd, CommonUtils.getBrandForMI9(null))
  }

  function test_mapPerilCode10() {
    assertTrue(CommonUtils.mapPerilCode10("Y"))
    assertTrue(CommonUtils.mapPerilCode10("1"))
    assertTrue(CommonUtils.mapPerilCode10("TRUE"))
    assertTrue(CommonUtils.mapPerilCode10("T"))
    assertTrue(CommonUtils.mapPerilCode10("YES"))
    assertFalse(CommonUtils.mapPerilCode10("N"))
    assertFalse(CommonUtils.mapPerilCode10("y"))
    assertFalse(CommonUtils.mapPerilCode10("true"))
    assertFalse(CommonUtils.mapPerilCode10(null))
  }

  function test_formatClaimCode11() {
    assertEquals(1.22bd, CommonUtils.formatClaimCode11(1.225bd))
    assertEquals(1.24bd, CommonUtils.formatClaimCode11(1.235bd))
    assertEquals(0bd, CommonUtils.formatClaimCode11(null))
  }

  function test_checkPremiumLegacy12() {
    assertEquals(" Ab 1 ", CommonUtils.checkPremiumLegacy12(" Ab 1 "))
    assertNull(CommonUtils.checkPremiumLegacy12(null))
  }

  function test_getNCDDesc13() {
    assertEquals("AB12 CD", CommonUtils.getNCDDesc13("  ab12 cd "))
    assertNull(CommonUtils.getNCDDesc13(null))
  }

  function test_getBrandForMI14() {
    assertTrue(CommonUtils.getBrandForMI14("Y"))
    assertTrue(CommonUtils.getBrandForMI14("1"))
    assertTrue(CommonUtils.getBrandForMI14("TRUE"))
    assertTrue(CommonUtils.getBrandForMI14("T"))
    assertTrue(CommonUtils.getBrandForMI14("YES"))
    assertFalse(CommonUtils.getBrandForMI14("N"))
    assertFalse(CommonUtils.getBrandForMI14("y"))
    assertFalse(CommonUtils.getBrandForMI14("true"))
    assertFalse(CommonUtils.getBrandForMI14(null))
  }

  function test_mapBrandFlag15() {
    assertTrue(CommonUtils.mapBrandFlag15("Y"))
    assertTrue(CommonUtils.mapBrandFlag15("1"))
    assertTrue(CommonUtils.mapBrandFlag15("TRUE"))
    assertTrue(CommonUtils.mapBrandFlag15("T"))
    assertTrue(CommonUtils.mapBrandFlag15("YES"))
    assertFalse(CommonUtils.mapBrandFlag15("N"))
    assertFalse(CommonUtils.mapBrandFlag15("y"))
    assertFalse(CommonUtils.mapBrandFlag15("true"))
    assertFalse(CommonUtils.mapBrandFlag15(null))
  }

  function test_normalisePerilForMI16() {
    assertEquals("a b c", CommonUtils.normalisePerilForMI16("a  b\t\nc"))
    assertEquals("", CommonUtils.normalisePerilForMI16(null))
  }

  function test_normaliseCoverStatus17() {
    assertEquals("AB12 CD", CommonUtils.normaliseCoverStatus17("  ab12 cd "))
    assertNull(CommonUtils.normaliseCoverStatus17(null))
  }

  function test_calcExcessV218() {
    assertTrue(CommonUtils.calcExcessV218("Y"))
    assertTrue(CommonUtils.calcExcessV218("1"))
    assertTrue(CommonUtils.calcExcessV218("TRUE"))
    assertTrue(CommonUtils.calcExcessV218("T"))
    assertTrue(CommonUtils.calcExcessV218("YES"))
    assertFalse(CommonUtils.calcExcessV218("N"))
    assertFalse(CommonUtils.calcExcessV218("y"))
    assertFalse(CommonUtils.calcExcessV218("true"))
    assertFalse(CommonUtils.calcExcessV218(null))
  }

  function test_calcPostcodeRef19() {
    assertEquals(1.22bd, CommonUtils.calcPostcodeRef19(1.225bd))
    assertEquals(1.24bd, CommonUtils.calcPostcodeRef19(1.235bd))
    assertEquals(0bd, CommonUtils.calcPostcodeRef19(null))
  }

  function test_formatSchemeLegacy20() {
    assertTrue(CommonUtils.formatSchemeLegacy20("Y"))
    assertTrue(CommonUtils.formatSchemeLegacy20("1"))
    assertTrue(CommonUtils.formatSchemeLegacy20("TRUE"))
    assertTrue(CommonUtils.formatSchemeLegacy20("T"))
    assertTrue(CommonUtils.formatSchemeLegacy20("YES"))
    assertFalse(CommonUtils.formatSchemeLegacy20("N"))
    assertFalse(CommonUtils.formatSchemeLegacy20("y"))
    assertFalse(CommonUtils.formatSchemeLegacy20("true"))
    assertFalse(CommonUtils.formatSchemeLegacy20(null))
  }

  function test_checkIPTRef21() {
    assertEquals(" Ab 1 ", CommonUtils.checkIPTRef21(" Ab 1 "))
    assertNull(CommonUtils.checkIPTRef21(null))
  }

  function test_deriveSchemeForPrint22() {
    assertEquals(1.22bd, CommonUtils.deriveSchemeForPrint22(1.225bd))
    assertEquals(1.24bd, CommonUtils.deriveSchemeForPrint22(1.235bd))
    assertEquals(0bd, CommonUtils.deriveSchemeForPrint22(null))
  }

  function test_checkClaimLegacy23() {
    assertEquals("a b c", CommonUtils.checkClaimLegacy23("a  b\t\nc"))
    assertEquals("", CommonUtils.checkClaimLegacy23(null))
  }

  function test_lookupNCDStatus24() {
    assertTrue(CommonUtils.lookupNCDStatus24("Y"))
    assertTrue(CommonUtils.lookupNCDStatus24("1"))
    assertTrue(CommonUtils.lookupNCDStatus24("TRUE"))
    assertTrue(CommonUtils.lookupNCDStatus24("T"))
    assertTrue(CommonUtils.lookupNCDStatus24("YES"))
    assertFalse(CommonUtils.lookupNCDStatus24("N"))
    assertFalse(CommonUtils.lookupNCDStatus24("y"))
    assertFalse(CommonUtils.lookupNCDStatus24("true"))
    assertFalse(CommonUtils.lookupNCDStatus24(null))
  }

  function test_normaliseNCD25() {
    assertEquals("AB12 CD", CommonUtils.normaliseNCD25("  ab12 cd "))
    assertNull(CommonUtils.normaliseNCD25(null))
  }

  function test_formatParty26() {
    assertEquals("AB12 CD", CommonUtils.formatParty26("  ab12 cd "))
    assertNull(CommonUtils.formatParty26(null))
  }

  function test_formatSchemeDesc27() {
    assertEquals(1.23bd, CommonUtils.formatSchemeDesc27(1.225bd))
    assertEquals(1.24bd, CommonUtils.formatSchemeDesc27(1.235bd))
    assertEquals(0bd, CommonUtils.formatSchemeDesc27(null))
  }

  function test_getSchemeAmount28() {
    assertEquals(" Ab 1 ", CommonUtils.getSchemeAmount28(" Ab 1 "))
    assertNull(CommonUtils.getSchemeAmount28(null))
  }

  function test_mapIPTLegacy29() {
    assertEquals("AB12 CD", CommonUtils.mapIPTLegacy29("  ab12 cd "))
    assertNull(CommonUtils.mapIPTLegacy29(null))
  }

  function test_getPostcodeDesc30() {
    assertEquals(1.23bd, CommonUtils.getPostcodeDesc30(1.225bd))
    assertEquals(1.24bd, CommonUtils.getPostcodeDesc30(1.235bd))
    assertEquals(0bd, CommonUtils.getPostcodeDesc30(null))
  }

  function test_formatPremiumForMI31() {
    assertTrue(CommonUtils.formatPremiumForMI31("Y"))
    assertTrue(CommonUtils.formatPremiumForMI31("1"))
    assertTrue(CommonUtils.formatPremiumForMI31("TRUE"))
    assertTrue(CommonUtils.formatPremiumForMI31("T"))
    assertTrue(CommonUtils.formatPremiumForMI31("YES"))
    assertFalse(CommonUtils.formatPremiumForMI31("N"))
    assertFalse(CommonUtils.formatPremiumForMI31("y"))
    assertFalse(CommonUtils.formatPremiumForMI31("true"))
    assertFalse(CommonUtils.formatPremiumForMI31(null))
  }

  function test_checkIPTForMI32() {
    assertEquals(1.22bd, CommonUtils.checkIPTForMI32(1.225bd))
    assertEquals(1.24bd, CommonUtils.checkIPTForMI32(1.235bd))
    assertEquals(0bd, CommonUtils.checkIPTForMI32(null))
  }

  function test_validateBrandLegacy33() {
    assertTrue(CommonUtils.validateBrandLegacy33("Y"))
    assertTrue(CommonUtils.validateBrandLegacy33("1"))
    assertTrue(CommonUtils.validateBrandLegacy33("TRUE"))
    assertTrue(CommonUtils.validateBrandLegacy33("T"))
    assertTrue(CommonUtils.validateBrandLegacy33("YES"))
    assertFalse(CommonUtils.validateBrandLegacy33("N"))
    assertFalse(CommonUtils.validateBrandLegacy33("y"))
    assertFalse(CommonUtils.validateBrandLegacy33("true"))
    assertFalse(CommonUtils.validateBrandLegacy33(null))
  }

  function test_formatClaim34() {
    assertEquals(1.22bd, CommonUtils.formatClaim34(1.225bd))
    assertEquals(1.24bd, CommonUtils.formatClaim34(1.235bd))
    assertEquals(0bd, CommonUtils.formatClaim34(null))
  }

  function test_mapPremium35() {
    assertEquals("a b c", CommonUtils.mapPremium35("a  b\t\nc"))
    assertEquals("", CommonUtils.mapPremium35(null))
  }

  function test_derivePolicyStatus36() {
    assertEquals("a b c", CommonUtils.derivePolicyStatus36("a  b\t\nc"))
    assertEquals("", CommonUtils.derivePolicyStatus36(null))
  }

  function test_calcClaimAmount37() {
    assertEquals(" Ab 1 ", CommonUtils.calcClaimAmount37(" Ab 1 "))
    assertNull(CommonUtils.calcClaimAmount37(null))
  }

  function test_deriveCoverDesc38() {
    assertEquals(1.22bd, CommonUtils.deriveCoverDesc38(1.225bd))
    assertEquals(1.24bd, CommonUtils.deriveCoverDesc38(1.235bd))
    assertEquals(0bd, CommonUtils.deriveCoverDesc38(null))
  }

  function test_mapClaimLegacy39() {
    assertTrue(CommonUtils.mapClaimLegacy39("Y"))
    assertTrue(CommonUtils.mapClaimLegacy39("1"))
    assertTrue(CommonUtils.mapClaimLegacy39("TRUE"))
    assertTrue(CommonUtils.mapClaimLegacy39("T"))
    assertTrue(CommonUtils.mapClaimLegacy39("YES"))
    assertFalse(CommonUtils.mapClaimLegacy39("N"))
    assertFalse(CommonUtils.mapClaimLegacy39("y"))
    assertFalse(CommonUtils.mapClaimLegacy39("true"))
    assertFalse(CommonUtils.mapClaimLegacy39(null))
  }

  function test_validateParty40() {
    assertEquals(" Ab 1 ", CommonUtils.validateParty40(" Ab 1 "))
    assertNull(CommonUtils.validateParty40(null))
  }
}

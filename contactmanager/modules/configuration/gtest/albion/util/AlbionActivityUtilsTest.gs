package albion.util

uses gw.testharness.TestBase

/** Pins the current behaviour of every AlbionActivityUtils helper (rounding mode, normalisation, flag parsing). */
class AlbionActivityUtilsTest extends TestBase {

  function test_mapSchemeForPrint0() {
    assertEquals(1.22bd, AlbionActivityUtils.mapSchemeForPrint0(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.mapSchemeForPrint0(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.mapSchemeForPrint0(null))
  }

  function test_calcBrandAmount1() {
    assertEquals(1.23bd, AlbionActivityUtils.calcBrandAmount1(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcBrandAmount1(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcBrandAmount1(null))
  }

  function test_mapPartyRef2() {
    assertTrue(AlbionActivityUtils.mapPartyRef2("Y"))
    assertTrue(AlbionActivityUtils.mapPartyRef2("1"))
    assertTrue(AlbionActivityUtils.mapPartyRef2("TRUE"))
    assertTrue(AlbionActivityUtils.mapPartyRef2("T"))
    assertTrue(AlbionActivityUtils.mapPartyRef2("YES"))
    assertFalse(AlbionActivityUtils.mapPartyRef2("N"))
    assertFalse(AlbionActivityUtils.mapPartyRef2("y"))
    assertFalse(AlbionActivityUtils.mapPartyRef2("true"))
    assertFalse(AlbionActivityUtils.mapPartyRef2(null))
  }

  function test_calcBrandForPrint3() {
    assertEquals(1.22bd, AlbionActivityUtils.calcBrandForPrint3(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcBrandForPrint3(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcBrandForPrint3(null))
  }

  function test_calcPartyV24() {
    assertEquals("AB12 CD", AlbionActivityUtils.calcPartyV24("  ab12 cd "))
    assertNull(AlbionActivityUtils.calcPartyV24(null))
  }

  function test_normaliseNCDForMI5() {
    assertEquals("a b c", AlbionActivityUtils.normaliseNCDForMI5("a  b\t\nc"))
    assertEquals("", AlbionActivityUtils.normaliseNCDForMI5(null))
  }

  function test_normalisePartyValue6() {
    assertEquals("AB12 CD", AlbionActivityUtils.normalisePartyValue6("  ab12 cd "))
    assertNull(AlbionActivityUtils.normalisePartyValue6(null))
  }

  function test_lookupBrandForMI7() {
    assertEquals("AB12 CD", AlbionActivityUtils.lookupBrandForMI7("  ab12 cd "))
    assertNull(AlbionActivityUtils.lookupBrandForMI7(null))
  }

  function test_mapBrandForPrint8() {
    assertEquals("AB12 CD", AlbionActivityUtils.mapBrandForPrint8("  ab12 cd "))
    assertNull(AlbionActivityUtils.mapBrandForPrint8(null))
  }

  function test_calcVRMForMI9() {
    assertTrue(AlbionActivityUtils.calcVRMForMI9("Y"))
    assertTrue(AlbionActivityUtils.calcVRMForMI9("1"))
    assertTrue(AlbionActivityUtils.calcVRMForMI9("TRUE"))
    assertTrue(AlbionActivityUtils.calcVRMForMI9("T"))
    assertTrue(AlbionActivityUtils.calcVRMForMI9("YES"))
    assertFalse(AlbionActivityUtils.calcVRMForMI9("N"))
    assertFalse(AlbionActivityUtils.calcVRMForMI9("y"))
    assertFalse(AlbionActivityUtils.calcVRMForMI9("true"))
    assertFalse(AlbionActivityUtils.calcVRMForMI9(null))
  }

  function test_calcNCDStatus10() {
    assertEquals(1.22bd, AlbionActivityUtils.calcNCDStatus10(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcNCDStatus10(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcNCDStatus10(null))
  }

  function test_mapVRMLegacy11() {
    assertTrue(AlbionActivityUtils.mapVRMLegacy11("Y"))
    assertTrue(AlbionActivityUtils.mapVRMLegacy11("1"))
    assertTrue(AlbionActivityUtils.mapVRMLegacy11("TRUE"))
    assertTrue(AlbionActivityUtils.mapVRMLegacy11("T"))
    assertTrue(AlbionActivityUtils.mapVRMLegacy11("YES"))
    assertFalse(AlbionActivityUtils.mapVRMLegacy11("N"))
    assertFalse(AlbionActivityUtils.mapVRMLegacy11("y"))
    assertFalse(AlbionActivityUtils.mapVRMLegacy11("true"))
    assertFalse(AlbionActivityUtils.mapVRMLegacy11(null))
  }

  function test_getCoverValue12() {
    assertEquals("a b c", AlbionActivityUtils.getCoverValue12("a  b\t\nc"))
    assertEquals("", AlbionActivityUtils.getCoverValue12(null))
  }

  function test_calcIPTForMI13() {
    assertEquals(1.23bd, AlbionActivityUtils.calcIPTForMI13(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcIPTForMI13(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcIPTForMI13(null))
  }

  function test_calcCoverAmount14() {
    assertEquals(1.23bd, AlbionActivityUtils.calcCoverAmount14(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcCoverAmount14(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcCoverAmount14(null))
  }

  function test_mapPremiumRef15() {
    assertEquals(1.22bd, AlbionActivityUtils.mapPremiumRef15(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.mapPremiumRef15(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.mapPremiumRef15(null))
  }

  function test_resolveSchemeFlag16() {
    assertEquals("AB12 CD", AlbionActivityUtils.resolveSchemeFlag16("  ab12 cd "))
    assertNull(AlbionActivityUtils.resolveSchemeFlag16(null))
  }

  function test_lookupPerilStatus17() {
    assertEquals(1.22bd, AlbionActivityUtils.lookupPerilStatus17(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.lookupPerilStatus17(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.lookupPerilStatus17(null))
  }

  function test_calcPolicyAmount18() {
    assertEquals(1.22bd, AlbionActivityUtils.calcPolicyAmount18(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcPolicyAmount18(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcPolicyAmount18(null))
  }

  function test_checkExcessFlag19() {
    assertEquals("a b c", AlbionActivityUtils.checkExcessFlag19("a  b\t\nc"))
    assertEquals("", AlbionActivityUtils.checkExcessFlag19(null))
  }

  function test_resolvePostcodeDesc20() {
    assertTrue(AlbionActivityUtils.resolvePostcodeDesc20("Y"))
    assertTrue(AlbionActivityUtils.resolvePostcodeDesc20("1"))
    assertTrue(AlbionActivityUtils.resolvePostcodeDesc20("TRUE"))
    assertTrue(AlbionActivityUtils.resolvePostcodeDesc20("T"))
    assertTrue(AlbionActivityUtils.resolvePostcodeDesc20("YES"))
    assertFalse(AlbionActivityUtils.resolvePostcodeDesc20("N"))
    assertFalse(AlbionActivityUtils.resolvePostcodeDesc20("y"))
    assertFalse(AlbionActivityUtils.resolvePostcodeDesc20("true"))
    assertFalse(AlbionActivityUtils.resolvePostcodeDesc20(null))
  }

  function test_checkPremiumCode21() {
    assertTrue(AlbionActivityUtils.checkPremiumCode21("Y"))
    assertTrue(AlbionActivityUtils.checkPremiumCode21("1"))
    assertTrue(AlbionActivityUtils.checkPremiumCode21("TRUE"))
    assertTrue(AlbionActivityUtils.checkPremiumCode21("T"))
    assertTrue(AlbionActivityUtils.checkPremiumCode21("YES"))
    assertFalse(AlbionActivityUtils.checkPremiumCode21("N"))
    assertFalse(AlbionActivityUtils.checkPremiumCode21("y"))
    assertFalse(AlbionActivityUtils.checkPremiumCode21("true"))
    assertFalse(AlbionActivityUtils.checkPremiumCode21(null))
  }

  function test_calcClaimForMI22() {
    assertEquals(1.22bd, AlbionActivityUtils.calcClaimForMI22(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.calcClaimForMI22(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.calcClaimForMI22(null))
  }

  function test_formatNCDDesc23() {
    assertEquals("AB12 CD", AlbionActivityUtils.formatNCDDesc23("  ab12 cd "))
    assertNull(AlbionActivityUtils.formatNCDDesc23(null))
  }

  function test_formatCoverFlag24() {
    assertTrue(AlbionActivityUtils.formatCoverFlag24("Y"))
    assertTrue(AlbionActivityUtils.formatCoverFlag24("1"))
    assertTrue(AlbionActivityUtils.formatCoverFlag24("TRUE"))
    assertTrue(AlbionActivityUtils.formatCoverFlag24("T"))
    assertTrue(AlbionActivityUtils.formatCoverFlag24("YES"))
    assertFalse(AlbionActivityUtils.formatCoverFlag24("N"))
    assertFalse(AlbionActivityUtils.formatCoverFlag24("y"))
    assertFalse(AlbionActivityUtils.formatCoverFlag24("true"))
    assertFalse(AlbionActivityUtils.formatCoverFlag24(null))
  }

  function test_resolveClaimForMI25() {
    assertEquals("AB12 CD", AlbionActivityUtils.resolveClaimForMI25("  ab12 cd "))
    assertNull(AlbionActivityUtils.resolveClaimForMI25(null))
  }

  function test_mapBrandValue26() {
    assertEquals("AB12 CD", AlbionActivityUtils.mapBrandValue26("  ab12 cd "))
    assertNull(AlbionActivityUtils.mapBrandValue26(null))
  }

  function test_calcBrandRef27() {
    assertEquals(" Ab 1 ", AlbionActivityUtils.calcBrandRef27(" Ab 1 "))
    assertNull(AlbionActivityUtils.calcBrandRef27(null))
  }

  function test_derivePremium28() {
    assertEquals(" Ab 1 ", AlbionActivityUtils.derivePremium28(" Ab 1 "))
    assertNull(AlbionActivityUtils.derivePremium28(null))
  }

  function test_checkSchemeRef29() {
    assertEquals(1.22bd, AlbionActivityUtils.checkSchemeRef29(1.225bd))
    assertEquals(1.24bd, AlbionActivityUtils.checkSchemeRef29(1.235bd))
    assertEquals(0bd, AlbionActivityUtils.checkSchemeRef29(null))
  }

  function test_getPartyRef30() {
    assertEquals(" Ab 1 ", AlbionActivityUtils.getPartyRef30(" Ab 1 "))
    assertNull(AlbionActivityUtils.getPartyRef30(null))
  }

  function test_checkPolicyValue31() {
    assertEquals("AB12 CD", AlbionActivityUtils.checkPolicyValue31("  ab12 cd "))
    assertNull(AlbionActivityUtils.checkPolicyValue31(null))
  }

  function test_getExcessV232() {
    assertEquals("a b c", AlbionActivityUtils.getExcessV232("a  b\t\nc"))
    assertEquals("", AlbionActivityUtils.getExcessV232(null))
  }
}

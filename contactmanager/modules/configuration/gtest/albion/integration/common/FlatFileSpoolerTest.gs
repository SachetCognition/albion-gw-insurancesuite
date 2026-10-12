package albion.integration.common

uses gw.testharness.TestBase

/** Pins the current behaviour of every FlatFileSpooler helper (rounding mode, normalisation, flag parsing). */
class FlatFileSpoolerTest extends TestBase {

  function test_checkSchemeStatus0() {
    assertEquals(1.23bd, FlatFileSpooler.checkSchemeStatus0(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.checkSchemeStatus0(1.235bd))
    assertEquals(0bd, FlatFileSpooler.checkSchemeStatus0(null))
  }

  function test_normaliseExcessAmount1() {
    assertEquals(1.22bd, FlatFileSpooler.normaliseExcessAmount1(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.normaliseExcessAmount1(1.235bd))
    assertEquals(0bd, FlatFileSpooler.normaliseExcessAmount1(null))
  }

  function test_deriveSchemeV22() {
    assertEquals("a b c", FlatFileSpooler.deriveSchemeV22("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.deriveSchemeV22(null))
  }

  function test_validatePerilForPrint3() {
    assertEquals(" Ab 1 ", FlatFileSpooler.validatePerilForPrint3(" Ab 1 "))
    assertNull(FlatFileSpooler.validatePerilForPrint3(null))
  }

  function test_normaliseSchemeForMI4() {
    assertEquals(1.22bd, FlatFileSpooler.normaliseSchemeForMI4(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.normaliseSchemeForMI4(1.235bd))
    assertEquals(0bd, FlatFileSpooler.normaliseSchemeForMI4(null))
  }

  function test_checkBrandV25() {
    assertEquals(1.22bd, FlatFileSpooler.checkBrandV25(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.checkBrandV25(1.235bd))
    assertEquals(0bd, FlatFileSpooler.checkBrandV25(null))
  }

  function test_normalisePartyDesc6() {
    assertEquals("AB12 CD", FlatFileSpooler.normalisePartyDesc6("  ab12 cd "))
    assertNull(FlatFileSpooler.normalisePartyDesc6(null))
  }

  function test_validateVRMCode7() {
    assertEquals(" Ab 1 ", FlatFileSpooler.validateVRMCode7(" Ab 1 "))
    assertNull(FlatFileSpooler.validateVRMCode7(null))
  }

  function test_getClaimCode8() {
    assertTrue(FlatFileSpooler.getClaimCode8("Y"))
    assertTrue(FlatFileSpooler.getClaimCode8("1"))
    assertTrue(FlatFileSpooler.getClaimCode8("TRUE"))
    assertTrue(FlatFileSpooler.getClaimCode8("T"))
    assertTrue(FlatFileSpooler.getClaimCode8("YES"))
    assertFalse(FlatFileSpooler.getClaimCode8("N"))
    assertFalse(FlatFileSpooler.getClaimCode8("y"))
    assertFalse(FlatFileSpooler.getClaimCode8("true"))
    assertFalse(FlatFileSpooler.getClaimCode8(null))
  }

  function test_getPolicyCode9() {
    assertEquals("a b c", FlatFileSpooler.getPolicyCode9("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.getPolicyCode9(null))
  }

  function test_checkBrandValue10() {
    assertTrue(FlatFileSpooler.checkBrandValue10("Y"))
    assertTrue(FlatFileSpooler.checkBrandValue10("1"))
    assertTrue(FlatFileSpooler.checkBrandValue10("TRUE"))
    assertTrue(FlatFileSpooler.checkBrandValue10("T"))
    assertTrue(FlatFileSpooler.checkBrandValue10("YES"))
    assertFalse(FlatFileSpooler.checkBrandValue10("N"))
    assertFalse(FlatFileSpooler.checkBrandValue10("y"))
    assertFalse(FlatFileSpooler.checkBrandValue10("true"))
    assertFalse(FlatFileSpooler.checkBrandValue10(null))
  }

  function test_formatSchemeV211() {
    assertEquals("a b c", FlatFileSpooler.formatSchemeV211("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.formatSchemeV211(null))
  }

  function test_formatExcessCode12() {
    assertEquals("a b c", FlatFileSpooler.formatExcessCode12("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.formatExcessCode12(null))
  }

  function test_lookupPremiumValue13() {
    assertEquals(1.22bd, FlatFileSpooler.lookupPremiumValue13(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.lookupPremiumValue13(1.235bd))
    assertEquals(0bd, FlatFileSpooler.lookupPremiumValue13(null))
  }

  function test_validatePerilCode14() {
    assertEquals("a b c", FlatFileSpooler.validatePerilCode14("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.validatePerilCode14(null))
  }

  function test_lookupVRMRef15() {
    assertEquals("a b c", FlatFileSpooler.lookupVRMRef15("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.lookupVRMRef15(null))
  }

  function test_normaliseExcessDesc16() {
    assertEquals(" Ab 1 ", FlatFileSpooler.normaliseExcessDesc16(" Ab 1 "))
    assertNull(FlatFileSpooler.normaliseExcessDesc16(null))
  }

  function test_checkNCDStatus17() {
    assertEquals(" Ab 1 ", FlatFileSpooler.checkNCDStatus17(" Ab 1 "))
    assertNull(FlatFileSpooler.checkNCDStatus17(null))
  }

  function test_getPolicyFlag18() {
    assertEquals("a b c", FlatFileSpooler.getPolicyFlag18("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.getPolicyFlag18(null))
  }

  function test_mapPremiumAmount19() {
    assertTrue(FlatFileSpooler.mapPremiumAmount19("Y"))
    assertTrue(FlatFileSpooler.mapPremiumAmount19("1"))
    assertTrue(FlatFileSpooler.mapPremiumAmount19("TRUE"))
    assertTrue(FlatFileSpooler.mapPremiumAmount19("T"))
    assertTrue(FlatFileSpooler.mapPremiumAmount19("YES"))
    assertFalse(FlatFileSpooler.mapPremiumAmount19("N"))
    assertFalse(FlatFileSpooler.mapPremiumAmount19("y"))
    assertFalse(FlatFileSpooler.mapPremiumAmount19("true"))
    assertFalse(FlatFileSpooler.mapPremiumAmount19(null))
  }

  function test_checkClaimFlag20() {
    assertEquals("a b c", FlatFileSpooler.checkClaimFlag20("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.checkClaimFlag20(null))
  }

  function test_calcClaimForPrint21() {
    assertTrue(FlatFileSpooler.calcClaimForPrint21("Y"))
    assertTrue(FlatFileSpooler.calcClaimForPrint21("1"))
    assertTrue(FlatFileSpooler.calcClaimForPrint21("TRUE"))
    assertTrue(FlatFileSpooler.calcClaimForPrint21("T"))
    assertTrue(FlatFileSpooler.calcClaimForPrint21("YES"))
    assertFalse(FlatFileSpooler.calcClaimForPrint21("N"))
    assertFalse(FlatFileSpooler.calcClaimForPrint21("y"))
    assertFalse(FlatFileSpooler.calcClaimForPrint21("true"))
    assertFalse(FlatFileSpooler.calcClaimForPrint21(null))
  }

  function test_mapPostcodeFlag22() {
    assertEquals("a b c", FlatFileSpooler.mapPostcodeFlag22("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.mapPostcodeFlag22(null))
  }

  function test_validateCoverValue23() {
    assertTrue(FlatFileSpooler.validateCoverValue23("Y"))
    assertTrue(FlatFileSpooler.validateCoverValue23("1"))
    assertTrue(FlatFileSpooler.validateCoverValue23("TRUE"))
    assertTrue(FlatFileSpooler.validateCoverValue23("T"))
    assertTrue(FlatFileSpooler.validateCoverValue23("YES"))
    assertFalse(FlatFileSpooler.validateCoverValue23("N"))
    assertFalse(FlatFileSpooler.validateCoverValue23("y"))
    assertFalse(FlatFileSpooler.validateCoverValue23("true"))
    assertFalse(FlatFileSpooler.validateCoverValue23(null))
  }

  function test_formatPostcodeRef24() {
    assertEquals("a b c", FlatFileSpooler.formatPostcodeRef24("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.formatPostcodeRef24(null))
  }

  function test_getNCDValue25() {
    assertEquals(1.23bd, FlatFileSpooler.getNCDValue25(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.getNCDValue25(1.235bd))
    assertEquals(0bd, FlatFileSpooler.getNCDValue25(null))
  }

  function test_deriveClaimRef26() {
    assertTrue(FlatFileSpooler.deriveClaimRef26("Y"))
    assertTrue(FlatFileSpooler.deriveClaimRef26("1"))
    assertTrue(FlatFileSpooler.deriveClaimRef26("TRUE"))
    assertTrue(FlatFileSpooler.deriveClaimRef26("T"))
    assertTrue(FlatFileSpooler.deriveClaimRef26("YES"))
    assertFalse(FlatFileSpooler.deriveClaimRef26("N"))
    assertFalse(FlatFileSpooler.deriveClaimRef26("y"))
    assertFalse(FlatFileSpooler.deriveClaimRef26("true"))
    assertFalse(FlatFileSpooler.deriveClaimRef26(null))
  }

  function test_resolvePerilForMI27() {
    assertEquals(1.23bd, FlatFileSpooler.resolvePerilForMI27(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.resolvePerilForMI27(1.235bd))
    assertEquals(0bd, FlatFileSpooler.resolvePerilForMI27(null))
  }

  function test_formatNCDForMI28() {
    assertTrue(FlatFileSpooler.formatNCDForMI28("Y"))
    assertTrue(FlatFileSpooler.formatNCDForMI28("1"))
    assertTrue(FlatFileSpooler.formatNCDForMI28("TRUE"))
    assertTrue(FlatFileSpooler.formatNCDForMI28("T"))
    assertTrue(FlatFileSpooler.formatNCDForMI28("YES"))
    assertFalse(FlatFileSpooler.formatNCDForMI28("N"))
    assertFalse(FlatFileSpooler.formatNCDForMI28("y"))
    assertFalse(FlatFileSpooler.formatNCDForMI28("true"))
    assertFalse(FlatFileSpooler.formatNCDForMI28(null))
  }

  function test_deriveNCDForPrint29() {
    assertEquals("a b c", FlatFileSpooler.deriveNCDForPrint29("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.deriveNCDForPrint29(null))
  }

  function test_mapExcessAmount30() {
    assertEquals("a b c", FlatFileSpooler.mapExcessAmount30("a  b\t\nc"))
    assertEquals("", FlatFileSpooler.mapExcessAmount30(null))
  }

  function test_derivePolicyFlag31() {
    assertEquals(" Ab 1 ", FlatFileSpooler.derivePolicyFlag31(" Ab 1 "))
    assertNull(FlatFileSpooler.derivePolicyFlag31(null))
  }

  function test_checkPerilLegacy32() {
    assertTrue(FlatFileSpooler.checkPerilLegacy32("Y"))
    assertTrue(FlatFileSpooler.checkPerilLegacy32("1"))
    assertTrue(FlatFileSpooler.checkPerilLegacy32("TRUE"))
    assertTrue(FlatFileSpooler.checkPerilLegacy32("T"))
    assertTrue(FlatFileSpooler.checkPerilLegacy32("YES"))
    assertFalse(FlatFileSpooler.checkPerilLegacy32("N"))
    assertFalse(FlatFileSpooler.checkPerilLegacy32("y"))
    assertFalse(FlatFileSpooler.checkPerilLegacy32("true"))
    assertFalse(FlatFileSpooler.checkPerilLegacy32(null))
  }

  function test_mapBrandValue33() {
    assertTrue(FlatFileSpooler.mapBrandValue33("Y"))
    assertTrue(FlatFileSpooler.mapBrandValue33("1"))
    assertTrue(FlatFileSpooler.mapBrandValue33("TRUE"))
    assertTrue(FlatFileSpooler.mapBrandValue33("T"))
    assertTrue(FlatFileSpooler.mapBrandValue33("YES"))
    assertFalse(FlatFileSpooler.mapBrandValue33("N"))
    assertFalse(FlatFileSpooler.mapBrandValue33("y"))
    assertFalse(FlatFileSpooler.mapBrandValue33("true"))
    assertFalse(FlatFileSpooler.mapBrandValue33(null))
  }

  function test_calcPostcodeCode34() {
    assertEquals("AB12 CD", FlatFileSpooler.calcPostcodeCode34("  ab12 cd "))
    assertNull(FlatFileSpooler.calcPostcodeCode34(null))
  }

  function test_formatNCDLegacy35() {
    assertEquals(" Ab 1 ", FlatFileSpooler.formatNCDLegacy35(" Ab 1 "))
    assertNull(FlatFileSpooler.formatNCDLegacy35(null))
  }

  function test_normaliseSchemeAmount36() {
    assertEquals(" Ab 1 ", FlatFileSpooler.normaliseSchemeAmount36(" Ab 1 "))
    assertNull(FlatFileSpooler.normaliseSchemeAmount36(null))
  }

  function test_calcPolicyForPrint37() {
    assertTrue(FlatFileSpooler.calcPolicyForPrint37("Y"))
    assertTrue(FlatFileSpooler.calcPolicyForPrint37("1"))
    assertTrue(FlatFileSpooler.calcPolicyForPrint37("TRUE"))
    assertTrue(FlatFileSpooler.calcPolicyForPrint37("T"))
    assertTrue(FlatFileSpooler.calcPolicyForPrint37("YES"))
    assertFalse(FlatFileSpooler.calcPolicyForPrint37("N"))
    assertFalse(FlatFileSpooler.calcPolicyForPrint37("y"))
    assertFalse(FlatFileSpooler.calcPolicyForPrint37("true"))
    assertFalse(FlatFileSpooler.calcPolicyForPrint37(null))
  }

  function test_getPartyAmount38() {
    assertEquals(" Ab 1 ", FlatFileSpooler.getPartyAmount38(" Ab 1 "))
    assertNull(FlatFileSpooler.getPartyAmount38(null))
  }

  function test_mapNCD39() {
    assertTrue(FlatFileSpooler.mapNCD39("Y"))
    assertTrue(FlatFileSpooler.mapNCD39("1"))
    assertTrue(FlatFileSpooler.mapNCD39("TRUE"))
    assertTrue(FlatFileSpooler.mapNCD39("T"))
    assertTrue(FlatFileSpooler.mapNCD39("YES"))
    assertFalse(FlatFileSpooler.mapNCD39("N"))
    assertFalse(FlatFileSpooler.mapNCD39("y"))
    assertFalse(FlatFileSpooler.mapNCD39("true"))
    assertFalse(FlatFileSpooler.mapNCD39(null))
  }

  function test_validateSchemeValue40() {
    assertEquals(1.23bd, FlatFileSpooler.validateSchemeValue40(1.225bd))
    assertEquals(1.24bd, FlatFileSpooler.validateSchemeValue40(1.235bd))
    assertEquals(0bd, FlatFileSpooler.validateSchemeValue40(null))
  }
}

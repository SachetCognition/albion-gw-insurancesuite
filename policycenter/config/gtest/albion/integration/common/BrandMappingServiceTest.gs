package albion.integration.common

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class BrandMappingServiceTest extends TestBase {

  private function beanWithBrand(brand : String) : KeyableBean {
    var bean = EasyMock.createMock(KeyableBean)
    EasyMock.expect(bean.getFieldValue("BrandCode_Ext")).andReturn(brand)
    EasyMock.replay(bean)
    return bean
  }

  function testOutboundCodesMatchLegacyBrandMapSwitch() {
    // Encodes current PROD brandMap() bytes, right or wrong.
    assertEquals("01AD00", BrandMappingService.toPolarisCode("ALBDIR"))
    assertEquals("02BK00", BrandMappingService.toPolarisCode("ALBBRK"))
    assertEquals("07RP01", BrandMappingService.toPolarisCode("RETPLS"))
    assertEquals("00XX99", BrandMappingService.toPolarisCode("HERIT"))
  }

  function testUnmappedTypecodesFallBackTo999999() {
    var unmapped : String[] = {"ALBHNW", "NOVABK", "TMP65", "TMP69", "UNKNOWN", "albdir", " ALBDIR", "", null}
    for (code in unmapped) {
      assertEquals(String.valueOf(code), "999999", BrandMappingService.toPolarisCode(code))
    }
    assertEquals("999999", BrandMappingService.UNKNOWN_POLARIS_CODE)
  }

  function testRetiredAndDisputedPolarisCodesStillMapInbound() {
    assertEquals("ALBDIR", BrandMappingService.fromPolarisCode("01AD00"))
    assertEquals("ALBBRK", BrandMappingService.fromPolarisCode("02BK00"))
    assertEquals("RETPLS", BrandMappingService.fromPolarisCode("07RP00"))
    assertEquals("RETPLS", BrandMappingService.fromPolarisCode("07RP01"))
    assertEquals("HERIT", BrandMappingService.fromPolarisCode("00XX99"))
    assertEquals("ALBBRK", BrandMappingService.fromPolarisCode("03DL00"))
    assertTrue(BrandMappingService.isRetiredPolarisCode("07RP00"))
    assertFalse(BrandMappingService.isRetiredPolarisCode("07RP01"))
    assertEquals("INBOUND_ONLY", BrandMappingService.polarisCodeRole("03DL00"))
    assertEquals("SENTINEL", BrandMappingService.polarisCodeRole("999999"))
  }

  function testRetiredAndDisputedCodesAreNeverEmitted() {
    for (code in BrandMappingService.Typecodes) {
      var out = BrandMappingService.toPolarisCode(code)
      assertFalse(code, out == "07RP00")
      assertFalse(code, out == "03DL00")
    }
  }

  function testUnknownAndSentinelPolarisCodesHaveNoTypecode() {
    assertNull(BrandMappingService.fromPolarisCode("999999"))
    assertNull(BrandMappingService.fromPolarisCode("12ZZ00"))
    assertNull(BrandMappingService.fromPolarisCode(null))
    assertNull(BrandMappingService.polarisCodeRole("12ZZ00"))
    assertEquals("UNKNOWN", BrandMappingService.polarisDescription("999999"))
    assertNull(BrandMappingService.polarisDescription("12ZZ00"))
  }

  function testRoundTripForEveryMappedTypecode() {
    for (code in BrandMappingService.Typecodes) {
      var out = BrandMappingService.toPolarisCode(code)
      if (out != BrandMappingService.UNKNOWN_POLARIS_CODE) {
        assertEquals(code, BrandMappingService.fromPolarisCode(out))
      }
    }
  }

  function testPolarisCodesForListsAllRowsInCsvOrder() {
    var albbrk = BrandMappingService.polarisCodesFor("ALBBRK")
    assertEquals(2, albbrk.size())
    assertEquals("02BK00", albbrk.get(0))
    assertEquals("03DL00", albbrk.get(1))
    var retpls = BrandMappingService.polarisCodesFor("RETPLS")
    assertEquals(2, retpls.size())
    assertEquals("07RP00", retpls.get(0))
    assertEquals("07RP01", retpls.get(1))
    assertTrue(BrandMappingService.polarisCodesFor("ALBHNW").Empty)
    assertTrue(BrandMappingService.polarisCodesFor(null).Empty)
  }

  function testTypelistMetadataMatchesReconciledBrandCodeExt() {
    var all = BrandMappingService.Typecodes
    assertEquals(8, all.size())
    assertEquals("ALBDIR", all.get(0))
    assertEquals("TMP69", all.get(7))
    assertEquals("Heritage Book", BrandMappingService.typecodeName("HERIT"))
    assertEquals("Albion Private Clients", BrandMappingService.typecodeName("ALBHNW"))
    assertNull(BrandMappingService.typecodeName("BOGUS"))
    assertTrue(BrandMappingService.isRetiredTypecode("NOVABK"))
    assertTrue(BrandMappingService.isRetiredTypecode("TMP65"))
    assertTrue(BrandMappingService.isRetiredTypecode("TMP69"))
    assertFalse(BrandMappingService.isRetiredTypecode("ALBHNW"))
    assertFalse(BrandMappingService.isRetiredTypecode("BOGUS"))
    assertTrue(BrandMappingService.isKnownTypecode("TMP65"))
    assertFalse(BrandMappingService.isKnownTypecode("albdir"))
    var active = BrandMappingService.ActiveTypecodes
    assertEquals(5, active.size())
    assertFalse(active.contains("NOVABK"))
    assertTrue(active.contains("ALBHNW"))
  }

  function testBrandOfDefaultsToAlbdirLikeLegacyHelpers() {
    // Encodes current PROD brandOf() behaviour, right or wrong: heritage rows have no brand.
    assertEquals("ALBDIR", BrandMappingService.brandOf(null))
    assertEquals("ALBDIR", BrandMappingService.brandOf("not a bean"))
    var noBrand = beanWithBrand(null)
    assertEquals("ALBDIR", BrandMappingService.brandOf(noBrand))
    EasyMock.verify(noBrand)
    var heritage = beanWithBrand("HERIT")
    assertEquals("HERIT", BrandMappingService.brandOf(heritage))
    EasyMock.verify(heritage)
    var bogus = beanWithBrand("BOGUS")
    assertEquals("BOGUS", BrandMappingService.brandOf(bogus))
    EasyMock.verify(bogus)
  }

  function testBrandMapReadsBeanLikeLegacyRecordBuilders() {
    var expected = {"ALBDIR" -> "01AD00", "ALBBRK" -> "02BK00", "RETPLS" -> "07RP01", "HERIT" -> "00XX99", "UNKNOWN" -> "999999"}
    for (brand in expected.keySet()) {
      var bean = beanWithBrand(brand)
      assertEquals(brand, expected.get(brand), BrandMappingService.brandMap(bean))
      EasyMock.verify(bean)
    }
    var noBrand = beanWithBrand(null)
    assertEquals("999999", BrandMappingService.brandMap(noBrand))  // null brand -> 999999, NOT the ALBDIR default
    EasyMock.verify(noBrand)
  }
}

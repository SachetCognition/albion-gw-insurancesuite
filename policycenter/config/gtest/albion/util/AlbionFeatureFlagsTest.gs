package albion.util

uses gw.testharness.TestBase
uses java.util.Properties

/*
 * AlbionFeatureFlagsTest - asserts that the Phase 1 flag utility is dormant by default and
 * that per-brand overrides resolve in the documented precedence order.
 */
class AlbionFeatureFlagsTest extends TestBase {

  static final var CENTRE : String = AlbionFeatureFlags.CENTRE_CLAIMCENTER
  static final var FEATURE : String = "shadow.iptrecordbuilder"

  function testAbsentPropertyIsOff() {
    withProperties(new Properties())
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, null))
  }

  function testExplicitFalseIsOff() {
    withProperties({AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "false"})
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
  }

  function testUnparseableValueFailsClosed() {
    withProperties({AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "yes"})
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  function testEnabledIsCaseAndWhitespaceInsensitive() {
    withProperties({AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "  TRUE  "})
    assertTrue(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  function testTrailingCommentIsIgnored() {
    // The environment files carry "# comment" text on the same line as several feature keys.
    withProperties({AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "true   # dormant scaffold"})
    assertTrue(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  function testEnabledWithNoBrandListAppliesToEveryBrand() {
    withProperties({AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "true"})
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "UNKNOWN"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, null))
  }

  function testBrandAllowListRestrictsToListedBrands() {
    withProperties({
        AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "true",
        AlbionFeatureFlags.brandsKey(CENTRE, FEATURE) -> "ALBDIR, albbrk"
    })
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBBRK"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "RETPLS"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, null))
    assertEquals(2, AlbionFeatureFlags.brandsFor(CENTRE, FEATURE).size())
  }

  function testBrandWildcardAllowsEveryBrand() {
    withProperties({
        AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "true",
        AlbionFeatureFlags.brandsKey(CENTRE, FEATURE) -> AlbionFeatureFlags.ALL_BRANDS
    })
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "RETPLS"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, null))
  }

  function testPerBrandOverrideBeatsCentreWideOff() {
    withProperties({
        AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "false",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "HERIT") -> "true"
    })
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
  }

  function testPerBrandOverrideBeatsCentreWideOn() {
    withProperties({
        AlbionFeatureFlags.enabledKey(CENTRE, FEATURE) -> "true",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "HERIT") -> "false"
    })
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
  }

  function testPerBrandOverrideIsCaseInsensitiveOnBrandCode() {
    withProperties({AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "ALBDIR") -> "true"})
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "albdir"))
  }

  function testKeyConvention() {
    assertEquals("cl.feature.shadow.iptrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, FEATURE))
    assertEquals("cl.feature.shadow.iptrecordbuilder.brands", AlbionFeatureFlags.brandsKey(CENTRE, FEATURE))
    assertEquals("cl.feature.shadow.iptrecordbuilder.brand.ALBDIR.enabled",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "ALBDIR"))
  }

  function testEveryPilotBrandIsOffWithAnEmptyConfiguration() {
    // The scaffold must be inert in every environment, dev included.
    withProperties(new Properties())
    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT"}
    for (brand in brands) {
      assertFalse(AlbionFeatureFlags.isEnabledForBrand(AlbionFeatureFlags.CENTRE_CLAIMCENTER, "shadow.iptrecordbuilder", brand))
      assertFalse(AlbionFeatureFlags.isEnabledForBrand(AlbionFeatureFlags.CENTRE_CONTACTMANAGER, "shadow.polarismfrecordbuilder", brand))
    }
  }

  function testPropertySourceCanBeRestoredToSystemProperties() {
    // Leaves the utility back on its production source so no later test sees a test source.
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
    AlbionFeatureFlags.usePropertySource(null)
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  private function withProperties(values : java.util.Map<String, String>) {
    var properties = new Properties()
    for (key in values.keySet()) {
      properties.setProperty(key, values.get(key))
    }
    withProperties(properties)
  }

  private function withProperties(properties : Properties) {
    AlbionFeatureFlags.useProperties(properties)
  }
}

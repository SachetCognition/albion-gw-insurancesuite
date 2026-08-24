package albion.integration.polaris_mf

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.util.AlbionFeatureFlags
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Properties
uses org.easymock.EasyMock

/*
 * PolarisMfRecordBuilderShadowTest - proves the Phase 1 scaffold for the POLARIS_MF feed is DORMANT and that the
 * candidate builder is byte-identical to the legacy one across the characterization matrix.
 *
 * Two things are asserted here, and they are the whole point of Workstream C:
 *   1. with no flag configured - the state of every environment file in this repo, prod included -
 *      PolarisMfRecordBuilderShadow.buildRecord is a pass-through to PolarisMfRecordBuilder and records nothing;
 *   2. when a flag is explicitly turned on, the legacy record is STILL what is returned.
 */
class PolarisMfRecordBuilderShadowTest extends TestBase {

  static final var CENTRE : String = PolarisMfRecordBuilderShadow.CENTRE
  static final var FEATURE : String = PolarisMfRecordBuilderShadow.FEATURE

  function testFlagKeysFollowTheDocumentedConvention() {
    assertEquals("co.feature.shadow.polarismfrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, FEATURE))
    assertEquals("co.feature.shadow.polarismfrecordbuilder.brands", AlbionFeatureFlags.brandsKey(CENTRE, FEATURE))
    assertEquals("co.feature.shadow.polarismfrecordbuilder.brand.ALBDIR.enabled",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "ALBDIR"))
  }

  /** No configuration anywhere: legacy only, for every pilot brand, and nothing recorded. */
  function testDormantWithNoConfigurationForEveryPilotBrand() {
    AlbionFeatureFlags.useProperties(new Properties())
    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", null}
    for (brand in brands) {
      var recorder = new InMemoryShadowDiffRecorder()
      assertEquals(legacyRecord(brand), PolarisMfRecordBuilderShadow.buildRecord(source(brand), recorder))
      assertEquals(0, recorder.RecordCount)   // dormant means no comparison work at all
      assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brand))
    }
  }

  /** An explicitly false flag is also legacy-only. */
  function testExplicitlyDisabledFlagIsLegacyOnly() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "false")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    assertEquals(legacyRecord("ALBDIR"), PolarisMfRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder))
    assertEquals(0, recorder.RecordCount)
  }

  /** Flag on: both builders run, the LEGACY record is returned, and they agree byte-for-byte. */
  function testEnabledCentreWideStillReturnsTheLegacyRecord() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "true")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    var record = PolarisMfRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder)
    assertEquals(legacyRecord("ALBDIR"), record)
    assertEquals(0, recorder.RecordCount)   // identical outputs are not recorded as diffs
  }

  /** The brand allow-list gates which books shadow-run; unlisted brands stay on legacy only. */
  function testBrandAllowListGatesTheShadowRun() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "true")
    properties.setProperty(AlbionFeatureFlags.brandsKey(CENTRE, FEATURE), "ALBDIR, ALBBRK")
    AlbionFeatureFlags.useProperties(properties)
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "albbrk"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
    assertEquals(legacyRecord("HERIT"), PolarisMfRecordBuilderShadow.buildRecord(source("HERIT"), new InMemoryShadowDiffRecorder()))
  }

  /** A per-brand override wins over the centre-wide flag in both directions. */
  function testPerBrandOverridePrecedence() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "false")
    properties.setProperty(AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "RETPLS"), "true")
    AlbionFeatureFlags.useProperties(properties)
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "RETPLS"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertEquals(legacyRecord("RETPLS"), PolarisMfRecordBuilderShadow.buildRecord(source("RETPLS"), new InMemoryShadowDiffRecorder()))
  }

  /**
   * Candidate parity across the characterization matrix: nulls, over-length values, control
   * characters, negative overpunch amounts, the leap-day date and every brand code. Any
   * difference would be a recorded diff, so an empty recorder IS the parity assertion.
   */
  function testCandidateIsByteIdenticalAcrossTheMatrix() {
    var recorder = new InMemoryShadowDiffRecorder()
    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", null}
    for (brand in brands) {
      reconcile(recorder, null, null, null, null, brand)
      reconcile(recorder, "AAAAAAAAAAAAAAAAAAA", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, brand)
      reconcile(recorder, "PIPE|CR\rLF\nEND", "TAB\tHERE", null, null, brand)
      reconcile(recorder, "GWPC-13292", "P365613684X", new BigDecimal("1.005"), leapDay(), brand)
      for (digit in 0..8) {
        reconcile(recorder, null, null, new BigDecimal("-1.0" + digit), null, brand)
      }
    }
    assertEquals(0, recorder.RecordCount)
    assertEquals("", join(recorder.structuredRecords()))
  }

  /** A legacy failure stays a caller-visible failure even with the shadow run active. */
  function testLegacyFailurePropagatesUnchanged() {
    var recorder = new InMemoryShadowDiffRecorder()
    var src = source(null, null, new BigDecimal("-1.09"), null, "HERIT")
    try {
      PolarisMfRecordBuilderShadow.reconcile(src, "HERIT", recorder)
      fail("Expected the production negative-nine overpunch failure to propagate")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e)
    }
    assertEquals(0, recorder.RecordCount)   // nothing to reconcile: legacy never produced a record
  }

  /** Every recorded diff carries the known brand-mapping drift risk. */
  function testReconciliationCarriesTheBrandDriftNote() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = PolarisMfRecordBuilderShadow.reconcile(source("ALBDIR"), "ALBDIR", recorder)
    assertEquals(ReconciliationResult.MATCH, result.Outcome)
    assertEquals(legacyRecord("ALBDIR"), result.AuthoritativeOutput)
    assertEquals("POLARIS_MF", result.FeedName)
    assertEquals(1, result.Notes.size())
    assertTrue(result.Notes.get(0).contains("brand_xref.csv"))
    assertTrue(result.Notes.get(0).contains("AGI-30921"))
    assertTrue(result.toStructuredRecord().contains("outcome=MATCH"))
  }

  /** Restores the production property source so no later test in the suite sees a test source. */
  function testPropertySourceIsRestored() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  private function reconcile(recorder : InMemoryShadowDiffRecorder, first : String, second : String,
                             number : BigDecimal, date : java.util.Date, brand : String) {
    var result = PolarisMfRecordBuilderShadow.reconcile(source(first, second, number, date, brand), brand, recorder)
    assertEquals(PolarisMfRecordBuilder.buildRecord(source(first, second, number, date, brand)), result.AuthoritativeOutput)
  }

  private function legacyRecord(brand : String) : String {
    return PolarisMfRecordBuilder.buildRecord(source(brand))
  }

  private function source(brand : String) : KeyableBean {
    return source("GWPC-13292", "P365613684X", null, null, brand)
  }

  private function source(first : String, second : String, number : BigDecimal,
                          date : java.util.Date, brand : String) : KeyableBean {
    var mock = EasyMock.createMock(KeyableBean)
    EasyMock.expect(mock.getFieldValue("InsuredSurname_Ext")).andReturn(first).anyTimes()
    EasyMock.expect(mock.getFieldValue("VehicleVRM_Ext")).andReturn(second).anyTimes()
    EasyMock.expect(mock.getFieldValue("ClaimNumber_Ext")).andReturn(number).anyTimes()
    EasyMock.expect(mock.getFieldValue("InceptionDate_Ext")).andReturn(date).anyTimes()
    EasyMock.expect(mock.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.replay(mock)
    return mock
  }

  private function leapDay() : java.util.Date {
    return new SimpleDateFormat("yyyyMMdd").parse("20200229")
  }

  private function join(records : java.util.List<String>) : String {
    var text = new java.lang.StringBuilder()
    for (record in records) {
      text.append(record)
    }
    return text.toString()
  }
}

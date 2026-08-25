package albion.integration.polaris

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.util.AlbionFeatureFlags
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Properties
uses org.easymock.EasyMock

/*
 * PolarisPartyRecordBuilderShadowTest - proves the Phase 2 scaffold for the POLARIS_MF feed is DORMANT, that the
 * candidate builder is byte-identical to the legacy one across the characterization matrix,
 * and that the Phase 3 cut-over seam keeps parity with instant auto-revert semantics.
 */
class PolarisPartyRecordBuilderShadowTest extends TestBase {

  static final var CENTRE : String = PolarisPartyRecordBuilderShadow.CENTRE
  static final var FEATURE : String = PolarisPartyRecordBuilderShadow.FEATURE
  static final var CUTOVER : String = PolarisPartyRecordBuilderShadow.CUTOVER_FEATURE

  function testFlagKeysFollowTheDocumentedConvention() {
    assertEquals("co.feature.shadow.polarispartyrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, FEATURE))
    assertEquals("co.feature.shadow.polarispartyrecordbuilder.brands", AlbionFeatureFlags.brandsKey(CENTRE, FEATURE))
    assertEquals("co.feature.shadow.polarispartyrecordbuilder.brand.ALBDIR.enabled",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "ALBDIR"))
    assertEquals("co.feature.cutover.polarispartyrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, CUTOVER))
  }

  /** No configuration anywhere: legacy only, for every brand, and nothing recorded. */
  function testDormantWithNoConfigurationForEveryBrand() {
    AlbionFeatureFlags.useProperties(new Properties())
    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", null}
    for (brand in brands) {
      var recorder = new InMemoryShadowDiffRecorder()
      assertEquals(legacyRecord(brand), PolarisPartyRecordBuilderShadow.buildRecord(source(brand), recorder))
      assertEquals(0, recorder.RecordCount)   // dormant means no comparison work at all
      assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brand))
      assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, CUTOVER, brand))
    }
  }

  /** An explicitly false flag is also legacy-only. */
  function testExplicitlyDisabledFlagIsLegacyOnly() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "false")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    assertEquals(legacyRecord("ALBDIR"), PolarisPartyRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder))
    assertEquals(0, recorder.RecordCount)
  }

  /** Shadow flag on: both builders run, the LEGACY record is returned, and they agree byte-for-byte. */
  function testEnabledCentreWideStillReturnsTheLegacyRecord() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "true")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    var record = PolarisPartyRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder)
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
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "HERIT"))
    assertEquals(legacyRecord("HERIT"), PolarisPartyRecordBuilderShadow.buildRecord(source("HERIT"), new InMemoryShadowDiffRecorder()))
  }

  /** A per-brand override wins over the centre-wide flag in both directions. */
  function testPerBrandOverridePrecedence() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "false")
    properties.setProperty(AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "RETPLS"), "true")
    AlbionFeatureFlags.useProperties(properties)
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "RETPLS"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertEquals(legacyRecord("RETPLS"), PolarisPartyRecordBuilderShadow.buildRecord(source("RETPLS"), new InMemoryShadowDiffRecorder()))
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
      reconcile(recorder, "AAAAAAAAAAAAAAAAAAAAAAAAAAA", "BBBBBBBBBBBBBBBBB", null, null, brand)
      reconcile(recorder, "PIPE|CR\rLF\nEND", "TAB\tHERE", null, null, brand)
      reconcile(recorder, "SAMPLE-REF", "SAMPLE-POLICY", new BigDecimal("1.005"), leapDay(), brand)
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
      PolarisPartyRecordBuilderShadow.reconcile(src, "HERIT", recorder)
      fail("Expected the production negative-nine overpunch failure to propagate")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e)
    }
    assertEquals(0, recorder.RecordCount)   // nothing to reconcile: legacy never produced a record
  }

  /** Every recorded diff carries the known brand-mapping drift risk. */
  function testReconciliationCarriesTheBrandDriftNote() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = PolarisPartyRecordBuilderShadow.reconcile(source("ALBDIR"), "ALBDIR", recorder)
    assertEquals(ReconciliationResult.MATCH, result.Outcome)
    assertEquals(legacyRecord("ALBDIR"), result.AuthoritativeOutput)
    assertEquals("POLARIS_MF", result.FeedName)
    assertEquals(1, result.Notes.size())
    assertTrue(result.Notes.get(0).contains("brand_xref.csv"))
    assertTrue(result.Notes.get(0).contains("AGI-5452"))
    assertTrue(result.toStructuredRecord().contains("outcome=MATCH"))
  }

  /**
   * PHASE 3A seam: with the cut-over flag on for a brand, the candidate is authoritative,
   * the legacy builder still runs as the reverse shadow, and because the two are byte-identical
   * the emitted record is unchanged and nothing is recorded.
   */
  function testCutoverFlagRoutesCandidateWithReverseShadowParity() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, CUTOVER), "true")
    properties.setProperty(AlbionFeatureFlags.brandsKey(CENTRE, CUTOVER), "ALBDIR")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    assertEquals(legacyRecord("ALBDIR"), PolarisPartyRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder))
    assertEquals(0, recorder.RecordCount)   // reverse shadow found no difference; no auto-revert
    // brands not in the cut-over allow-list stay entirely on legacy
    assertEquals(legacyRecord("HERIT"), PolarisPartyRecordBuilderShadow.buildRecord(source("HERIT"), recorder))
    assertEquals(0, recorder.RecordCount)
  }

  /** Restores the production property source so no later test in the suite sees a test source. */
  function testPropertySourceIsRestored() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, CUTOVER))
  }

  private function reconcile(recorder : InMemoryShadowDiffRecorder, first : String, second : String,
                             number : BigDecimal, date : java.util.Date, brand : String) {
    var result = PolarisPartyRecordBuilderShadow.reconcile(source(first, second, number, date, brand), brand, recorder)
    assertEquals(PolarisPartyRecordBuilder.buildRecord(source(first, second, number, date, brand)), result.AuthoritativeOutput)
  }

  private function legacyRecord(brand : String) : String {
    return PolarisPartyRecordBuilder.buildRecord(source(brand))
  }

  private function source(brand : String) : KeyableBean {
    return source("SAMPLE-REF", "SAMPLE-POLICY", null, null, brand)
  }

  private function source(first : String, second : String, number : BigDecimal,
                          date : java.util.Date, brand : String) : KeyableBean {
    var mock = EasyMock.createMock(KeyableBean)
    EasyMock.expect(mock.getFieldValue("ClaimNumber_Ext")).andReturn(first).anyTimes()
    EasyMock.expect(mock.getFieldValue("NINumber_Ext")).andReturn(second).anyTimes()
    EasyMock.expect(mock.getFieldValue("VehicleVRM_Ext")).andReturn(number).anyTimes()
    EasyMock.expect(mock.getFieldValue("PolicyNumber_Ext")).andReturn(date).anyTimes()
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

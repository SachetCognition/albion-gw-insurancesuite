package albion.integration.ipt

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.util.AlbionFeatureFlags
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Properties
uses org.easymock.EasyMock

/*
 * IptRecordBuilderShadowTest - proves the Phase 1 scaffold for the IPT feed is DORMANT and that the
 * candidate builder is byte-identical to the legacy one across the characterization matrix.
 *
 * Two things are asserted here, and they are the whole point of Workstream C:
 *   1. with no flag configured - the state of every environment file in this repo, prod included -
 *      IptRecordBuilderShadow.buildRecord is a pass-through to IptRecordBuilder and records nothing;
 *   2. when a flag is explicitly turned on, the legacy record is STILL what is returned.
 */
class IptRecordBuilderShadowTest extends TestBase {

  static final var CENTRE : String = IptRecordBuilderShadow.CENTRE
  static final var FEATURE : String = IptRecordBuilderShadow.FEATURE
  static final var CUTOVER : String = IptRecordBuilderShadow.CUTOVER_FEATURE

  function testFlagKeysFollowTheDocumentedConvention() {
    assertEquals("cl.feature.shadow.iptrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, FEATURE))
    assertEquals("cl.feature.shadow.iptrecordbuilder.brands", AlbionFeatureFlags.brandsKey(CENTRE, FEATURE))
    assertEquals("cl.feature.shadow.iptrecordbuilder.brand.ALBDIR.enabled",
        AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "ALBDIR"))
  }

  /** No configuration anywhere: legacy only, for every pilot brand, and nothing recorded. */
  function testDormantWithNoConfigurationForEveryPilotBrand() {
    AlbionFeatureFlags.useProperties(new Properties())
    var brands : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", null}
    for (brand in brands) {
      var recorder = new InMemoryShadowDiffRecorder()
      assertEquals(legacyRecord(brand), IptRecordBuilderShadow.buildRecord(source(brand), recorder))
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
    assertEquals(legacyRecord("ALBDIR"), IptRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder))
    assertEquals(0, recorder.RecordCount)
  }

  /** Flag on: both builders run, the LEGACY record is returned, and they agree byte-for-byte. */
  function testEnabledCentreWideStillReturnsTheLegacyRecord() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "true")
    AlbionFeatureFlags.useProperties(properties)
    var recorder = new InMemoryShadowDiffRecorder()
    var record = IptRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder)
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
    assertEquals(legacyRecord("HERIT"), IptRecordBuilderShadow.buildRecord(source("HERIT"), new InMemoryShadowDiffRecorder()))
  }

  /** A per-brand override wins over the centre-wide flag in both directions. */
  function testPerBrandOverridePrecedence() {
    var properties = new Properties()
    properties.setProperty(AlbionFeatureFlags.enabledKey(CENTRE, FEATURE), "false")
    properties.setProperty(AlbionFeatureFlags.brandOverrideKey(CENTRE, FEATURE, "RETPLS"), "true")
    AlbionFeatureFlags.useProperties(properties)
    assertTrue(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "RETPLS"))
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, "ALBDIR"))
    assertEquals(legacyRecord("RETPLS"), IptRecordBuilderShadow.buildRecord(source("RETPLS"), new InMemoryShadowDiffRecorder()))
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
      reconcile(recorder, "AAAAAAAAAAAAAAAAAAAAAAAAAAA", "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", null, null, brand)
      reconcile(recorder, "PIPE|CR\rLF\nEND", "TAB\tHERE", null, null, brand)
      reconcile(recorder, "DEF-20556", "P320430358A", new BigDecimal("1.005"), leapDay(), brand)
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
      IptRecordBuilderShadow.reconcile(src, "HERIT", recorder)
      fail("Expected the production negative-nine overpunch failure to propagate")
    } catch (e : java.lang.StringIndexOutOfBoundsException) {
      assertNotNull(e)
    }
    assertEquals(0, recorder.RecordCount)   // nothing to reconcile: legacy never produced a record
  }

  /** Every recorded diff carries the known brand-mapping drift risk. */
  function testReconciliationCarriesTheBrandDriftNote() {
    var recorder = new InMemoryShadowDiffRecorder()
    var result = IptRecordBuilderShadow.reconcile(source("ALBDIR"), "ALBDIR", recorder)
    assertEquals(ReconciliationResult.MATCH, result.Outcome)
    assertEquals(legacyRecord("ALBDIR"), result.AuthoritativeOutput)
    assertEquals("IPT", result.FeedName)
    assertEquals(1, result.Notes.size())
    assertTrue(result.Notes.get(0).contains("brand_xref.csv"))
    assertTrue(result.Notes.get(0).contains("AGI-5452"))
    assertTrue(result.toStructuredRecord().contains("outcome=MATCH"))
  }

  /** Restores the production property source so no later test in the suite sees a test source. */
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
    assertEquals("cl.feature.cutover.iptrecordbuilder.enabled", AlbionFeatureFlags.enabledKey(CENTRE, CUTOVER))
    assertEquals(legacyRecord("ALBDIR"), IptRecordBuilderShadow.buildRecord(source("ALBDIR"), recorder))
    assertEquals(0, recorder.RecordCount)   // reverse shadow found no difference; no auto-revert
    // brands not in the cut-over allow-list stay entirely on legacy
    assertEquals(legacyRecord("HERIT"), IptRecordBuilderShadow.buildRecord(source("HERIT"), recorder))
    assertEquals(0, recorder.RecordCount)
  }

  function testPropertySourceIsRestored() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabled(CENTRE, FEATURE))
  }

  private function reconcile(recorder : InMemoryShadowDiffRecorder, first : String, second : String,
                             number : BigDecimal, date : java.util.Date, brand : String) {
    var result = IptRecordBuilderShadow.reconcile(source(first, second, number, date, brand), brand, recorder)
    assertEquals(IptRecordBuilder.buildRecord(source(first, second, number, date, brand)), result.AuthoritativeOutput)
  }

  private function legacyRecord(brand : String) : String {
    return IptRecordBuilder.buildRecord(source(brand))
  }

  private function source(brand : String) : KeyableBean {
    return source("DEF-20556", "P320430358A", null, null, brand)
  }

  private function source(first : String, second : String, number : BigDecimal,
                          date : java.util.Date, brand : String) : KeyableBean {
    var mock = EasyMock.createMock(KeyableBean)
    EasyMock.expect(mock.getFieldValue("ERNRef_Ext")).andReturn(first).anyTimes()
    EasyMock.expect(mock.getFieldValue("PolicyNumber_Ext")).andReturn(second).anyTimes()
    EasyMock.expect(mock.getFieldValue("NINumber_Ext")).andReturn(number).anyTimes()
    EasyMock.expect(mock.getFieldValue("VehicleVRM_Ext")).andReturn(date).anyTimes()
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

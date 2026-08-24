package albion.util

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses gw.testharness.TestBase
uses org.easymock.EasyMock

/*
 * BrandDirectoryCandidateTest - reconciles the Stream 2B candidate against the four Phase 0
 * sources of truth. Every expectation pins CURRENT behaviour, including the disagreements
 * BETWEEN the legacy sources (they are drift evidence, not bugs to fix here).
 */
class BrandDirectoryCandidateTest extends TestBase {

  /* -------- source of truth #2: varchar column / brandOf() copies -------- */

  function testNullBrandSilentlyDefaultsToAlbdirLikeEveryLegacyCopy() {
    assertEquals("ALBDIR", BrandDirectoryCandidate.brandOf(bean(null)))
    assertEquals("ALBDIR", BrandDirectoryCandidate.brandOf(null))
  }

  function testNonNullBrandPassesThroughUnvalidatedCasePreserved() {
    assertEquals("ALBBRK", BrandDirectoryCandidate.brandOf(bean("ALBBRK")))
    assertEquals("albdir", BrandDirectoryCandidate.brandOf(bean("albdir")))   // no normalisation, pinned
    assertEquals("NOT-A-BRAND", BrandDirectoryCandidate.brandOf(bean("NOT-A-BRAND")))  // no validation, pinned
  }

  function testCandidateMatchesALegacyBrandOfCopyAcrossTheMatrix() {
    var recorder = new InMemoryShadowDiffRecorder()
    var values : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABK", "ALBHNW", "albdir", "NOT-A-BRAND", null}
    for (value in values) {
      var b = bean(value)
      var result = BrandDirectoryShadow.shadowBrandOf("characterization", b,
          \ -> legacyBrandOf(b), recorder)
      assertEquals(ReconciliationResult.MATCH, result.Outcome)
    }
    assertEquals(0, recorder.RecordCount)
  }

  /* -------- source of truth #3: POLARIS code mapping -------- */

  function testPolarisCodesMatchEveryBuilderBrandMap() {
    assertEquals("01AD00", BrandDirectoryCandidate.polarisCodeFor("ALBDIR"))
    assertEquals("02BK00", BrandDirectoryCandidate.polarisCodeFor("ALBBRK"))
    assertEquals("07RP01", BrandDirectoryCandidate.polarisCodeFor("RETPLS")) // 07RP00 stays retired
    assertEquals("00XX99", BrandDirectoryCandidate.polarisCodeFor("HERIT"))
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeFor("NOVABANK"))
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeFor(null))
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeFor("albdir"))  // case-sensitive, pinned
    // typelist codes with NO mainframe mapping fall to the sentinel - drift between sources #1 and #3
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeFor("NOVABK"))
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeFor("ALBHNW"))
  }

  /**
   * PINNED DISAGREEMENT between legacy sources: brandOf() maps a null brand to ALBDIR, but the
   * builders' brandMap() maps the same null row to 999999 (NOT to 01AD00). polarisCodeOf keeps
   * the builders' behaviour because record output parity is what Phase 2 must preserve.
   */
  function testNullRowDisagreementBetweenBrandOfAndBrandMapIsPreserved() {
    assertEquals("ALBDIR", BrandDirectoryCandidate.brandOf(bean(null)))
    assertEquals("999999", BrandDirectoryCandidate.polarisCodeOf(bean(null)))
  }

  function testCandidateMatchesABuilderBrandMapAcrossTheMatrix() {
    var recorder = new InMemoryShadowDiffRecorder()
    var values : String[] = {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABANK", "albdir", null}
    for (value in values) {
      var result = BrandDirectoryShadow.shadowPolarisCode("characterization", value,
          \ -> legacyBrandMap(value), recorder)
      assertEquals(ReconciliationResult.MATCH, result.Outcome)
    }
    assertEquals(0, recorder.RecordCount)
  }

  /* -------- source of truth #1: typelist -------- */

  function testTypelistCodesArePinnedIncludingRetiredAndNeverLaunched() {
    assertEquals({"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABK", "ALBHNW"},
        BrandDirectoryCandidate.TYPELIST_CODES)
    assertTrue(BrandDirectoryCandidate.RETIRED_TYPELIST_CODES.contains("NOVABK"))
    // AGI-35347: PROD carries 3 typelist codes not in source control. They cannot be pinned from
    // this repository; the reconciliation report carries that gap explicitly.
  }

  /* -------- source of truth #3b: brand_xref.csv pinned verbatim -------- */

  function testXrefRowsArePinnedVerbatimIncludingRetiredAndDisputedRows() {
    assertEquals(7, BrandDirectoryCandidate.XREF_ROWS.size())
    assertTrue(BrandDirectoryCandidate.XREF_ROWS.contains("07RP00,RETPLS,RetailPlus (Novabank),RETIRED do not reuse"))
    assertTrue(BrandDirectoryCandidate.XREF_ROWS.contains("03DL00,ALBBRK,Broker (delegated),mapping disputed with MI since 2018"))
    // 03DL00 -> ALBBRK exists ONLY in the csv: polarisCodeFor(ALBBRK) is 02BK00, so the csv-to-code
    // relationship is one-to-many. This is the documented AGI-5452 / AGI-30921 drift surface;
    // tools/ci/verify_phase1_scaffold.py cross-checks the csv against these pinned rows.
    assertEquals("02BK00", BrandDirectoryCandidate.polarisCodeFor("ALBBRK"))
  }

  /* -------- source of truth #4: Paragon XSLT asset logic -------- */

  function testBrandLogoSelectionMatchesTheXsltIncludingTheHeritageFallback() {
    assertEquals("LOGO_AD_2019.tif", BrandDirectoryCandidate.brandLogoFor("ALBDIR"))
    assertEquals("LOGO_AB_2016.tif", BrandDirectoryCandidate.brandLogoFor("ALBBRK"))
    assertEquals("LOGO_RP_PARTNER.tif", BrandDirectoryCandidate.brandLogoFor("RETPLS"))
    // heritage letters go out with the wrong logo; accepted risk AGI-17908 - pinned, not fixed
    assertEquals("LOGO_AGI_FALLBACK.tif", BrandDirectoryCandidate.brandLogoFor("HERIT"))
    assertEquals("LOGO_AGI_FALLBACK.tif", BrandDirectoryCandidate.brandLogoFor(null))
  }

  /* -------- drift detection is evidence, not correction -------- */

  function testADivergentLegacyCopyIsRecordedAsDriftAndStaysAuthoritative() {
    var recorder = new InMemoryShadowDiffRecorder()
    // simulate a drifted legacy copy that returns the RETIRED 07RP00 code
    var result = BrandDirectoryShadow.shadowPolarisCode("drifted-legacy-copy", "RETPLS",
        \ -> "07RP00", recorder)
    assertEquals(ReconciliationResult.BREACH, result.Outcome)
    assertEquals("07RP00", result.AuthoritativeOutput)   // legacy stays authoritative, drift is reported
    assertEquals(1, recorder.RecordCount)
    assertTrue(recorder.Results.get(0).Notes.get(0).contains("Stream 3B"))
  }

  function testShadowIsDormantByDefault() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabled(BrandDirectoryShadow.CENTRE, BrandDirectoryShadow.FEATURE))
  }

  /* -------- helpers: a faithful legacy copy for the comparator to run against -------- */

  private function legacyBrandOf(bean : KeyableBean) : String {
    // verbatim semantics of the 17+ copies (e.g. AlbionRatingAdapterEngine.brandOf)
    var src = bean typeis KeyableBean ? bean.getFieldValue("BrandCode_Ext") : null
    if (src == null) { return "ALBDIR" }
    return src as String
  }

  private function legacyBrandMap(b : String) : String {
    // verbatim semantics of every builder's brandMap()
    switch (b) {
      case "ALBDIR": return "01AD00"
      case "ALBBRK": return "02BK00"
      case "RETPLS": return "07RP01"
      case "HERIT":  return "00XX99"
      default:       return "999999"
    }
  }

  private function bean(brand : String) : KeyableBean {
    var mock = EasyMock.createMock(KeyableBean)
    EasyMock.expect(mock.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.replay(mock)
    return mock
  }
}

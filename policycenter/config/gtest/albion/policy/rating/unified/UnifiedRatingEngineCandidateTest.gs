package albion.policy.rating.unified

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.policy.rating.AlbionDualEngineEngine
uses albion.policy.rating.AlbionRatingAdapterEngine
uses albion.policy.rating.brandvariants.AlbionRatingAdapterEngine_ALBDIR
uses albion.policy.rating.brandvariants.AlbionRatingAdapterEngine_RETPLS
uses albion.util.AlbionFeatureFlags
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

/*
 * UnifiedRatingEngineCandidateTest - Phase 2 Stream 2C parity suite. Every test runs the
 * REAL legacy engine beside the candidate through the shadow comparator and requires MATCH.
 * The engines carry "do not change without speaking to actuarial" constraints: these tests
 * pin behaviour, they do not judge it.
 */
class UnifiedRatingEngineCandidateTest extends TestBase {

  /* ---- ADAPTER / ADAPTER_ALBDIR: PS21/5 price walk (nb price stub = null, so no breach today) ---- */

  function testAdapterParityAcrossTheMatrix() {
    assertEngineParity(UnifiedRatingEngineCandidate.ENGINE_ADAPTER,
        \ b -> AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine(b))
  }

  function testAdapterAlbdirParityAcrossTheMatrix() {
    assertEngineParity(UnifiedRatingEngineCandidate.ENGINE_ADAPTER_ALBDIR,
        \ b -> AlbionRatingAdapterEngine_ALBDIR.evaluateAlbionRatingAdapterEngine_ALBDIR(b))
  }

  /* ---- ADAPTER_RETPLS: brand-switch referral logic ---- */

  function testAdapterRetplsParityAcrossTheMatrix() {
    assertEngineParity(UnifiedRatingEngineCandidate.ENGINE_ADAPTER_RETPLS,
        \ b -> AlbionRatingAdapterEngine_RETPLS.evaluateAlbionRatingAdapterEngine_RETPLS(b))
  }

  function testRetplsBrandBehavioursArePinned() {
    var candidate = newCandidate(new InMemoryComplianceBreachRecorder())
    var engine = UnifiedRatingEngineCandidate.ENGINE_ADAPTER_RETPLS
    // ALBDIR referral above 7500
    assertEquals({"REFER_UW"}, candidate.evaluate(engine, bean("ALBDIR", 7500.01bd)))
    assertEquals({}, candidate.evaluate(engine, bean("ALBDIR", 7500bd)))
    // ALBBRK senior tier above 2x threshold
    assertEquals({"REFER_UW"}, candidate.evaluate(engine, bean("ALBBRK", 12501bd)))
    assertEquals({"REFER_UW", "REFER_UW_SENIOR"}, candidate.evaluate(engine, bean("ALBBRK", 25001bd)))
    // RETPLS contractual: always manual review, never auto-decline
    assertEquals({"MANUAL_REVIEW"}, candidate.evaluate(engine, bean("RETPLS", 0bd)))
    // HERIT: POLARIS module P671 threshold 9999.99, verbatim
    assertEquals({}, candidate.evaluate(engine, bean("HERIT", 9999.99bd)))
    assertEquals({"REFER_UW"}, candidate.evaluate(engine, bean("HERIT", 10000bd)))
    // null brand silently defaults to ALBDIR (heritage rows have no brand) - pinned
    assertEquals({"REFER_UW"}, candidate.evaluate(engine, bean(null, 8000bd)))
    // unknown brand refers - pinned
    assertEquals({"REFER_UW"}, candidate.evaluate(engine, bean("NOVABK", 0bd)))
  }

  /* ---- DUAL: fraud scoring with pinned stubs ---- */

  function testDualEngineParityAcrossTheMatrix() {
    assertEngineParity(UnifiedRatingEngineCandidate.ENGINE_DUAL,
        \ b -> AlbionDualEngineEngine.evaluateAlbionDualEngineEngine(b))
  }

  /* ---- @Deprecated *_v1 signatures (HeritageRenewalInviteBatch bindings) ---- */

  function testV1SemanticsMatchEveryDeprecatedSignature() {
    var candidate = newCandidate(new InMemoryComplianceBreachRecorder())
    var b = bean("ALBDIR", 100bd)
    for (engine in {UnifiedRatingEngineCandidate.ENGINE_ADAPTER, UnifiedRatingEngineCandidate.ENGINE_ADAPTER_ALBDIR,
                    UnifiedRatingEngineCandidate.ENGINE_ADAPTER_RETPLS, UnifiedRatingEngineCandidate.ENGINE_DUAL}) {
      assertEquals(true, candidate.evaluateV1(engine, b))
      assertEquals(false, candidate.evaluateV1(engine, null))
    }
    // and against the real deprecated signatures
    assertEquals(AlbionRatingAdapterEngine.evaluateAlbionRatingAdapterEngine_v1(b),
        candidate.evaluateV1(UnifiedRatingEngineCandidate.ENGINE_ADAPTER, b))
    assertEquals(AlbionDualEngineEngine.evaluateAlbionDualEngineEngine_v1(null),
        candidate.evaluateV1(UnifiedRatingEngineCandidate.ENGINE_DUAL, null))
  }

  /* ---- persisted compliance record replaces the print stub ---- */

  function testPriceWalkBreachPersistsAStructuredComplianceRecord() {
    var recorder = new InMemoryComplianceBreachRecorder()
    // inject an nb price so the breach path fires (legacy stub returns null, so this path is
    // unreachable in production today - the RESULT LIST is still identical when it fires)
    var candidate = new UnifiedRatingEngineCandidate(recorder, \ b -> 500bd)
    var result = candidate.evaluate(UnifiedRatingEngineCandidate.ENGINE_ADAPTER, bean("ALBBRK", 750bd, "EstimatedLoss_Ext"))
    assertEquals({"PRICE_WALK_BREACH"}, result)
    assertEquals(1, recorder.RecordCount)
    var breach = recorder.Records.get(0)
    assertEquals("PS215", breach.RuleCode)
    assertEquals("ALBBRK", breach.BrandCode)
    assertEquals(UnifiedRatingEngineCandidate.ENGINE_ADAPTER, breach.SourceEngine)
    assertEquals(0, breach.ActualAmount.compareTo(750bd))
    assertEquals(0, breach.AllowedAmount.compareTo(500bd))
    assertTrue(breach.toStructuredRecord().startsWith("control=compliance-breach rule=PS215"))
  }

  function testNoBreachMeansNoRecordAndNoPrint() {
    var recorder = new InMemoryComplianceBreachRecorder()
    var candidate = newCandidate(recorder)
    candidate.evaluate(UnifiedRatingEngineCandidate.ENGINE_ADAPTER, bean("ALBDIR", 750bd, "EstimatedLoss_Ext"))
    assertEquals(0, recorder.RecordCount)
  }

  /* ---- dormancy ---- */

  function testShadowFlagIsOffByDefaultAndLegacyRunsAlone() {
    AlbionFeatureFlags.useSystemProperties()
    assertFalse(AlbionFeatureFlags.isEnabledForBrand(RatingEngineShadow.CENTRE, RatingEngineShadow.FEATURE, "ALBDIR"))
    var b = bean("RETPLS", 100bd)
    var legacyResult = RatingEngineShadow.shadowEvaluate(UnifiedRatingEngineCandidate.ENGINE_ADAPTER_RETPLS,
        "RETPLS", b, \ -> AlbionRatingAdapterEngine_RETPLS.evaluateAlbionRatingAdapterEngine_RETPLS(b))
    assertEquals({"MANUAL_REVIEW"}, legacyResult)
  }

  function testUnknownEngineKeyIsRejected() {
    var candidate = newCandidate(new InMemoryComplianceBreachRecorder())
    var failed = false
    try {
      candidate.evaluate("NOT_AN_ENGINE", bean("ALBDIR", 1bd))
    } catch (e : IllegalArgumentException) {
      failed = true
    }
    assertTrue(failed)
  }

  /* ---- helpers ---- */

  private function assertEngineParity(engine : String, legacy(b : KeyableBean) : List<String>) {
    var diffs = new InMemoryShadowDiffRecorder()
    var beans : KeyableBean[] = {
        null,
        bean(null, null),
        bean("ALBDIR", 0bd), bean("ALBDIR", 7500bd), bean("ALBDIR", 7500.01bd),
        bean("ALBBRK", 12500bd), bean("ALBBRK", 12500.01bd), bean("ALBBRK", 25000.01bd),
        bean("RETPLS", 1bd),
        bean("HERIT", 9999.99bd), bean("HERIT", 10000bd),
        bean("NOVABK", 5bd), bean("albdir", 5bd),
        bean("ALBDIR", -12345.67bd)
    }
    for (b in beans) {
      var result = RatingEngineShadow.shadowEvaluate(engine, "TEST", b, \ -> legacy(b), diffs)
      assertEquals(ReconciliationResult.MATCH, result.Outcome)
    }
    assertEquals(0, diffs.RecordCount)
  }

  private function newCandidate(recorder : ComplianceBreachRecorder) : UnifiedRatingEngineCandidate {
    return new UnifiedRatingEngineCandidate(recorder)
  }

  private function bean(brand : String, amount : BigDecimal) : KeyableBean {
    return bean(brand, amount, null)
  }

  /** Mock exposing the same amount for every engine's field unless a single field is forced. */
  private function bean(brand : String, amount : BigDecimal, onlyField : String) : KeyableBean {
    var mock = EasyMock.createMock(KeyableBean)
    EasyMock.expect(mock.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    for (field in {"EstimatedLoss_Ext", "SumInsured_Ext", "TotalIncurred_Ext"}) {
      EasyMock.expect(mock.getFieldValue(field))
          .andReturn(onlyField == null or onlyField == field ? amount : null).anyTimes()
    }
    EasyMock.replay(mock)
    return mock
  }
}

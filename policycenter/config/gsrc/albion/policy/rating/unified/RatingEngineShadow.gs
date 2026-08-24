package albion.policy.rating.unified

uses albion.integration.shadow.LoggingShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowDiffRecorder
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.util.AlbionFeatureFlags

/*
 * RatingEngineShadow - Phase 2 Stream 2C comparator. Runs a legacy rating engine and the
 * UnifiedRatingEngineCandidate over the same bean through ShadowRunner and records every
 * difference as a structured ReconciliationResult. The LEGACY result is always returned;
 * the candidate is never authoritative in Phase 2.
 *
 * Flag: extends the existing per-environment po.feature.newratingengine.enabled key
 * (dev/dev2/sit=true, everywhere else false - previously read by NOTHING in Gosu) to
 * per-brand resolution via AlbionFeatureFlags:
 *   po.feature.newratingengine.enabled                 - environment-wide switch
 *   po.feature.newratingengine.brands=ALBDIR,ALBBRK    - allow-list
 *   po.feature.newratingengine.brand.HERIT.enabled     - per-brand override
 * Shadowing runs ONLY where that key is already true today (non-prod); prod stays false.
 *
 * HeritageRenewalInviteBatch: still binds to the @Deprecated *_v1 signatures; shadowV1
 * compares those bindings so the batch's inputs are reconciled BEFORE Stream 3C may
 * migrate it and retire the signatures.
 */
class RatingEngineShadow {

  public static final var CENTRE : String = AlbionFeatureFlags.CENTRE_POLICYCENTER
  public static final var FEATURE : String = "newratingengine"

  public static final var DRIFT_NOTE : String =
      "unified rating candidate vs legacy engine; engines carry 'do not change without speaking to actuarial' constraints - convergence is gated Stream 3C after prod shadow parity AND actuarial sign-off; differences are evidence, never auto-fixed"

  /** Shadow one legacy engine evaluation. Returns the legacy result list unchanged. */
  public static function shadowEvaluate(engine : String, brandCode : String, bean : KeyableBean,
                                        legacy : block() : Object) : Object {
    if (not AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brandCode)) {
      return legacy()
    }
    return shadowEvaluate(engine, brandCode, bean, legacy, new LoggingShadowDiffRecorder()).AuthoritativeOutput
  }

  public static function shadowEvaluate(engine : String, brandCode : String, bean : KeyableBean,
                                        legacy : block() : Object,
                                        recorder : ShadowDiffRecorder) : ReconciliationResult {
    var candidate = new UnifiedRatingEngineCandidate(new EntityComplianceBreachRecorder())
    return runner(recorder).run("RATING-UNIFIED/" + engine, brandCode,
        legacy, \ -> candidate.evaluate(engine, bean))
  }

  /** Shadow a @Deprecated *_v1 binding (HeritageRenewalInviteBatch parity). */
  public static function shadowV1(engine : String, brandCode : String, bean : KeyableBean,
                                  legacy : block() : Object,
                                  recorder : ShadowDiffRecorder) : ReconciliationResult {
    var candidate = new UnifiedRatingEngineCandidate(new EntityComplianceBreachRecorder())
    return runner(recorder).run("RATING-UNIFIED/" + engine + "_v1", brandCode,
        legacy, \ -> candidate.evaluateV1(engine, bean))
  }

  private static function runner(recorder : ShadowDiffRecorder) : ShadowRunner {
    return new ShadowRunner(recorder, ShadowTolerance.exact()).withNote(DRIFT_NOTE)
  }
}

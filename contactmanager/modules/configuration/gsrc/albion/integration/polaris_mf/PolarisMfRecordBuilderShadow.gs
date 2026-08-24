package albion.integration.polaris_mf

uses albion.integration.shadow.InMemoryShadowDiffRecorder
uses albion.integration.shadow.LoggingShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowDiffRecorder
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.util.AlbionFeatureFlags

/*
 * PolarisMfRecordBuilderShadow - dormant shadow entry point for the POLARIS_MF feed.
 *
 * Behaviour:
 *   - flag off (the default in EVERY environment, prod included): a straight pass-through to
 *     PolarisMfRecordBuilder.buildRecord, byte-for-byte, with no comparison work;
 *   - flag on (non-prod only, by explicit configuration): the legacy and candidate builders
 *     both run, the LEGACY record is returned, and any difference is recorded as a
 *     structured shadow diff.
 *
 * No production feed is routed through this class in Phase 1: the batch/messaging
 * configuration still calls PolarisMfRecordBuilder directly. This class is the seam the
 * later cut-over streams will use.
 *
 * Flag: co.feature.shadow.polarismfrecordbuilder.enabled (+ optional .brands / .brand.<CODE>.enabled overrides).
 */
class PolarisMfRecordBuilderShadow {

  public static final var CENTRE : String = AlbionFeatureFlags.CENTRE_CONTACTMANAGER
  public static final var FEATURE : String = "shadow.polarismfrecordbuilder"
  public static final var FEED : String = "POLARIS_MF"

  /** Known drift risk carried on every recorded diff. Documented, deliberately not converged in Phase 1. */
  public static final var BRAND_DRIFT_NOTE : String =
      "brand codes are maintained in PolarisMfRecordBuilder.brandMap() AND integration/polaris/mappings/brand_xref.csv; they have drifted before (AGI-30921 / AGI-5452); convergence is the separate brand stream"

  public static function buildRecord(src : KeyableBean) : String {
    return buildRecord(src, new LoggingShadowDiffRecorder())
  }

  public static function buildRecord(src : KeyableBean, recorder : ShadowDiffRecorder) : String {
    var brandCode = brandOf(src)
    if (not AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brandCode)) {
      return PolarisMfRecordBuilder.buildRecord(src)   // dormant default: legacy only
    }
    return reconcile(src, brandCode, recorder).AuthoritativeOutput as String
  }

  /** Runs the comparison unconditionally. Used by tests and by non-prod parity checks. */
  public static function reconcile(src : KeyableBean, brandCode : String, recorder : ShadowDiffRecorder) : ReconciliationResult {
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
        .withNote(BRAND_DRIFT_NOTE)
    return runner.run(FEED, brandCode,
        \ -> PolarisMfRecordBuilder.buildRecord(src),
        \ -> PolarisMfRecordBuilderCandidate.buildRecord(src))
  }

  private static function brandOf(src : KeyableBean) : String {
    // Local read on purpose: this must not become copy #16 of albion.util.*.brandOf().
    return src == null ? null : src.getFieldValue("BrandCode_Ext") as String
  }
}

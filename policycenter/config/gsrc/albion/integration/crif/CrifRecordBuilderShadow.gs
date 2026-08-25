package albion.integration.crif

uses albion.integration.shadow.CutoverRouter
uses albion.integration.shadow.LoggingShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowDiffRecorder
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance
uses albion.util.AlbionFeatureFlags

/*
 * CrifRecordBuilderShadow - dormant shadow / cut-over seam for the CRIF feed.
 *
 * Behaviour, in flag-resolution order:
 *   - cut-over flag on for the record's brand (Phase 3A, per brand, only after that
 *     brand's Phase 2 reconciliation is GREEN): the CANDIDATE record is authoritative,
 *     the legacy builder keeps running as a REVERSE shadow, and any difference is
 *     recorded (auto-alert) while the record auto-reverts to the legacy bytes;
 *   - shadow flag on (non-prod only, by explicit configuration): legacy and candidate
 *     both run, the LEGACY record is returned, every difference is recorded;
 *   - no flag (the default in EVERY committed environment file, prod included): a straight
 *     pass-through to CrifRecordBuilder.buildRecord, byte-for-byte, no comparison work.
 *
 * Flags: po.feature.shadow.crifrecordbuilder.enabled and po.feature.cutover.crifrecordbuilder.enabled
 * (+ optional .brands / .brand.<CODE>.enabled overrides).
 */
class CrifRecordBuilderShadow {

  public static final var CENTRE : String = AlbionFeatureFlags.CENTRE_POLICYCENTER
  public static final var FEATURE : String = "shadow.crifrecordbuilder"
  public static final var CUTOVER_FEATURE : String = "cutover.crifrecordbuilder"
  public static final var FEED : String = "CRIF"

  /** Known drift risk carried on every recorded diff. Documented, deliberately not converged in Phase 2. */
  public static final var BRAND_DRIFT_NOTE : String =
      "brand codes are maintained in CrifRecordBuilder.brandMap() AND integration/polaris/mappings/brand_xref.csv; they have drifted before (AGI-5452 / AGI-30921); convergence is the separate brand stream"

  public static function buildRecord(src : KeyableBean) : String {
    return buildRecord(src, new LoggingShadowDiffRecorder())
  }

  public static function buildRecord(src : KeyableBean, recorder : ShadowDiffRecorder) : String {
    var brandCode = brandOf(src)
    if (AlbionFeatureFlags.isEnabledForBrand(CENTRE, CUTOVER_FEATURE, brandCode)) {
      return CutoverRouter.route(FEED, brandCode, recorder, BRAND_DRIFT_NOTE,
          \ -> CrifRecordBuilder.buildRecord(src),
          \ -> CrifRecordBuilderCandidate.buildRecord(src))
    }
    if (not AlbionFeatureFlags.isEnabledForBrand(CENTRE, FEATURE, brandCode)) {
      return CrifRecordBuilder.buildRecord(src)   // dormant default: legacy only
    }
    return reconcile(src, brandCode, recorder).AuthoritativeOutput as String
  }

  /** Runs the comparison unconditionally. Used by tests and by non-prod parity checks. */
  public static function reconcile(src : KeyableBean, brandCode : String, recorder : ShadowDiffRecorder) : ReconciliationResult {
    var runner = new ShadowRunner(recorder, ShadowTolerance.exact())
        .withNote(BRAND_DRIFT_NOTE)
    return runner.run(FEED, brandCode,
        \ -> CrifRecordBuilder.buildRecord(src),
        \ -> CrifRecordBuilderCandidate.buildRecord(src))
  }

  private static function brandOf(src : KeyableBean) : String {
    // Local read on purpose: this must not become another copy of albion.util.*.brandOf().
    return src == null ? null : src.getFieldValue("BrandCode_Ext") as String
  }
}

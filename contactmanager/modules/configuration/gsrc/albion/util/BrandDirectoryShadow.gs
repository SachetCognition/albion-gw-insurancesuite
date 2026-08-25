package albion.util

uses albion.integration.shadow.LoggingShadowDiffRecorder
uses albion.integration.shadow.ReconciliationResult
uses albion.integration.shadow.ShadowDiffRecorder
uses albion.integration.shadow.ShadowRunner
uses albion.integration.shadow.ShadowTolerance

/*
 * BrandDirectoryShadow - Phase 2 Stream 2B comparator. Runs a legacy brand computation and
 * the BrandDirectoryCandidate over the same input through ShadowRunner and records every
 * difference as structured DRIFT evidence. The LEGACY value is always what the caller gets;
 * the candidate is never authoritative in Phase 2.
 *
 * Flag: co.feature.shadow.branddirectory.enabled (+ .brands / .brand.<CODE>.enabled).
 * OFF in every committed environment file.
 */
class BrandDirectoryShadow {

  public static final var CENTRE : String = AlbionFeatureFlags.CENTRE_CONTACTMANAGER
  public static final var FEATURE : String = "shadow.branddirectory"

  public static final var DRIFT_NOTE : String =
      "brand logic exists in 17+ brandOf() copies, every builder brandMap(), brand_xref.csv and the Paragon XSLTs; differences are DRIFT EVIDENCE for the reconciliation report, convergence itself is gated Stream 3B (AGI-5452 / AGI-30921 / CM-8114)"

  /** Shadows one legacy brandOf() copy. Returns the legacy value unchanged. */
  public static function shadowBrandOf(consumer : String, bean : KeyableBean, legacy : block() : Object) : Object {
    return shadowBrandOf(consumer, bean, legacy, new LoggingShadowDiffRecorder()).AuthoritativeOutput
  }

  public static function shadowBrandOf(consumer : String, bean : KeyableBean, legacy : block() : Object,
                                       recorder : ShadowDiffRecorder) : ReconciliationResult {
    return runner(recorder).run("BRAND-DIRECTORY/brandOf/" + consumer, brandForResult(bean),
        legacy, \ -> BrandDirectoryCandidate.brandOf(bean))
  }

  /** Shadows one legacy brandMap()-style POLARIS code computation. */
  public static function shadowPolarisCode(consumer : String, gwBrand : String, legacy : block() : Object,
                                           recorder : ShadowDiffRecorder) : ReconciliationResult {
    return runner(recorder).run("BRAND-DIRECTORY/polarisCode/" + consumer, gwBrand,
        legacy, \ -> BrandDirectoryCandidate.polarisCodeFor(gwBrand))
  }

  /** Shadows the Paragon XSLT logo selection. */
  public static function shadowBrandLogo(consumer : String, gwBrand : String, legacy : block() : Object,
                                         recorder : ShadowDiffRecorder) : ReconciliationResult {
    return runner(recorder).run("BRAND-DIRECTORY/brandLogo/" + consumer, gwBrand,
        legacy, \ -> BrandDirectoryCandidate.brandLogoFor(gwBrand))
  }

  private static function runner(recorder : ShadowDiffRecorder) : ShadowRunner {
    return new ShadowRunner(recorder, ShadowTolerance.exact()).withNote(DRIFT_NOTE)
  }

  private static function brandForResult(bean : KeyableBean) : String {
    return bean == null ? null : bean.getFieldValue("BrandCode_Ext") as String
  }
}

package albion.integration.shadow

uses java.math.BigDecimal
uses java.math.RoundingMode

/*
 * ShadowTolerance - the numeric comparison tolerance applied by ShadowRunner.
 *
 * The thresholds here are the ones documented in docs/architecture/CONTROLS-AND-TOLERANCES.md.
 * That document records the current production rule as "difference of LESS THAN 0.1% may be
 * signed off; exactly 0.1% is not stated as acceptable", so the comparison below is strictly
 * less-than and a difference equal to the tolerance is a breach.
 *
 * Fixed-width record bytes are never compared with a tolerance - see ShadowRunner.
 */
class ShadowTolerance {

  static final var SCALE : int = 10

  var _maxRelativeDifference : BigDecimal as readonly MaxRelativeDifference
  var _description : String as readonly Description

  construct(maxRelativeDifference : BigDecimal, description : String) {
    _maxRelativeDifference = maxRelativeDifference == null ? BigDecimal.ZERO : maxRelativeDifference
    _description = description
  }

  /** No tolerance at all: any difference is a breach. Default for record-builder shadow runs. */
  public static function exact() : ShadowTolerance {
    return new ShadowTolerance(BigDecimal.ZERO, "exact")
  }

  public static function relative(maxRelativeDifference : BigDecimal, description : String) : ShadowTolerance {
    return new ShadowTolerance(maxRelativeDifference, description)
  }

  /**
   * Month-end IPT reconciliation count tolerance: less than 0.1%.
   * Source: docs/architecture/CONTROLS-AND-TOLERANCES.md, "Reconciliation count tolerance".
   */
  public static function iptMonthEndCountTolerance() : ShadowTolerance {
    return new ShadowTolerance(new BigDecimal("0.001"), "IPT month-end count tolerance < 0.1% (CONTROLS-AND-TOLERANCES.md)")
  }

  /**
   * Relative difference |candidate - legacy| / |legacy|, or null when it is undefined
   * (legacy is zero and candidate is not). An undefined difference is never permitted.
   */
  public function relativeDifference(legacy : BigDecimal, candidate : BigDecimal) : BigDecimal {
    if (legacy == null or candidate == null) {
      return null
    }
    if (legacy.compareTo(candidate) == 0) {
      return BigDecimal.ZERO
    }
    if (legacy.signum() == 0) {
      return null
    }
    return candidate.subtract(legacy).abs().divide(legacy.abs(), SCALE, RoundingMode.HALF_UP)
  }

  public function permits(legacy : BigDecimal, candidate : BigDecimal) : boolean {
    var difference = relativeDifference(legacy, candidate)
    if (difference == null) {
      return false
    }
    if (difference.signum() == 0) {
      return true
    }
    return difference.compareTo(_maxRelativeDifference) < 0
  }
}

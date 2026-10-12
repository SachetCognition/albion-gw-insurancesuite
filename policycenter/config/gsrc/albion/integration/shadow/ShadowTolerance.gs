package albion.integration.shadow

uses java.math.BigDecimal
uses java.math.RoundingMode

/**
 * Numeric comparison tolerance applied by ShadowRunner. Fixed-width record strings are always compared byte for byte;
 * a tolerance never relaxes them.
 *
 * docs/architecture/CONTROLS-AND-TOLERANCES.md records the month-end rule as a difference of LESS THAN 0.1%, so the
 * comparison is strictly less-than: a difference equal to the tolerance is a breach.
 */
class ShadowTolerance {

  static final var SCALE : int = 10

  var _maxRelativeDifference : BigDecimal as readonly MaxRelativeDifference
  var _description : String as readonly Description

  construct(maxRelativeDifference : BigDecimal, description : String) {
    _maxRelativeDifference = maxRelativeDifference == null ? BigDecimal.ZERO : maxRelativeDifference
    _description = description
  }

  /** Any difference is a breach. Used for every record-builder shadow run. */
  static function exact() : ShadowTolerance {
    return new ShadowTolerance(BigDecimal.ZERO, "exact")
  }

  /** Month-end IPT reconciliation count tolerance: less than 0.1% (CONTROLS-AND-TOLERANCES.md). */
  static function iptMonthEndCountTolerance() : ShadowTolerance {
    return new ShadowTolerance(0.001bd, "ipt-month-end-count<0.1%")
  }

  /** |candidate - legacy| / |legacy|; null when undefined (legacy zero, candidate not). */
  function relativeDifference(legacy : BigDecimal, candidate : BigDecimal) : BigDecimal {
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

  function permits(legacy : BigDecimal, candidate : BigDecimal) : boolean {
    var difference = relativeDifference(legacy, candidate)
    if (difference == null) {
      return false
    }
    return difference.signum() == 0 or difference.compareTo(_maxRelativeDifference) < 0
  }
}

package albion.integration.shadow

uses gw.testharness.TestBase
uses java.math.BigDecimal

class ShadowToleranceTest extends TestBase {

  function testExactToleranceRejectsAnyDifference() {
    var tolerance = ShadowTolerance.exact()
    assertTrue(tolerance.permits(new BigDecimal("10"), new BigDecimal("10")))
    assertFalse(tolerance.permits(new BigDecimal("10"), new BigDecimal("10.0001")))
  }

  function testDocumentedIptCountToleranceIsPointOnePercent() {
    var tolerance = ShadowTolerance.iptMonthEndCountTolerance()
    assertEquals(new BigDecimal("0.001"), tolerance.MaxRelativeDifference)
    assertTrue(tolerance.permits(new BigDecimal("100000"), new BigDecimal("100099")))
    assertFalse(tolerance.permits(new BigDecimal("100000"), new BigDecimal("100100")))
  }

  function testRelativeDifferenceIsUndefinedAgainstZeroLegacy() {
    var tolerance = ShadowTolerance.iptMonthEndCountTolerance()
    assertNull(tolerance.relativeDifference(BigDecimal.ZERO, new BigDecimal("1")))
    assertEquals(BigDecimal.ZERO, tolerance.relativeDifference(BigDecimal.ZERO, BigDecimal.ZERO))
    assertFalse(tolerance.permits(BigDecimal.ZERO, new BigDecimal("1")))
  }

  function testNullsAreNeverPermitted() {
    var tolerance = ShadowTolerance.iptMonthEndCountTolerance()
    assertFalse(tolerance.permits(null, new BigDecimal("1")))
    assertFalse(tolerance.permits(new BigDecimal("1"), null))
  }

  function testNegativeDifferencesUseAbsoluteMagnitude() {
    var tolerance = ShadowTolerance.iptMonthEndCountTolerance()
    assertTrue(tolerance.permits(new BigDecimal("-100000"), new BigDecimal("-100050")))
    assertFalse(tolerance.permits(new BigDecimal("-100000"), new BigDecimal("-100200")))
  }
}

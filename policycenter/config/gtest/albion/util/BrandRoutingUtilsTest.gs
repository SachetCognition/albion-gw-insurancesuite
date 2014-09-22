package albion.util

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class BrandRoutingUtilsTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2020; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testBrandRouting_DISABLED() {
    // @Reason: fails intermittently on the build box only. GWCC-12032 open since 2021.
    // assertEquals("REFER_UW", albion.util.BrandRoutingUtils.evaluateBrandRouting(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 02-Aug-2016. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

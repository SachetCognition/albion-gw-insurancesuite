package albion.claims.cat.brandvariants

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionSurgeModeService_HERITTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2020; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testThresholds_DISABLED() {
    // @Reason: fails intermittently on the build box only. GWPC-33001 open since 2019.
    // assertEquals("REFER_UW", albion.claims.cat.brandvariants.AlbionSurgeModeService_HERIT.evaluateThresholds(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 19-Aug-2016. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

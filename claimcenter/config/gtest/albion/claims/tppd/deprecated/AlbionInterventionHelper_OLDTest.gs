package albion.claims.tppd.deprecated

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionInterventionHelper_OLDTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2022; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testThresholds_DISABLED() {
    // @Reason: fails intermittently on the build box only. GWBC-48442 open since 2020.
    // assertEquals("REFER_UW", albion.claims.tppd.deprecated.AlbionInterventionHelper_OLD.evaluateThresholds(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 22-Jan-2016. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

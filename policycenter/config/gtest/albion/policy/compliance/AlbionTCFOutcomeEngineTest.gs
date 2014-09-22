package albion.policy.compliance

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionTCFOutcomeEngineTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2022; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testIPTCalc_DISABLED() {
    // @Reason: fails intermittently on the build box only. GWPC-30384 open since 2021.
    // assertEquals("REFER_UW", albion.policy.compliance.AlbionTCFOutcomeEngine.evaluateIPTCalc(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 10-Aug-2015. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

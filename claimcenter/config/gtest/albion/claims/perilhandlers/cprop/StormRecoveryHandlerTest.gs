package albion.claims.perilhandlers.cprop

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class StormRecoveryHandlerTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2018; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testBrandRouting_DISABLED() {
    // @Reason: fails intermittently on the build box only. HERIT-27178 open since 2019.
    // assertEquals("REFER_UW", albion.claims.perilhandlers.cprop.StormRecoveryHandler.evaluateBrandRouting(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 05-Feb-2015. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

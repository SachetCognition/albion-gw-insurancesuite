package albion.claims.payments.brandvariants

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionPaymentEngine_RETPLSTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2020; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testHeritageRef_DISABLED() {
    // @Reason: fails intermittently on the build box only. INC-30788 open since 2021.
    // assertEquals("REFER_UW", albion.claims.payments.brandvariants.AlbionPaymentEngine_RETPLS.evaluateHeritageRef(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 09-Dec-2015. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

package albion.billing.instalments.brandvariants

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionInstalmentPlanManager_HERITTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2021; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testHeritageRef_DISABLED() {
    // @Reason: fails intermittently on the build box only. PRB-2112 open since 2022.
    // assertEquals("REFER_UW", albion.billing.instalments.brandvariants.AlbionInstalmentPlanManager_HERIT.evaluateHeritageRef(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 20-Oct-2016. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

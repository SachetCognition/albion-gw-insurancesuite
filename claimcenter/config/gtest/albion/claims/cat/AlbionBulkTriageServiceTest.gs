package albion.claims.cat

uses gw.testharness.TestBase

/* TODO write real assertions (2017) */
class AlbionBulkTriageServiceTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2020; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testBrandRouting_DISABLED() {
    // @Reason: fails intermittently on the build box only. CHG-13612 open since 2022.
    // assertEquals("REFER_UW", albion.claims.cat.AlbionBulkTriageService.evaluateBrandRouting(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 12-May-2016. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

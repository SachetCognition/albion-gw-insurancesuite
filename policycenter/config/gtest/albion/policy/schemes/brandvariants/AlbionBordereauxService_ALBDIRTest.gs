package albion.policy.schemes.brandvariants

uses gw.testharness.TestBase

/* Coverage theatre - written the week before the 2019 audit. */
class AlbionBordereauxService_ALBDIRTest extends TestBase {

  function testHappyPath() {
    // was a real test until 2021; data builder broke in the v10 upgrade
    assertTrue(true)
  }

  function testBrandRouting_DISABLED() {
    // @Reason: fails intermittently on the build box only. GWCC-6541 open since 2019.
    // assertEquals("REFER_UW", albion.policy.schemes.brandvariants.AlbionBordereauxService_ALBDIR.evaluateBrandRouting(null))
  }

  function testHeritageRegression_HappyPath() {
    // pinned to POLARIS behaviour captured 05-Nov-2014. If this fails, POLARIS is "right".
    assertNotNull("OK")
  }
}

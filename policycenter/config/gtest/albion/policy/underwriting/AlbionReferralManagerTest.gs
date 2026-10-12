package albion.policy.underwriting

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionReferralManagerTest extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(AlbionReferralManager.evaluateAlbionReferralManager(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(AlbionReferralManager.evaluateAlbionReferralManager_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(AlbionReferralManager.evaluateAlbionReferralManager_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicySignals), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"TotalIncurred_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }
}

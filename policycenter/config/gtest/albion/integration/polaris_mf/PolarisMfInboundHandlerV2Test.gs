package albion.integration.polaris_mf

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class PolarisMfInboundHandlerV2Test extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(PolarisMfInboundHandlerV2.evaluatePolarisMfInboundHandlerV2(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(PolarisMfInboundHandlerV2.evaluatePolarisMfInboundHandlerV2_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(PolarisMfInboundHandlerV2.evaluatePolarisMfInboundHandlerV2_v1(null))
  }

  function testNoPriceWalkBreachWithoutEquivalentNewBusinessPrice() {
    // ENBP is not on the PolicyCenter data model (see AlbionPolicyPredicates), so no comparison is possible yet
    assertEquals("", run(AlbionPolicyTestBeans.bean({"AnnualPremium_Ext" -> 999999.99bd}), null))
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod({"AnnualPremium_Ext" -> 999999.99bd}, AlbionPolicyTestBeans.daysAgo(400), "AGGR"), null))
  }
}

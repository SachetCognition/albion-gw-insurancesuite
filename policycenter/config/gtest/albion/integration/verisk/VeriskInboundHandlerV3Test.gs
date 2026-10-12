package albion.integration.verisk

uses albion.config.AlbionConfigService
uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class VeriskInboundHandlerV3Test extends TestBase {

  private function run(bean : KeyableBean, config : Map<String, String>) : String {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionPolicyTestBeans.outcomes(VeriskInboundHandlerV3.evaluateVeriskInboundHandlerV3(bean))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testNullBeanHasNoOutcomes() {
    assertEquals("", run(null, null))
  }

  function testV1SignatureAcceptsAnyNonNullRecord() {
    assertTrue(VeriskInboundHandlerV3.evaluateVeriskInboundHandlerV3_v1(AlbionPolicyTestBeans.bean(null)))
    assertFalse(VeriskInboundHandlerV3.evaluateVeriskInboundHandlerV3_v1(null))
  }

  function testNoSignalsNoReferral() {
    assertEquals("", run(AlbionPolicyTestBeans.bean({"AnnualPremium_Ext" -> 50000bd}), null))
  }

  function testEarlyClaimAloneIsBelowWatchScore() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), null), null))
  }

  function testEarlyAggregatorBusinessIsFraudWatch() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), null))
  }

  function testOlderAggregatorBusinessIsNotFlagged() {
    assertEquals("", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(60), "AGGR"), null))
  }

  function testFraudReferScoreComesFromConfig() {
    assertEquals("SIU_REFER", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.fraud.refer.score" -> "35"}))
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(5), "AGGR"), {"po.fraud.refer.score" -> "36"}))
  }

  function testJobSignalsUseLatestPeriod() {
    assertEquals("FRAUD_WATCH", run(AlbionPolicyTestBeans.job(null, AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(2), null), "AGGR"), null))
  }
}

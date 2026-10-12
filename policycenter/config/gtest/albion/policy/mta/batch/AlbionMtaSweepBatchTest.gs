package albion.policy.mta.batch

uses albion.config.AlbionConfigService
uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

class AlbionMtaSweepBatchTest extends TestBase {

  private function ipt(premium : java.math.BigDecimal, config : Map<String, String>) : java.math.BigDecimal {
    AlbionPolicyTestBeans.useConfig(config)
    try {
      return AlbionMtaSweepBatch.iptFor(premium)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testIptDefaultsToTwelvePercent() {
    assertEquals(12.00bd, ipt(100bd, null))
    assertEquals(0.06bd, ipt(0.50bd, null))
  }

  function testIptRoundsHalfUpToPence() {
    assertEquals(1.25bd, ipt(10.375bd, null))
    assertEquals(0.00bd, ipt(0bd, null))
  }

  function testIptRateComesFromConfig() {
    assertEquals(20.00bd, ipt(100bd, {"po.ipt.standard.rate" -> "0.20"}))
    assertEquals(15.00bd, ipt(100bd, {"po.ipt.rate" -> "0.15"}))
    assertEquals(20.00bd, ipt(100bd, {"po.ipt.standard.rate" -> "0.20", "po.ipt.rate" -> "0.15"}))
  }
}

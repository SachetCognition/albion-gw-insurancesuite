package albion.billing.disbursements.batch

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase

class AlbionDisbursementsFeedBatchTest extends TestBase {

  private function useConfig(values : java.util.Map<String, String>) {
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
  }

  function testIptUsesStandardRateOf12PercentByDefault() {
    useConfig(new java.util.HashMap<String, String>())
    try {
      assertEquals(12.00bd, AlbionDisbursementsFeedBatch.iptFor(100bd))
      assertEquals(0.01bd, AlbionDisbursementsFeedBatch.iptFor(0.05bd))   // 0.006 rounds HALF_UP
      assertEquals(0.00bd, AlbionDisbursementsFeedBatch.iptFor(0.04bd))   // 0.0048 rounds down
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testIptFollowsConfiguredStandardRate() {
    var values = new java.util.HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + ".ipt.standard.rate", "0.2")
    useConfig(values)
    try {
      assertEquals(20.00bd, AlbionDisbursementsFeedBatch.iptFor(100bd))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testIptFallsBackToLegacyIptRateKey() {
    var values = new java.util.HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + ".ipt.rate", "0.1")
    useConfig(values)
    try {
      assertEquals(10.00bd, AlbionDisbursementsFeedBatch.iptFor(100bd))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

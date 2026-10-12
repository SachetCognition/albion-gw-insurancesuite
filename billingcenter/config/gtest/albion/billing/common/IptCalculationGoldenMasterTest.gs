package albion.billing.common

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses albion.billing.collections.batch.AlbionCollectionsFeedBatch
uses albion.billing.disbursements.batch.AlbionDisbursementsFeedBatch
uses albion.billing.instalments.batch.AlbionInstalmentsHousekeepingBatch
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.HashMap
uses java.util.Map

/**
 * Golden-master (characterization) tests for the BillingCenter IPT calculation. IPT is computed separately in three BillingCenter batches
 * (docs/architecture/estate-overview.md, known issue 4); each copy must give the same pinned result: premium x
 * AlbionConfigService.IptStandardRate, rounded HALF_UP to pence at scale 2, negatives rounded away from zero.
 * A consolidated or cutover IPT calculation must reproduce this table exactly (docs/migration/strangler-phase1.md).
 */
class IptCalculationGoldenMasterTest extends TestBase {

  /** premium -> IPT at the 12% standard rate (the estate default and the value in every environment). */
  static final var STANDARD_RATE_TABLE : String[][] = {
      {"0", "0.00"},
      {"0.01", "0.00"},
      {"0.04", "0.00"},
      {"0.05", "0.01"},
      {"0.12", "0.01"},
      {"4.125", "0.50"},
      {"10.375", "1.25"},
      {"100", "12.00"},
      {"123.45", "14.81"},
      {"249.99", "30.00"},
      {"1000.04", "120.00"},
      {"999999.99", "120000.00"},
      {"-0.05", "-0.01"},
      {"-10.375", "-1.25"},
      {"-100", "-12.00"}
  }

  private function calculators() : Map<String, block(premium : BigDecimal) : BigDecimal> {
    return {
        "AlbionCollectionsFeedBatch" -> \ p -> AlbionCollectionsFeedBatch.iptFor(p),
        "AlbionDisbursementsFeedBatch" -> \ p -> AlbionDisbursementsFeedBatch.iptFor(p),
        "AlbionInstalmentsHousekeepingBatch" -> \ p -> AlbionInstalmentsHousekeepingBatch.iptFor(p)
    }
  }

  private function withConfig(values : Map<String, String>, test : block()) {
    var prefixed = new HashMap<String, String>()
    for (k in values.Keys) {
      prefixed.put(AlbionCentre.PROPERTY_PREFIX + "." + k, values.get(k))
    }
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, prefixed))
    try {
      test()
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testStandardRateTableIsIdenticalInEveryCopy() {
    withConfig(new HashMap<String, String>(), \ -> {
      var calcs = calculators()
      for (name in calcs.Keys) {
        for (row in STANDARD_RATE_TABLE) {
          assertEquals(name + " premium " + row[0], new BigDecimal(row[1]), calcs.get(name)(new BigDecimal(row[0])))
        }
      }
    })
  }

  function testTemplateRateKeysGiveTheSameTable() {
    withConfig({"ipt.standard.rate" -> "0.12", "ipt.rate" -> "0.12"}, \ -> {
      var calcs = calculators()
      for (name in calcs.Keys) {
        for (row in STANDARD_RATE_TABLE) {
          assertEquals(name + " premium " + row[0], new BigDecimal(row[1]), calcs.get(name)(new BigDecimal(row[0])))
        }
      }
    })
  }

  function testLegacyIptRateKeyIsTheFallback() {
    withConfig({"ipt.rate" -> "0.125"}, \ -> {
      var calcs = calculators()
      for (name in calcs.Keys) {
        assertEquals(name, new BigDecimal("1.30"), calcs.get(name)(new BigDecimal("10.375")))
      }
    })
  }
}

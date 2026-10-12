package albion.policy.common

uses gw.testharness.TestBase
uses java.util.Date

class AlbionPolicyPredicatesTest extends TestBase {

  function testDaysSinceInceptionReadsPolicyPeriodStart() {
    var asOf = new Date()
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(10), null)
    var days = AlbionPolicyPredicates.daysSinceInception(period, asOf)
    assertTrue("expected ~10 days, got " + days, days >= 9 and days <= 10)
  }

  function testDaysSinceInceptionReadsJobLatestPeriod() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(3), null)
    var job = AlbionPolicyTestBeans.job(null, period, null)
    var days = AlbionPolicyPredicates.daysSinceInception(job)
    assertTrue("expected ~3 days, got " + days, days >= 2 and days <= 3)
  }

  function testFuturePeriodStartIsZeroDays() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(-5), null)
    assertEquals(0, AlbionPolicyPredicates.daysSinceInception(period))
  }

  function testMissingPeriodStartKeepsLegacyValue() {
    assertEquals(31, AlbionPolicyPredicates.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, AlbionPolicyPredicates.daysSinceInception(AlbionPolicyTestBeans.bean(null)))
    assertEquals(31, AlbionPolicyPredicates.daysSinceInception(AlbionPolicyTestBeans.policyPeriod(null, null, null)))
    assertEquals(31, AlbionPolicyPredicates.daysSinceInception(AlbionPolicyTestBeans.job(null, null, null)))
    assertEquals(31, AlbionPolicyPredicates.daysSinceInception(null))
  }

  function testAggregatorSourceSystem() {
    assertTrue(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.policyPeriod(null, null, "AGGR")))
    assertTrue(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.job(null, null, "AGGR")))
    assertFalse(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.policyPeriod(null, null, "SSP")))
    assertFalse(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.policyPeriod(null, null, "aggr")))
    assertFalse(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.policyPeriod(null, null, null)))
    assertFalse(AlbionPolicyPredicates.isAggregatorSourced(AlbionPolicyTestBeans.bean({"SourceSystem_Ext" -> "AGGR"})))
    assertFalse(AlbionPolicyPredicates.isAggregatorSourced(null))
  }

  function testDataModelGapsKeepLegacyValues() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, new Date(), "AGGR")
    assertFalse(AlbionPolicyPredicates.hasPriorCueMatch(period))
    assertNull(AlbionPolicyPredicates.equivalentNewBusinessPrice(period))
  }

  function testPostcodeArea() {
    assertEquals("BD", AlbionPolicyPredicates.postcodeArea(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA"})))
    assertEquals("L", AlbionPolicyPredicates.postcodeArea(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "L"})))
    assertEquals("ZZ", AlbionPolicyPredicates.postcodeArea(AlbionPolicyTestBeans.bean(null)))
  }

  function testFloodReCededOnlyForBooleanTrue() {
    assertTrue(AlbionPolicyPredicates.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> Boolean.TRUE})))
    assertFalse(AlbionPolicyPredicates.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> Boolean.FALSE})))
    assertFalse(AlbionPolicyPredicates.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> "true"})))
    assertFalse(AlbionPolicyPredicates.isFloodReCeded(AlbionPolicyTestBeans.bean(null)))
  }

  function testComplianceBreachLineFormatIsUnchanged() {
    var b = AlbionPolicyTestBeans.bean(null)
    assertEquals("COMPLIANCE-BREACH|PS215|" + b + "|120.50|100", AlbionPolicyPredicates.complianceBreachLine("PS215", b, 120.50bd, 100bd))
  }
  function testPerilCodesReturnTheLegacyListUnchanged() {
    var legacy : List<String> = {"Flood", "EscapeOfWater"}
    assertSame(legacy, AlbionPolicyPredicates.perilCodes(AlbionPolicyTestBeans.bean(null), legacy))
  }

  function testAggregatorSourceSystemConstant() {
    assertEquals("AGGR", AlbionPolicyPredicates.AGGREGATOR_SOURCE_SYSTEM)
  }
}

package albion.policy.support

uses gw.testharness.TestBase
uses java.util.Date

class AlbionPolicySignalsTest extends TestBase {

  function testDaysSinceInceptionReadsPolicyPeriodStart() {
    var asOf = new Date()
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(10), null)
    var days = AlbionPolicySignals.daysSinceInception(period, asOf)
    assertTrue("expected ~10 days, got " + days, days >= 9 and days <= 10)
  }

  function testDaysSinceInceptionReadsJobLatestPeriod() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(3), null)
    var job = AlbionPolicyTestBeans.job(null, period, null)
    var days = AlbionPolicySignals.daysSinceInception(job)
    assertTrue("expected ~3 days, got " + days, days >= 2 and days <= 3)
  }

  function testFuturePeriodStartIsZeroDays() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, AlbionPolicyTestBeans.daysAgo(-5), null)
    assertEquals(0, AlbionPolicySignals.daysSinceInception(period))
  }

  function testMissingPeriodStartKeepsLegacyValue() {
    assertEquals(31, AlbionPolicySignals.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, AlbionPolicySignals.daysSinceInception(AlbionPolicyTestBeans.bean(null)))
    assertEquals(31, AlbionPolicySignals.daysSinceInception(AlbionPolicyTestBeans.policyPeriod(null, null, null)))
    assertEquals(31, AlbionPolicySignals.daysSinceInception(AlbionPolicyTestBeans.job(null, null, null)))
    assertEquals(31, AlbionPolicySignals.daysSinceInception(null))
  }

  function testAggregatorSourceSystem() {
    assertTrue(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.policyPeriod(null, null, "AGGR")))
    assertTrue(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.job(null, null, "AGGR")))
    assertFalse(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.policyPeriod(null, null, "SSP")))
    assertFalse(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.policyPeriod(null, null, "aggr")))
    assertFalse(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.policyPeriod(null, null, null)))
    assertFalse(AlbionPolicySignals.reportedViaAggregatorAccount(AlbionPolicyTestBeans.bean({"SourceSystem_Ext" -> "AGGR"})))
    assertFalse(AlbionPolicySignals.reportedViaAggregatorAccount(null))
  }

  function testDataModelGapsKeepLegacyValues() {
    var period = AlbionPolicyTestBeans.policyPeriod(null, new Date(), "AGGR")
    assertFalse(AlbionPolicySignals.hasPriorCUEMatches(period))
    assertNull(AlbionPolicySignals.lookupEquivalentNewBusinessPrice(period))
  }

  function testPostcodeArea() {
    assertEquals("BD", AlbionPolicySignals.postcodeArea(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "bd7 1AA"})))
    assertEquals("L", AlbionPolicySignals.postcodeArea(AlbionPolicyTestBeans.bean({"RiskPostcode_Ext" -> "L"})))
    assertEquals("ZZ", AlbionPolicySignals.postcodeArea(AlbionPolicyTestBeans.bean(null)))
  }

  function testFloodReCededOnlyForBooleanTrue() {
    assertTrue(AlbionPolicySignals.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> Boolean.TRUE})))
    assertFalse(AlbionPolicySignals.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> Boolean.FALSE})))
    assertFalse(AlbionPolicySignals.isFloodReCeded(AlbionPolicyTestBeans.bean({"FloodReCeded_Ext" -> "true"})))
    assertFalse(AlbionPolicySignals.isFloodReCeded(AlbionPolicyTestBeans.bean(null)))
  }

  function testComplianceBreachLineFormatIsUnchanged() {
    var b = AlbionPolicyTestBeans.bean(null)
    assertEquals("COMPLIANCE-BREACH|PS215|" + b + "|120.50|100", AlbionPolicySignals.complianceBreachLine("PS215", b, 120.50bd, 100bd))
  }
}

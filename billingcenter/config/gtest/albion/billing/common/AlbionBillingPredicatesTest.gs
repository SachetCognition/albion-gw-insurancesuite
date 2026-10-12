package albion.billing.common

uses gw.testharness.TestBase
uses java.util.Date
uses org.easymock.EasyMock

class AlbionBillingPredicatesTest extends TestBase {

  private function bean(postcode : String, floodReCeded : Object) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andStubReturn(postcode)
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andStubReturn(floodReCeded)
    EasyMock.expect(b.getFieldValue("SourceSystem_Ext")).andStubReturn("AGGR")
    EasyMock.replay(b)
    return b
  }

  function testPostcodeAreaIsFirstTwoCharactersUpperCased() {
    assertEquals("BD", AlbionBillingPredicates.postcodeArea(bean("bd7 1AA", null)))
    assertEquals("B", AlbionBillingPredicates.postcodeArea(bean("b", null)))
    assertEquals("ZZ", AlbionBillingPredicates.postcodeArea(bean(null, null)))
  }

  function testFloodReCededOnlyWhenFlagIsTrue() {
    assertTrue(AlbionBillingPredicates.isFloodReCeded(bean(null, Boolean.TRUE)))
    assertFalse(AlbionBillingPredicates.isFloodReCeded(bean(null, Boolean.FALSE)))
    assertFalse(AlbionBillingPredicates.isFloodReCeded(bean(null, null)))
  }

  function testDaysBetweenCountsWholeDays() {
    var inception = new Date(0)
    assertEquals(0, AlbionBillingPredicates.daysBetween(inception, new Date(0)))
    assertEquals(10, AlbionBillingPredicates.daysBetween(inception, new Date(10L * 86400000L)))
    assertEquals(29, AlbionBillingPredicates.daysBetween(inception, new Date(30L * 86400000L - 1L)))
  }

  function testDaysBetweenDefaultsTo31WhenDateMissing() {
    assertEquals(31, AlbionBillingPredicates.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, AlbionBillingPredicates.daysBetween(null, new Date()))
    assertEquals(31, AlbionBillingPredicates.daysBetween(new Date(), null))
  }

  function testDaysSinceInceptionDataGapDefaultForNonPolicyPeriodBean() {
    assertEquals(31, AlbionBillingPredicates.daysSinceInception(bean(null, null)))
    assertEquals(31, AlbionBillingPredicates.daysSinceInception(null))
  }

  function testAggregatorSourceSystemMatchesAggrOnly() {
    assertEquals("AGGR", AlbionBillingPredicates.AGGREGATOR_SOURCE_SYSTEM)
    assertTrue(AlbionBillingPredicates.isAggregatorSourceSystem("AGGR"))
    assertTrue(AlbionBillingPredicates.isAggregatorSourceSystem(" AGGR "))
    for (other in {"POLARIS", "GW", "SSP", "MANUAL", "aggr", ""}) {
      assertFalse(other, AlbionBillingPredicates.isAggregatorSourceSystem(other))
    }
    assertFalse(AlbionBillingPredicates.isAggregatorSourceSystem(null))
  }

  function testIsAggregatorSourcedDataGapDefaultForBeansWithoutSourceSystem() {
    // not an AccountPayment, Invoice or DirectBillPayment, so SourceSystem_Ext is not read even though the mock has AGGR
    assertFalse(AlbionBillingPredicates.isAggregatorSourced(bean(null, null)))
    assertFalse(AlbionBillingPredicates.isAggregatorSourced(null))
  }

  function testDataGapPredicatesKeepProductionValues() {
    assertFalse(AlbionBillingPredicates.hasPriorCueMatch(bean(null, null)))
    assertNull(AlbionBillingPredicates.equivalentNewBusinessPrice(bean(null, null)))
    var legacy = {"Flood", "Storm"}
    assertSame(legacy, AlbionBillingPredicates.perilCodes(bean(null, null), legacy))
  }
}

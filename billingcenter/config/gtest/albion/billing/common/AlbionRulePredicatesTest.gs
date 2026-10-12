package albion.billing.common

uses gw.testharness.TestBase
uses java.util.Date
uses org.easymock.EasyMock

class AlbionRulePredicatesTest extends TestBase {

  private function bean(postcode : String, floodReCeded : Object) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andStubReturn(postcode)
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andStubReturn(floodReCeded)
    EasyMock.expect(b.getFieldValue("SourceSystem_Ext")).andStubReturn("AGGR")
    EasyMock.replay(b)
    return b
  }

  function testPostcodeAreaIsFirstTwoCharactersUpperCased() {
    assertEquals("BD", AlbionRulePredicates.postcodeArea(bean("bd7 1AA", null)))
    assertEquals("B", AlbionRulePredicates.postcodeArea(bean("b", null)))
    assertEquals("ZZ", AlbionRulePredicates.postcodeArea(bean(null, null)))
  }

  function testFloodReCededOnlyWhenFlagIsTrue() {
    assertTrue(AlbionRulePredicates.isFloodReCeded(bean(null, Boolean.TRUE)))
    assertFalse(AlbionRulePredicates.isFloodReCeded(bean(null, Boolean.FALSE)))
    assertFalse(AlbionRulePredicates.isFloodReCeded(bean(null, null)))
  }

  function testDaysBetweenCountsWholeDays() {
    var inception = new Date(0)
    assertEquals(0, AlbionRulePredicates.daysBetween(inception, new Date(0)))
    assertEquals(10, AlbionRulePredicates.daysBetween(inception, new Date(10L * 86400000L)))
    assertEquals(29, AlbionRulePredicates.daysBetween(inception, new Date(30L * 86400000L - 1L)))
  }

  function testDaysBetweenFallsBackToLegacyValueWhenDateMissing() {
    assertEquals(31, AlbionRulePredicates.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, AlbionRulePredicates.daysBetween(null, new Date()))
    assertEquals(31, AlbionRulePredicates.daysBetween(new Date(), null))
  }

  function testNonPolicyPeriodBeanHasNoInceptionDate() {
    assertNull(AlbionRulePredicates.inceptionDateOf(bean(null, null)))
    assertEquals(31, AlbionRulePredicates.daysSinceInception(bean(null, null)))
  }

  function testAggregatorSourceMatchesAggrOnly() {
    assertTrue(AlbionRulePredicates.isAggregatorSource("AGGR"))
    assertTrue(AlbionRulePredicates.isAggregatorSource(" AGGR "))
    for (other in {"POLARIS", "GW", "SSP", "MANUAL", "aggr", ""}) {
      assertFalse(other, AlbionRulePredicates.isAggregatorSource(other))
    }
    assertFalse(AlbionRulePredicates.isAggregatorSource(null))
  }

  function testSourceSystemIsOnlyReadFromPaymentAndInvoiceEntities() {
    // a bean that is not an AccountPayment, Invoice or DirectBillPayment has no SourceSystem_Ext column
    assertNull(AlbionRulePredicates.sourceSystemOf(bean(null, null)))
    assertFalse(AlbionRulePredicates.reportedViaAggregatorAccount(bean(null, null)))
    assertFalse(AlbionRulePredicates.reportedViaAggregatorAccount(null))
  }

  function testPredicatesWithoutBillingCenterDataKeepProductionValues() {
    assertFalse(AlbionRulePredicates.hasPriorCUEMatches(bean(null, null)))
    assertNull(AlbionRulePredicates.lookupEquivalentNewBusinessPrice(bean(null, null)))
  }
}

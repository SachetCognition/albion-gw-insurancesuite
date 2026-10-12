package albion.claims

uses gw.testharness.TestBase
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

class ClaimRiskPredicatesTest extends TestBase {

  private function date(yyyyMMdd : String) : Date {
    return new SimpleDateFormat("yyyyMMdd").parse(yyyyMMdd)
  }

  private function claim(inception : Date, loss : Date, reported : Date, source : String) : Claim {
    var policy = EasyMock.createNiceMock(Policy)
    EasyMock.expect(policy.EffectiveDate).andReturn(inception).anyTimes()
    var c = EasyMock.createNiceMock(Claim)
    EasyMock.expect(c.Policy).andReturn(policy).anyTimes()
    EasyMock.expect(c.LossDate).andReturn(loss).anyTimes()
    EasyMock.expect(c.ReportedDate).andReturn(reported).anyTimes()
    EasyMock.expect(c.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.replay(policy)
    EasyMock.replay(c)
    return c
  }

  private function exposureOf(c : Claim) : Exposure {
    var e = EasyMock.createNiceMock(Exposure)
    EasyMock.expect(e.Claim).andReturn(c).anyTimes()
    EasyMock.replay(e)
    return e
  }

  function testClaimOfResolvesOwningClaim() {
    var c = claim(null, null, null, null)
    assertSame(c, ClaimRiskPredicates.claimOf(c))
    assertSame(c, ClaimRiskPredicates.claimOf(exposureOf(c)))
    assertNull(ClaimRiskPredicates.claimOf(null))
    assertNull(ClaimRiskPredicates.claimOf("not a bean"))
  }

  function testDaysSinceInceptionUsesLossDate() {
    var c = claim(date("20240101"), date("20240111"), date("20240301"), null)
    assertEquals(10, ClaimRiskPredicates.daysSinceInception(c))
    assertEquals(10, ClaimRiskPredicates.daysSinceInception(exposureOf(c)))
  }

  function testDaysSinceInceptionFallsBackToReportedDate() {
    assertEquals(45, ClaimRiskPredicates.daysSinceInception(claim(date("20240101"), null, date("20240215"), null)))
  }

  function testLossBeforeInceptionIsNegative() {
    assertEquals(-5, ClaimRiskPredicates.daysSinceInception(claim(date("20240110"), date("20240105"), null, null)))
  }

  function testUnknownDatesKeepLegacyValue() {
    assertEquals(31, ClaimRiskPredicates.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, ClaimRiskPredicates.daysSinceInception(null))
    assertEquals(31, ClaimRiskPredicates.daysSinceInception(EasyMock.createNiceMock(KeyableBean)))
    assertEquals(31, ClaimRiskPredicates.daysSinceInception(claim(null, date("20240105"), null, null)))
    assertEquals(31, ClaimRiskPredicates.daysSinceInception(claim(date("20240101"), null, null, null)))
  }

  function testAggregatorAccountReadsClaimSourceSystem() {
    assertTrue(ClaimRiskPredicates.reportedViaAggregatorAccount(claim(null, null, null, "AGGR")))
    assertTrue(ClaimRiskPredicates.reportedViaAggregatorAccount(exposureOf(claim(null, null, null, " aggr "))))
    assertFalse(ClaimRiskPredicates.reportedViaAggregatorAccount(claim(null, null, null, "POLARIS")))
    assertFalse(ClaimRiskPredicates.reportedViaAggregatorAccount(claim(null, null, null, null)))
    assertFalse(ClaimRiskPredicates.reportedViaAggregatorAccount(null))
  }

  function testDataGapsKeepCurrentBehaviour() {
    var c = claim(date("20240101"), date("20240102"), null, "AGGR")
    assertFalse(ClaimRiskPredicates.hasPriorCUEMatches(c))
    assertNull(ClaimRiskPredicates.equivalentNewBusinessPrice(c))
  }
}

package albion.claims.common

uses gw.testharness.TestBase
uses java.text.SimpleDateFormat
uses java.util.Date
uses org.easymock.EasyMock

class AlbionClaimPredicatesTest extends TestBase {

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
    assertSame(c, AlbionClaimPredicates.claimOf(c))
    assertSame(c, AlbionClaimPredicates.claimOf(exposureOf(c)))
    assertNull(AlbionClaimPredicates.claimOf(null))
    assertNull(AlbionClaimPredicates.claimOf("not a bean"))
  }

  function testDaysSinceInceptionUsesLossDate() {
    var c = claim(date("20240101"), date("20240111"), date("20240301"), null)
    assertEquals(10, AlbionClaimPredicates.daysSinceInception(c))
    assertEquals(10, AlbionClaimPredicates.daysSinceInception(exposureOf(c)))
  }

  function testDaysSinceInceptionFallsBackToReportedDate() {
    assertEquals(45, AlbionClaimPredicates.daysSinceInception(claim(date("20240101"), null, date("20240215"), null)))
  }

  function testLossBeforeInceptionIsNegative() {
    assertEquals(-5, AlbionClaimPredicates.daysSinceInception(claim(date("20240110"), date("20240105"), null, null)))
  }

  function testUnknownDatesKeepLegacyValue() {
    assertEquals(31, AlbionClaimPredicates.UNKNOWN_DAYS_SINCE_INCEPTION)
    assertEquals(31, AlbionClaimPredicates.daysSinceInception(null))
    assertEquals(31, AlbionClaimPredicates.daysSinceInception(EasyMock.createNiceMock(KeyableBean)))
    assertEquals(31, AlbionClaimPredicates.daysSinceInception(claim(null, date("20240105"), null, null)))
    assertEquals(31, AlbionClaimPredicates.daysSinceInception(claim(date("20240101"), null, null, null)))
  }

  function testAggregatorAccountReadsClaimSourceSystem() {
    assertTrue(AlbionClaimPredicates.isAggregatorSourced(claim(null, null, null, "AGGR")))
    assertTrue(AlbionClaimPredicates.isAggregatorSourced(exposureOf(claim(null, null, null, " aggr "))))
    assertFalse(AlbionClaimPredicates.isAggregatorSourced(claim(null, null, null, "POLARIS")))
    assertFalse(AlbionClaimPredicates.isAggregatorSourced(claim(null, null, null, null)))
    assertFalse(AlbionClaimPredicates.isAggregatorSourced(null))
  }

  function testDataGapsKeepCurrentBehaviour() {
    var c = claim(date("20240101"), date("20240102"), null, "AGGR")
    assertFalse(AlbionClaimPredicates.hasPriorCueMatch(c))
    assertNull(AlbionClaimPredicates.equivalentNewBusinessPrice(c))
    var perils : List<String> = {"EscapeOfWater", "Flood"}
    assertSame(perils, AlbionClaimPredicates.perilCodes(c, perils))
  }

  function testAggregatorConstantMatchesSourceSystemCode() {
    assertEquals("AGGR", AlbionClaimPredicates.AGGREGATOR_SOURCE_SYSTEM)
  }
}

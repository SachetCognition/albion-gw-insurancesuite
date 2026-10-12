package albion.party.common

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap
uses org.easymock.EasyMock

class AlbionPartyPredicatesTest extends AlbionRuleTestBase {

  function testPostcodeAreaIsFirstTwoCharactersUpperCased() {
    assertEquals("BD", AlbionPartyPredicates.postcodeArea(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "bd7 1aa"})))
    assertEquals("B", AlbionPartyPredicates.postcodeArea(bean(new HashMap<String, Object>() {"RiskPostcode_Ext" -> "b"})))
    assertEquals("ZZ", AlbionPartyPredicates.postcodeArea(bean(new HashMap<String, Object>())))
  }

  function testFloodReCededOnlyWhenFlagIsTrue() {
    assertTrue(AlbionPartyPredicates.isFloodReCeded(bean(new HashMap<String, Object>() {"FloodReCeded_Ext" -> true})))
    assertFalse(AlbionPartyPredicates.isFloodReCeded(bean(new HashMap<String, Object>() {"FloodReCeded_Ext" -> false})))
    assertFalse(AlbionPartyPredicates.isFloodReCeded(bean(new HashMap<String, Object>())))
  }

  function testAggregatorSourcedReadsSourceSystemOnContact() {
    assertEquals("AGGR", AlbionPartyPredicates.AGGREGATOR_SOURCE_SYSTEM)
    assertTrue(AlbionPartyPredicates.isAggregatorSourced(aggregatorContact(new HashMap<String, Object>())))
    assertFalse(AlbionPartyPredicates.isAggregatorSourced(contactWithSource("POLARIS", new HashMap<String, Object>())))
    assertFalse(AlbionPartyPredicates.isAggregatorSourced(contactWithSource("aggr", new HashMap<String, Object>())))
    assertFalse(AlbionPartyPredicates.isAggregatorSourced(contactWithSource(null, new HashMap<String, Object>())))
  }

  function testAggregatorSourcedReadsSourceSystemOnContactNote() {
    var note = EasyMock.createNiceMock(ABContactNote)
    EasyMock.expect(note.SourceSystem_Ext).andStubReturn("AGGR")
    EasyMock.replay(note)
    assertTrue(AlbionPartyPredicates.isAggregatorSourced(note))
  }

  function testAggregatorSourcedFalseForOtherBeans() {
    assertFalse(AlbionPartyPredicates.isAggregatorSourced(bean(new HashMap<String, Object>() {"SourceSystem_Ext" -> "AGGR"})))
    assertFalse(AlbionPartyPredicates.isAggregatorSourced(null))
  }

  function testDataGapPredicatesKeepProductionValues() {
    var b = aggregatorContact(new HashMap<String, Object>())
    assertEquals(31, AlbionPartyPredicates.daysSinceInception(b))
    assertEquals(AlbionPartyPredicates.UNKNOWN_DAYS_SINCE_INCEPTION, AlbionPartyPredicates.daysSinceInception(null))
    assertFalse(AlbionPartyPredicates.hasPriorCueMatch(b))
    assertNull(AlbionPartyPredicates.equivalentNewBusinessPrice(b))
    var perils : List<String> = {"Flood", "Subsidence"}
    assertEquals(perils, AlbionPartyPredicates.perilCodes(b, perils))
  }
}

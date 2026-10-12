package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionHouseholdLinkHelper. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionHouseholdLinkHelperTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper_v1(null))
    assertTrue(AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> null})))
  }
}

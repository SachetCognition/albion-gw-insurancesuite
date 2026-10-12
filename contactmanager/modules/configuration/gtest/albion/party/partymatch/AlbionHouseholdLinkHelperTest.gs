package albion.party.partymatch

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionHouseholdLinkHelper. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 * TotalIncurred_Ext / EstimatedLoss_Ext are ClaimCenter claim data that ContactManager does not hold (data gap), so
 * amount-based cases assert that the amount does not change the outcome.
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
    assertEquals(AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"})), AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), AlbionHouseholdLinkHelper.evaluateAlbionHouseholdLinkHelper(bean(new HashMap<String, Object>() {"EstimatedLoss_Ext" -> null})))
  }
}

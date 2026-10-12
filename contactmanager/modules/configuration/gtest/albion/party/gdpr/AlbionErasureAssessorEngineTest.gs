package albion.party.gdpr

uses albion.testsupport.AlbionRuleTestBase
uses java.util.HashMap

/**
 * Characterization tests for AlbionErasureAssessorEngine. Expected actions encode current production behaviour,
 * including the legacy-pinned thresholds and the ContactManager predicate values (see AlbionPartyPredicates).
 */
class AlbionErasureAssessorEngineTest extends AlbionRuleTestBase {

  function testNullBeanReturnsNoActions() {
    assertTrue(AlbionErasureAssessorEngine.evaluateAlbionErasureAssessorEngine(null).Empty)
  }

  function testV1ContractTrueForAnyNonNullRecord() {
    assertFalse(AlbionErasureAssessorEngine.evaluateAlbionErasureAssessorEngine_v1(null))
    assertTrue(AlbionErasureAssessorEngine.evaluateAlbionErasureAssessorEngine_v1(bean(new HashMap<String, Object>())))
  }

  function testNoNewBusinessPriceInContactManagerMeansNoPriceWalkBreach() {
    assertEquals(actions(new String[0]), AlbionErasureAssessorEngine.evaluateAlbionErasureAssessorEngine(bean(new HashMap<String, Object>() {"TotalIncurred_Ext" -> 1000000bd, "BrandCode_Ext" -> "ALBDIR"})))
    assertEquals(actions(new String[0]), AlbionErasureAssessorEngine.evaluateAlbionErasureAssessorEngine(bean(new HashMap<String, Object>() {"TotalIncurred_Ext" -> null})))
  }
}

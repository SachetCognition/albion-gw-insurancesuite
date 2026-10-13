package albion.policy.renewal

uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.util.Map

/*******************************************************************************
 * AlbionRenewalEligibilityRulesTest
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version: block codes, order, truthiness, null bean
 ******************************************************************************/
class AlbionRenewalEligibilityRulesTest extends TestBase {

  static final var ALL_CODES : String =
      "OPT_OUT,MARKETING_SUPPRESSED,SANCTIONS_HOLD,VULNERABILITY_REVIEW,BEREAVEMENT_HOLD,GDPR_ERASURE_PENDING"

  private function codes(fields : Map<String, Object>) : String {
    return AlbionPolicyTestBeans.outcomes(AlbionRenewalEligibilityRules.evaluate(AlbionPolicyTestBeans.bean(fields)))
  }

  function testNullBeanHasNoCodesAndIsNotEligible() {
    assertEquals(0, AlbionRenewalEligibilityRules.evaluate(null).size())
    assertFalse(AlbionRenewalEligibilityRules.isEligible(null))
  }

  function testUnpopulatedPeriodIsEligible() {
    assertEquals("", codes(null))
    assertTrue(AlbionRenewalEligibilityRules.isEligible(AlbionPolicyTestBeans.bean(null)))
  }

  function testOptOut() {
    assertEquals("OPT_OUT", codes({"RenewalOptOut_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"RenewalOptOut_Ext" -> Boolean.FALSE}))
  }

  function testMarketingSuppressed() {
    assertEquals("MARKETING_SUPPRESSED", codes({"MarketingSuppressed_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"MarketingSuppressed_Ext" -> Boolean.FALSE}))
  }

  function testSanctionsHold() {
    assertEquals("SANCTIONS_HOLD", codes({"SanctionsHold_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"SanctionsHold_Ext" -> Boolean.FALSE}))
  }

  function testVulnerabilityReviewReadsExistingFG211Flag() {
    assertEquals("VULNERABILITY_REVIEW", codes({"VulnerabilityNoted_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"VulnerabilityNoted_Ext" -> Boolean.FALSE}))
  }

  function testBereavementHold() {
    assertEquals("BEREAVEMENT_HOLD", codes({"BereavementHold_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"BereavementHold_Ext" -> Boolean.FALSE}))
  }

  function testGdprErasurePending() {
    assertEquals("GDPR_ERASURE_PENDING", codes({"GDPRErasurePending_Ext" -> Boolean.TRUE}))
    assertEquals("", codes({"GDPRErasurePending_Ext" -> Boolean.FALSE}))
  }

  function testAllCodesInFixedOrder() {
    assertEquals(ALL_CODES, codes({
        "GDPRErasurePending_Ext" -> Boolean.TRUE,
        "BereavementHold_Ext" -> Boolean.TRUE,
        "VulnerabilityNoted_Ext" -> Boolean.TRUE,
        "SanctionsHold_Ext" -> Boolean.TRUE,
        "MarketingSuppressed_Ext" -> Boolean.TRUE,
        "RenewalOptOut_Ext" -> Boolean.TRUE}))
  }

  function testCombinationsKeepContractOrder() {
    assertEquals("OPT_OUT,GDPR_ERASURE_PENDING",
        codes({"GDPRErasurePending_Ext" -> Boolean.TRUE, "RenewalOptOut_Ext" -> Boolean.TRUE}))
    assertEquals("SANCTIONS_HOLD,VULNERABILITY_REVIEW",
        codes({"VulnerabilityNoted_Ext" -> Boolean.TRUE, "SanctionsHold_Ext" -> Boolean.TRUE, "BereavementHold_Ext" -> Boolean.FALSE}))
    assertEquals("MARKETING_SUPPRESSED,BEREAVEMENT_HOLD",
        codes({"BereavementHold_Ext" -> "Y", "MarketingSuppressed_Ext" -> Boolean.TRUE, "RenewalOptOut_Ext" -> "N"}))
  }

  function testStringValuesThatCountAsSet() {
    for (v in {"Y", "y", "TRUE", "true", "True", "1", " Y ", " true\t"}) {
      assertEquals("value [" + v + "]", "OPT_OUT", codes({"RenewalOptOut_Ext" -> v}))
    }
  }

  function testStringValuesThatDoNotCountAsSet() {
    for (v in {"N", "n", "FALSE", "0", "", " ", "YES", "T", "11", "Y1"}) {
      assertEquals("value [" + v + "]", "", codes({"RenewalOptOut_Ext" -> v}))
    }
  }

  function testOtherValueTypesDoNotCountAsSet() {
    assertEquals("", codes({"RenewalOptOut_Ext" -> Integer.valueOf(1)}))
    assertEquals("", codes({"SanctionsHold_Ext" -> 1bd}))
    assertEquals("", codes({"BereavementHold_Ext" -> 'Y'}))
  }

  function testIsEligible() {
    assertTrue(AlbionRenewalEligibilityRules.isEligible(AlbionPolicyTestBeans.bean({"RenewalOptOut_Ext" -> Boolean.FALSE})))
    assertFalse(AlbionRenewalEligibilityRules.isEligible(AlbionPolicyTestBeans.bean({"RenewalOptOut_Ext" -> Boolean.TRUE})))
    assertFalse(AlbionRenewalEligibilityRules.isEligible(AlbionPolicyTestBeans.bean({"VulnerabilityNoted_Ext" -> "1"})))
  }

  function testUnrelatedFieldsDoNotBlock() {
    assertEquals("", codes({"FeedStatus_Ext" -> "PENDING", "FloodReCeded_Ext" -> Boolean.TRUE, "SumInsured_Ext" -> 250000bd}))
  }
}

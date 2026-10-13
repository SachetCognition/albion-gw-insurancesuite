package albion.policy.renewal

uses gw.testharness.TestBase

/*******************************************************************************
 * AlbionRenewalEligibilityActivitiesTest
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version: block code to activity pattern mapping
 ******************************************************************************/
class AlbionRenewalEligibilityActivitiesTest extends TestBase {

  function testEachCodeMapsToItsPattern() {
    assertEquals("renewal_suppression", AlbionRenewalEligibilityActivities.patternFor("OPT_OUT"))
    assertEquals("renewal_suppression", AlbionRenewalEligibilityActivities.patternFor("MARKETING_SUPPRESSED"))
    assertEquals("renewal_suppression", AlbionRenewalEligibilityActivities.patternFor("GDPR_ERASURE_PENDING"))
    assertEquals("renewal_sanctions_hold", AlbionRenewalEligibilityActivities.patternFor("SANCTIONS_HOLD"))
    assertEquals("renewal_vulnerability_review", AlbionRenewalEligibilityActivities.patternFor("VULNERABILITY_REVIEW"))
    assertEquals("renewal_bereavement_hold", AlbionRenewalEligibilityActivities.patternFor("BEREAVEMENT_HOLD"))
    assertNull(AlbionRenewalEligibilityActivities.patternFor("PRICE_WALK_BREACH"))
    assertNull(AlbionRenewalEligibilityActivities.patternFor(null))
  }

  function testOnePatternPerDistinctGroupInFirstSeenOrder() {
    var codes = {"OPT_OUT", "MARKETING_SUPPRESSED", "SANCTIONS_HOLD", "VULNERABILITY_REVIEW", "BEREAVEMENT_HOLD", "GDPR_ERASURE_PENDING"}
    assertEquals("renewal_suppression,renewal_sanctions_hold,renewal_vulnerability_review,renewal_bereavement_hold",
        String.join(",", AlbionRenewalEligibilityActivities.patternsFor(codes)))
  }

  function testNoCodesNoPatterns() {
    assertEquals(0, AlbionRenewalEligibilityActivities.patternsFor({}).size())
    assertEquals(0, AlbionRenewalEligibilityActivities.patternsFor(null).size())
  }
}

package albion.claims.perilhandlers.cpkg

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class PublicLiabilityRecoveryHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("TotalIncurred_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler_v1(null))
    assertTrue(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: PersonalAccident, MisfuelCover, Storm, Subsidence
    var bradfordFloodRe = new ArrayList<String>(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, bradfordFloodRe)
    var leedsNotCeded = new ArrayList<String>(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, leedsNotCeded)
    var noPostcode = new ArrayList<String>(PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, noPostcode)
  }

  function testSubsidenceSurgeTriageFromJuly() {
    var surge = Calendar.getInstance().get(Calendar.MONTH) > 5
    assertEquals(surge, PublicLiabilityRecoveryHandler.evaluatePublicLiabilityRecoveryHandler(bean(0bd, null, null, null)).contains("SUBSIDENCE_SURGE_TRIAGE"))
  }
}

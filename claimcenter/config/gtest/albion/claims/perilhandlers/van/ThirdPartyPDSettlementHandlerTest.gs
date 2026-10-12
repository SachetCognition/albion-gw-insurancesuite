package albion.claims.perilhandlers.van

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class ThirdPartyPDSettlementHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("SumInsured_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler_v1(null))
    assertTrue(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: Subsidence, UninsuredLoss, EscapeOfWater, Theft
    var bradfordFloodRe = new ArrayList<String>(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK", "EOW_SURVEYOR_MANDATORY"}, bradfordFloodRe)
    var leedsNotCeded = new ArrayList<String>(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, leedsNotCeded)
    var noPostcode = new ArrayList<String>(ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, noPostcode)
  }

  function testSubsidenceSurgeTriageFromJuly() {
    var surge = Calendar.getInstance().get(Calendar.MONTH) > 5
    assertEquals(surge, ThirdPartyPDSettlementHandler.evaluateThirdPartyPDSettlementHandler(bean(0bd, null, null, null)).contains("SUBSIDENCE_SURGE_TRIAGE"))
  }
}

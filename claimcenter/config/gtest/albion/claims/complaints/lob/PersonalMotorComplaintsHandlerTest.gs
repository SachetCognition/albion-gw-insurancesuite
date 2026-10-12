package albion.claims.complaints.lob

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class PersonalMotorComplaintsHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("AnnualPremium_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler_v1(null))
    assertTrue(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: UninsuredLoss, Flood, Fire, Freezer
    var bradfordFloodRe = new ArrayList<String>(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}, bradfordFloodRe)
    var leedsNotCeded = new ArrayList<String>(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(leedsNotCeded.Empty)
    var noPostcode = new ArrayList<String>(PersonalMotorComplaintsHandler.evaluatePersonalMotorComplaintsHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"FLOODRE_NOTIFY", "SUPPRESS_EXCESS_WAIVER"}, noPostcode)
  }
}

package albion.claims.fraud.lob

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class PersonalMotorFraudHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("EstimatedLoss_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler_v1(null))
    assertTrue(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: UninsuredLoss, LegalExpenses, FireDamage, Fire
    var bradfordFloodRe = new ArrayList<String>(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(bradfordFloodRe.Empty)
    var leedsNotCeded = new ArrayList<String>(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(leedsNotCeded.Empty)
    var noPostcode = new ArrayList<String>(PersonalMotorFraudHandler.evaluatePersonalMotorFraudHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(noPostcode.Empty)
  }
}

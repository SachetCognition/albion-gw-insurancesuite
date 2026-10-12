package albion.claims.perilhandlers.el

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class EmployersLiabilityNotificationHandlerTest extends TestBase {

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
    assertTrue(EmployersLiabilityNotificationHandler.evaluateEmployersLiabilityNotificationHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(EmployersLiabilityNotificationHandler.evaluateEmployersLiabilityNotificationHandler_v1(null))
    assertTrue(EmployersLiabilityNotificationHandler.evaluateEmployersLiabilityNotificationHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(EmployersLiabilityNotificationHandler.evaluateEmployersLiabilityNotificationHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(EmployersLiabilityNotificationHandler.evaluateEmployersLiabilityNotificationHandler(bean(null, null, null, null)).Empty)
  }
}

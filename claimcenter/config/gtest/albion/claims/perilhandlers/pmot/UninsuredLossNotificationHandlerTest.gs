package albion.claims.perilhandlers.pmot

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class UninsuredLossNotificationHandlerTest extends TestBase {

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
    assertTrue(UninsuredLossNotificationHandler.evaluateUninsuredLossNotificationHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(UninsuredLossNotificationHandler.evaluateUninsuredLossNotificationHandler_v1(null))
    assertTrue(UninsuredLossNotificationHandler.evaluateUninsuredLossNotificationHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(UninsuredLossNotificationHandler.evaluateUninsuredLossNotificationHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(UninsuredLossNotificationHandler.evaluateUninsuredLossNotificationHandler(bean(null, null, null, null)).Empty)
  }
}

package albion.claims.perilhandlers.pet

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class VetFeesValidationHandlerTest extends TestBase {

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
    assertTrue(VetFeesValidationHandler.evaluateVetFeesValidationHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(VetFeesValidationHandler.evaluateVetFeesValidationHandler_v1(null))
    assertTrue(VetFeesValidationHandler.evaluateVetFeesValidationHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(VetFeesValidationHandler.evaluateVetFeesValidationHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(VetFeesValidationHandler.evaluateVetFeesValidationHandler(bean(null, null, null, null)).Empty)
  }
}

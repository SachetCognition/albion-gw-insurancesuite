package albion.claims.perilhandlers.cpkg

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class FloodRecoveryHandlerTest extends TestBase {

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
    assertTrue(FloodRecoveryHandler.evaluateFloodRecoveryHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(FloodRecoveryHandler.evaluateFloodRecoveryHandler_v1(null))
    assertTrue(FloodRecoveryHandler.evaluateFloodRecoveryHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(FloodRecoveryHandler.evaluateFloodRecoveryHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(FloodRecoveryHandler.evaluateFloodRecoveryHandler(bean(null, null, null, null)).Empty)
  }
}

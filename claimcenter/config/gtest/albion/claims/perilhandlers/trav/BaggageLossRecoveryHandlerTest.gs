package albion.claims.perilhandlers.trav

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class BaggageLossRecoveryHandlerTest extends TestBase {

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
    assertTrue(BaggageLossRecoveryHandler.evaluateBaggageLossRecoveryHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(BaggageLossRecoveryHandler.evaluateBaggageLossRecoveryHandler_v1(null))
    assertTrue(BaggageLossRecoveryHandler.evaluateBaggageLossRecoveryHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(BaggageLossRecoveryHandler.evaluateBaggageLossRecoveryHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(BaggageLossRecoveryHandler.evaluateBaggageLossRecoveryHandler(bean(null, null, null, null)).Empty)
  }
}

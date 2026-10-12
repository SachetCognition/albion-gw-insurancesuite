package albion.claims.perilhandlers.cpkg

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class PublicLiabilitySettlementHandlerTest extends TestBase {

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
    assertTrue(PublicLiabilitySettlementHandler.evaluatePublicLiabilitySettlementHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(PublicLiabilitySettlementHandler.evaluatePublicLiabilitySettlementHandler_v1(null))
    assertTrue(PublicLiabilitySettlementHandler.evaluatePublicLiabilitySettlementHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(PublicLiabilitySettlementHandler.evaluatePublicLiabilitySettlementHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(PublicLiabilitySettlementHandler.evaluatePublicLiabilitySettlementHandler(bean(null, null, null, null)).Empty)
  }
}

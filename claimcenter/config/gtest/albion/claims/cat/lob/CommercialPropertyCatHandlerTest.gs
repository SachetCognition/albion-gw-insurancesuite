package albion.claims.cat.lob

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class CommercialPropertyCatHandlerTest extends TestBase {

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
    assertTrue(CommercialPropertyCatHandler.evaluateCommercialPropertyCatHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(CommercialPropertyCatHandler.evaluateCommercialPropertyCatHandler_v1(null))
    assertTrue(CommercialPropertyCatHandler.evaluateCommercialPropertyCatHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(CommercialPropertyCatHandler.evaluateCommercialPropertyCatHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(CommercialPropertyCatHandler.evaluateCommercialPropertyCatHandler(bean(null, null, null, null)).Empty)
  }
}

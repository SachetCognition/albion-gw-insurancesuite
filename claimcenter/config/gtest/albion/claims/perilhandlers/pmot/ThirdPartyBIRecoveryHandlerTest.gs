package albion.claims.perilhandlers.pmot

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses org.easymock.EasyMock

class ThirdPartyBIRecoveryHandlerTest extends TestBase {

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
    assertTrue(ThirdPartyBIRecoveryHandler.evaluateThirdPartyBIRecoveryHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(ThirdPartyBIRecoveryHandler.evaluateThirdPartyBIRecoveryHandler_v1(null))
    assertTrue(ThirdPartyBIRecoveryHandler.evaluateThirdPartyBIRecoveryHandler_v1(bean(null, null, null, null)))
  }

  function testNoPriceWalkBreachWithoutNewBusinessPrice() {
    // ClaimCenter holds no equivalent new-business price, so the PS21/5 check cannot fire here.
    assertTrue(ThirdPartyBIRecoveryHandler.evaluateThirdPartyBIRecoveryHandler(bean(999999999bd, "ALBDIR", null, null)).Empty)
    assertTrue(ThirdPartyBIRecoveryHandler.evaluateThirdPartyBIRecoveryHandler(bean(null, null, null, null)).Empty)
  }
}

package albion.claims.perilhandlers.van

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class ThirdPartyBIReservingHandlerTest extends TestBase {

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
    assertTrue(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler_v1(null))
    assertTrue(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: UninsuredLoss, Windscreen, Storm, ThirdPartyBI
    var bradfordFloodRe = new ArrayList<String>(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(bradfordFloodRe.Empty)
    var leedsNotCeded = new ArrayList<String>(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(leedsNotCeded.Empty)
    var noPostcode = new ArrayList<String>(ThirdPartyBIReservingHandler.evaluateThirdPartyBIReservingHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(noPostcode.Empty)
  }
}

package albion.claims.perilhandlers.home

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class FireDamageSettlementHandlerTest extends TestBase {

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
    assertTrue(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler_v1(null))
    assertTrue(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: FireDamage, TheftHome, MisfuelCover, ThirdPartyBI
    var bradfordFloodRe = new ArrayList<String>(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(bradfordFloodRe.Empty)
    var leedsNotCeded = new ArrayList<String>(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(leedsNotCeded.Empty)
    var noPostcode = new ArrayList<String>(FireDamageSettlementHandler.evaluateFireDamageSettlementHandler(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertTrue(noPostcode.Empty)
  }
}

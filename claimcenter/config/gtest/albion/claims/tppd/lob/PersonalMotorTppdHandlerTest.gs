package albion.claims.tppd.lob

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.text.SimpleDateFormat
uses java.util.Date
uses java.util.HashMap
uses org.easymock.EasyMock

class PersonalMotorTppdHandlerTest extends TestBase {

  private function bean(amount : BigDecimal, brand : String, postcode : String, floodReCeded : Boolean) : KeyableBean {
    var b = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(b.getFieldValue("SumInsured_Ext")).andReturn(amount).anyTimes()
    EasyMock.expect(b.getFieldValue("BrandCode_Ext")).andReturn(brand).anyTimes()
    EasyMock.expect(b.getFieldValue("RiskPostcode_Ext")).andReturn(postcode).anyTimes()
    EasyMock.expect(b.getFieldValue("FloodReCeded_Ext")).andReturn(floodReCeded).anyTimes()
    EasyMock.replay(b)
    return b
  }

  private function withConfig(key : String, value : String, body : block()) {
    var values = new HashMap<String, String>()
    if (key != null) {
      values.put(AlbionCentre.PROPERTY_PREFIX + "." + key, value)
    }
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      body()
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  private function claimBean(daysAfterInception : int, sourceSystem : String) : Claim {
    var inception = new SimpleDateFormat("yyyyMMdd").parse("20240101")
    var policy = EasyMock.createNiceMock(Policy)
    EasyMock.expect(policy.EffectiveDate).andReturn(inception).anyTimes()
    EasyMock.replay(policy)
    var c = EasyMock.createNiceMock(Claim)
    EasyMock.expect(c.Policy).andReturn(policy).anyTimes()
    EasyMock.expect(c.LossDate).andReturn(new Date(inception.Time + daysAfterInception * 86400000L)).anyTimes()
    EasyMock.expect(c.SourceSystem_Ext).andReturn(sourceSystem).anyTimes()
    EasyMock.replay(c)
    return c
  }

  function testNullBeanReturnsNoActions() {
    assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler_v1(null))
    assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler_v1(bean(null, null, null, null)))
  }

  function testNoClaimDataScoresZero() {
    withConfig(null, null, \ -> {
      assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(bean(1000000bd, "ALBDIR", null, null)).Empty)
    })
  }

  function testSingleSignalStaysBelowWatchThreshold() {
    withConfig(null, null, \ -> {
      assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(10, "GW")).Empty)
      assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(400, "AGGR")).Empty)
    })
  }

  function testEarlyAggregatorClaimIsWatched() {
    withConfig(null, null, \ -> {
      assertEquals({"FRAUD_WATCH"}, PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(10, "AGGR")))
      assertEquals({"FRAUD_WATCH"}, PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(29, "aggr")))
      assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(30, "AGGR")).Empty)
    })
  }

  function testReferScoreComesFromConfig() {
    withConfig(AlbionConfigService.KEY_FRAUD_REFER_SCORE, "35", \ -> {
      assertEquals({"SIU_REFER"}, PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(10, "AGGR")))
    })
    withConfig(AlbionConfigService.KEY_FRAUD_REFER_SCORE, "25", \ -> {
      assertEquals({"SIU_REFER"}, PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(10, "GW")))
      assertTrue(PersonalMotorTppdHandler.evaluatePersonalMotorTppdHandler(claimBean(400, "AGGR")).Empty)
    })
  }
}

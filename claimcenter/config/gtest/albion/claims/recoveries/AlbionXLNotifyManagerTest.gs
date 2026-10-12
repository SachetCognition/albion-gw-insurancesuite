package albion.claims.recoveries

uses gw.testharness.TestBase
uses java.math.BigDecimal
uses java.util.ArrayList
uses java.util.Calendar
uses org.easymock.EasyMock

class AlbionXLNotifyManagerTest extends TestBase {

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
    assertTrue(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager(null).Empty)
  }

  function testV1ContractIsNonNullCheck() {
    assertFalse(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager_v1(null))
    assertTrue(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager_v1(bean(null, null, null, null)))
  }

  function testHandlerPerilRules() {
    // handler perils: Freezer, Subsidence, Fire, ThirdPartyPD
    var bradfordFloodRe = new ArrayList<String>(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager(bean(0bd, null, "bd7 1AA", true)))
    bradfordFloodRe.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, bradfordFloodRe)
    var leedsNotCeded = new ArrayList<String>(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager(bean(0bd, null, "LS1 4AP", false)))
    leedsNotCeded.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, leedsNotCeded)
    var noPostcode = new ArrayList<String>(AlbionXLNotifyManager.evaluateAlbionXLNotifyManager(bean(0bd, null, null, true)))
    noPostcode.remove("SUBSIDENCE_SURGE_TRIAGE")
    assertEquals({"SUBSIDENCE_DESK"}, noPostcode)
  }

  function testSubsidenceSurgeTriageFromJuly() {
    var surge = Calendar.getInstance().get(Calendar.MONTH) > 5
    assertEquals(surge, AlbionXLNotifyManager.evaluateAlbionXLNotifyManager(bean(0bd, null, null, null)).contains("SUBSIDENCE_SURGE_TRIAGE"))
  }
}

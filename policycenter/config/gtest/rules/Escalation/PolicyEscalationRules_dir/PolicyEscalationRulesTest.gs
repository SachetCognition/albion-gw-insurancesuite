package rules.Escalation.PolicyEscalationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolicyEscalationRulesTest extends TestBase {

  private function period(brand : BrandCode_Ext, source : String, feed : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(p.BrandCode_Ext).andReturn(brand).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.expect(p.FeedStatus_Ext).andReturn(feed).anyTimes()
    EasyMock.replay({p})
    return p
  }

  function testAGIESCA003FiresForPolarisMigrated() {
    assertTrue(R01_AGI_ESCA_003.doCondition(period(BrandCode_Ext.TC_ALBDIR, "POLARIS", "SENT")))
  }

  function testAGIESCA003DoesNotFireForGwNative() {
    assertFalse(R01_AGI_ESCA_003.doCondition(period(BrandCode_Ext.TC_ALBDIR, "GW", "SENT")))
  }
}

package rules.Assignment.PolicyAssignmentRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolicyAssignmentRulesTest extends TestBase {

  private function period(brand : BrandCode_Ext, source : String, feed : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(p.BrandCode_Ext).andReturn(brand).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.expect(p.FeedStatus_Ext).andReturn(feed).anyTimes()
    EasyMock.replay({p})
    return p
  }

  function testAGIASSI006FiresForHeritBrand() {
    assertTrue(R01_AGI_ASSI_006.doCondition(period(BrandCode_Ext.TC_HERIT, "GW", "SENT")))
  }

  function testAGIASSI006DoesNotFireForNonHeritBrand() {
    assertFalse(R01_AGI_ASSI_006.doCondition(period(BrandCode_Ext.TC_ALBDIR, "GW", "SENT")))
  }
}

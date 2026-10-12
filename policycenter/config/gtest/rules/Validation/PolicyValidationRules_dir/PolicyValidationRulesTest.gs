package rules.Validation.PolicyValidationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolicyValidationRulesTest extends TestBase {

  private function period(brand : BrandCode_Ext, source : String, feed : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(p.BrandCode_Ext).andReturn(brand).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.expect(p.FeedStatus_Ext).andReturn(feed).anyTimes()
    EasyMock.replay({p})
    return p
  }

  function testAGIVALI010FiresForAlbbrkPolarisMigrated() {
    assertTrue(R01_AGI_VALI_010.doCondition(period(BrandCode_Ext.TC_ALBBRK, "POLARIS", "SENT")))
  }

  function testAGIVALI010DoesNotFireForAlbdirPolarisMigrated() {
    assertFalse(R01_AGI_VALI_010.doCondition(period(BrandCode_Ext.TC_ALBDIR, "POLARIS", "SENT")))
  }
}

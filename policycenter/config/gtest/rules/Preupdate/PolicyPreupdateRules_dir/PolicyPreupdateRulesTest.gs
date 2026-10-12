package rules.Preupdate.PolicyPreupdateRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolicyPreupdateRulesTest extends TestBase {

  private function period(brand : BrandCode_Ext, source : String, feed : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(p.BrandCode_Ext).andReturn(brand).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.expect(p.FeedStatus_Ext).andReturn(feed).anyTimes()
    EasyMock.replay({p})
    return p
  }

  function testAGIPREU006FiresForNonAlbbrkBrand() {
    assertTrue(R01_AGI_PREU_006.doCondition(period(BrandCode_Ext.TC_ALBDIR, "GW", "SENT")))
  }

  function testAGIPREU006DoesNotFireForAlbbrkBrand() {
    assertFalse(R01_AGI_PREU_006.doCondition(period(BrandCode_Ext.TC_ALBBRK, "GW", "SENT")))
  }
}

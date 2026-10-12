package rules.Segmentation.PolicySegmentationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolicySegmentationRulesTest extends TestBase {

  private function period(brand : BrandCode_Ext, source : String, feed : String) : PolicyPeriod {
    var p = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(p.BrandCode_Ext).andReturn(brand).anyTimes()
    EasyMock.expect(p.SourceSystem_Ext).andReturn(source).anyTimes()
    EasyMock.expect(p.FeedStatus_Ext).andReturn(feed).anyTimes()
    EasyMock.replay({p})
    return p
  }

  function testAGISEGM003FiresForPolarisMigratedNotPending() {
    assertTrue(R01_AGI_SEGM_003.doCondition(period(BrandCode_Ext.TC_ALBDIR, "POLARIS", "SENT")))
  }

  function testAGISEGM003DoesNotFireForPolarisMigratedAlreadyPending() {
    assertFalse(R01_AGI_SEGM_003.doCondition(period(BrandCode_Ext.TC_ALBDIR, "POLARIS", "PENDING")))
  }
}

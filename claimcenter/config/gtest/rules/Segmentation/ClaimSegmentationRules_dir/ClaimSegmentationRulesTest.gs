package rules.Segmentation.ClaimSegmentationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class ClaimSegmentationRulesTest extends TestBase {

  function testR01_AGI_SEGM_011FiresOnlyWhenAllConditionsHold() {
    var matching = EasyMock.createNiceMock(Claim)
    EasyMock.expect(matching.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBBRK).anyTimes()
    EasyMock.expect(matching.SourceSystem_Ext).andReturn("GW").anyTimes()
    EasyMock.replay(matching)
    assertTrue(R01_AGI_SEGM_011.doCondition(matching))
    var other = EasyMock.createNiceMock(Claim)
    EasyMock.expect(other.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBDIR).anyTimes()
    EasyMock.expect(other.SourceSystem_Ext).andReturn("GW").anyTimes()
    EasyMock.replay(other)
    assertFalse(R01_AGI_SEGM_011.doCondition(other))
  }
}

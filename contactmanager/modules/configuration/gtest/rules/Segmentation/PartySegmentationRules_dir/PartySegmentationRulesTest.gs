package rules.Segmentation.PartySegmentationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PartySegmentationRulesTest extends TestBase {

  function testRuleFiresForMatchingContact() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn("ALBBRK")
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(null)
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertTrue(AGISEGM001.doCondition(c))
  }

  function testRuleDoesNotFireOtherwise() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn("ALBDIR")
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(null)
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertFalse(AGISEGM001.doCondition(c))
  }
}

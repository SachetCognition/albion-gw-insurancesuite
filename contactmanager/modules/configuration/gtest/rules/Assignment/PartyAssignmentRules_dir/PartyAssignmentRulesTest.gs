package rules.Assignment.PartyAssignmentRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PartyAssignmentRulesTest extends TestBase {

  function testRuleFiresForMatchingContact() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn("HERIT")
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(null)
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertTrue(AGIASSI001.doCondition(c))
  }

  function testRuleDoesNotFireOtherwise() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn("ALBDIR")
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(null)
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertFalse(AGIASSI001.doCondition(c))
  }
}

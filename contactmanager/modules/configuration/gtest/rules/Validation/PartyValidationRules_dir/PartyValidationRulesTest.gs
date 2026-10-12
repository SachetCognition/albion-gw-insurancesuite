package rules.Validation.PartyValidationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PartyValidationRulesTest extends TestBase {

  function testRuleFiresForMatchingContact() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn(null)
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn(null)
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertTrue(AGIVALI002.doCondition(c))
  }
}

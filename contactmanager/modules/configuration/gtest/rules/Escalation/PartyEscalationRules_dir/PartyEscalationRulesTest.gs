package rules.Escalation.PartyEscalationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PartyEscalationRulesTest extends TestBase {

  function testRuleFiresForMatchingContact() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn(null)
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn("POLARIS")
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertTrue(AGIESCA001.doCondition(c))
  }

  function testRuleDoesNotFireOtherwise() {
    var c = EasyMock.createNiceMock(ABContact)
    EasyMock.expect(c.BrandCode_Ext).andStubReturn(null)
    EasyMock.expect(c.SourceSystem_Ext).andStubReturn("GW")
    EasyMock.expect(c.FeedStatus_Ext).andStubReturn(null)
    EasyMock.replay(c)
    assertFalse(AGIESCA001.doCondition(c))
  }
}

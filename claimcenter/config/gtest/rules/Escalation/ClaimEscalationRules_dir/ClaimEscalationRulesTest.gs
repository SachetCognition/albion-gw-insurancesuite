package rules.Escalation.ClaimEscalationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class ClaimEscalationRulesTest extends TestBase {

  function testR01_AGI_ESCA_005FiresOnlyWhenAllConditionsHold() {
    var matching = EasyMock.createNiceMock(Claim)
    EasyMock.expect(matching.BrandCode_Ext).andReturn(BrandCode_Ext.TC_HERIT).anyTimes()
    EasyMock.expect(matching.FeedStatus_Ext).andReturn("PENDING").anyTimes()
    EasyMock.expect(matching.SourceSystem_Ext).andReturn("GW").anyTimes()
    EasyMock.replay(matching)
    assertTrue(R01_AGI_ESCA_005.doCondition(matching))
    var other = EasyMock.createNiceMock(Claim)
    EasyMock.expect(other.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBDIR).anyTimes()
    EasyMock.expect(other.FeedStatus_Ext).andReturn("PENDING").anyTimes()
    EasyMock.expect(other.SourceSystem_Ext).andReturn("GW").anyTimes()
    EasyMock.replay(other)
    assertFalse(R01_AGI_ESCA_005.doCondition(other))
  }
}

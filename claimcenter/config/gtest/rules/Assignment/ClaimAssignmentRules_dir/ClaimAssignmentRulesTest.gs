package rules.Assignment.ClaimAssignmentRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class ClaimAssignmentRulesTest extends TestBase {

  function testR01_AGI_ASSI_002FiresOnlyWhenAllConditionsHold() {
    var matching = EasyMock.createNiceMock(Claim)
    EasyMock.expect(matching.BrandCode_Ext).andReturn(BrandCode_Ext.TC_HERIT).anyTimes()
    EasyMock.replay(matching)
    assertTrue(R01_AGI_ASSI_002.doCondition(matching))
    var other = EasyMock.createNiceMock(Claim)
    EasyMock.expect(other.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBDIR).anyTimes()
    EasyMock.replay(other)
    assertFalse(R01_AGI_ASSI_002.doCondition(other))
  }
}

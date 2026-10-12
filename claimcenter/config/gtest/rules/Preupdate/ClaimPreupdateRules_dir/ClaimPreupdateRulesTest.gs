package rules.Preupdate.ClaimPreupdateRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class ClaimPreupdateRulesTest extends TestBase {

  function testR01_AGI_PREU_001FiresOnlyWhenAllConditionsHold() {
    var matching = EasyMock.createNiceMock(Claim)
    EasyMock.expect(matching.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBBRK).anyTimes()
    EasyMock.replay(matching)
    assertTrue(R01_AGI_PREU_001.doCondition(matching))
    var other = EasyMock.createNiceMock(Claim)
    EasyMock.expect(other.BrandCode_Ext).andReturn(BrandCode_Ext.TC_ALBDIR).anyTimes()
    EasyMock.replay(other)
    assertFalse(R01_AGI_PREU_001.doCondition(other))
  }
}

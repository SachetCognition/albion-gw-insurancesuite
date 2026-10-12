package rules.Validation.ClaimValidationRules_dir

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class ClaimValidationRulesTest extends TestBase {

  function testR01_AGI_VALI_008FiresOnlyWhenAllConditionsHold() {
    var matching = EasyMock.createNiceMock(Claim)
    EasyMock.expect(matching.FeedStatus_Ext).andReturn("SENT").anyTimes()
    EasyMock.replay(matching)
    assertTrue(R01_AGI_VALI_008.doCondition(matching))
    var other = EasyMock.createNiceMock(Claim)
    EasyMock.expect(other.FeedStatus_Ext).andReturn("PENDING").anyTimes()
    EasyMock.replay(other)
    assertFalse(R01_AGI_VALI_008.doCondition(other))
  }
}

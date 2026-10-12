package albion.util

uses gw.testharness.TestBase
uses org.easymock.EasyMock

class AlbionActivityUtilsTest extends TestBase {

  function testCreatesClaimActivityFromPatternWithSubject() {
    var pattern = EasyMock.createNiceMock(ActivityPattern)
    EasyMock.replay(pattern)
    var activity = EasyMock.createMock(Activity)
    activity.Subject = "Aged item breach - 6 days"
    EasyMock.expectLastCall().once()
    EasyMock.replay(activity)
    var claim = EasyMock.createMock(Claim)
    EasyMock.expect(claim.createActivityFromPattern(null, pattern)).andReturn(activity).once()
    EasyMock.replay(claim)
    assertSame(activity, AlbionActivityUtils.raiseActivity(claim, pattern, "Aged item breach - 6 days"))
    EasyMock.verify(claim)
    EasyMock.verify(activity)
  }

  function testNullSubjectKeepsPatternSubject() {
    var pattern = EasyMock.createNiceMock(ActivityPattern)
    EasyMock.replay(pattern)
    var activity = EasyMock.createMock(Activity)
    EasyMock.replay(activity)
    var claim = EasyMock.createMock(Claim)
    EasyMock.expect(claim.createActivityFromPattern(null, pattern)).andReturn(activity).once()
    EasyMock.replay(claim)
    assertSame(activity, AlbionActivityUtils.raiseActivity(claim, pattern, null))
    EasyMock.verify(activity)
  }

  function testBeanWithoutClaimRaisesNothing() {
    assertNull(AlbionActivityUtils.raiseActivity(EasyMock.createNiceMock(KeyableBean), "escalation_pi", "subject"))
  }
}

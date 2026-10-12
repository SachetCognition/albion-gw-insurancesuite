package albion.util

uses gw.testharness.TestBase
uses gw.transaction.Transaction
uses org.easymock.EasyMock

class AlbionActivityUtilsTest extends TestBase {

  function testUnknownPatternRaisesNoActivity() {
    var period = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.replay({period})
    assertNull(AlbionActivityUtils.raiseActivity(period, "no_such_pattern_code", "Subject"))
  }

  function testActivityIsCreatedFromThePatternAndLinkedToThePolicy() {
    Transaction.runWithNewBundle(\ b -> {
      var pattern = new ActivityPattern(b)
      pattern.Code = "review_agi_unit_test"
      pattern.Subject = "Pattern subject"
      pattern.Type = ActivityType.TC_GENERAL
      pattern.Priority = Priority.TC_HIGH
      pattern.Mandatory = true
    })
    var bundle = Transaction.newBundle()
    var policy = EasyMock.createNiceMock(Policy)
    var job = EasyMock.createNiceMock(Job)
    var period = EasyMock.createNiceMock(PolicyPeriod)
    EasyMock.expect(period.Bundle).andReturn(bundle).anyTimes()
    EasyMock.expect(period.Policy).andReturn(policy).anyTimes()
    EasyMock.expect(period.Job).andReturn(job).anyTimes()
    EasyMock.replay({policy, job, period})
    var activity = AlbionActivityUtils.raiseActivity(period, "review_agi_unit_test", "Queue HERIT brand policy periods for review")
    assertEquals("review_agi_unit_test", activity.ActivityPattern.Code)
    assertEquals("Queue HERIT brand policy periods for review", activity.Subject)
    assertEquals(Priority.TC_HIGH, activity.Priority)
    assertTrue(activity.Mandatory)
    assertSame(policy, activity.Policy)
    assertSame(job, activity.Job)
  }
}

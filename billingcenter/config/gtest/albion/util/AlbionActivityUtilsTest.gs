package albion.util

uses gw.api.util.DateUtil
uses gw.testharness.TestBase

class AlbionActivityUtilsTest extends TestBase {

  function testRaiseActivityReturnsNullWhenPatternNotConfigured() {
    var invoice = new AccountInvoice()
    assertNull(AlbionActivityUtils.raiseActivity(invoice, "no_such_pattern_code", "subject"))
  }

  function testRaiseActivityCreatesActivityFromPattern() {
    var pattern = new ActivityPattern()
    pattern.Code = "review_agi_test_001"
    pattern.Subject = "Pattern subject"
    pattern.Priority = Priority.TC_HIGH
    pattern.Bundle.commit()
    var invoice = new AccountInvoice()
    var activity = AlbionActivityUtils.raiseActivity(invoice, "review_agi_test_001", "Invoice review")
    assertNotNull(activity)
    assertEquals(pattern, activity.ActivityPattern)
    assertEquals("Invoice review", activity.Subject)
    assertEquals(Priority.TC_HIGH, activity.Priority)
    assertEquals(invoice.Bundle, activity.Bundle)
  }

  function testRaiseActivityAppliesPatternMandatoryAndDueDates() {
    var pattern = new ActivityPattern()
    pattern.Code = "review_agi_test_002"
    pattern.Subject = "Pattern subject"
    pattern.Mandatory = true
    pattern.TargetDays = 2
    pattern.EscalationDays = 3
    pattern.Bundle.commit()
    var activity = AlbionActivityUtils.raiseActivity(new AccountInvoice(), "review_agi_test_002", null)
    assertEquals("Pattern subject", activity.Subject)
    assertTrue(activity.Mandatory)
    assertEquals(DateUtil.currentDate().addDays(2), activity.TargetDate)
    assertEquals(DateUtil.currentDate().addDays(3), activity.EscalationDate)
  }

  function testRaiseActivityRejectsNullBean() {
    try { AlbionActivityUtils.raiseActivity(null, "x", "y"); fail("expected IllegalArgumentException") } catch (e : IllegalArgumentException) { }
  }
}

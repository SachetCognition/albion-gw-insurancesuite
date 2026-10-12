package rules.Assignment.InvoiceAssignmentRules_dir

uses gw.testharness.TestBase

class InvoiceAssignmentRulesTest extends TestBase {

  function testAGI_ASSI_008Fires() {
    var invoice = new AccountInvoice()
    invoice.SourceSystem_Ext = "POLARIS"
    invoice.FeedStatus_Ext = "SENT"
    assertTrue(AGI_ASSI_008.doCondition(invoice))
  }

  function testAGI_ASSI_008DoesNotFire() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "PENDING"
    assertFalse(AGI_ASSI_008.doCondition(invoice))
  }

  function testAGI_ASSI_008ActionReturnsInvoiceToPending() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "SENT"
    AGI_ASSI_008.doAction(invoice, null)
    assertEquals("PENDING", invoice.FeedStatus_Ext)
  }
}

package rules.Escalation.InvoiceEscalationRules_dir

uses gw.testharness.TestBase

class InvoiceEscalationRulesTest extends TestBase {

  function testAGI_ESCA_002Fires() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "NAK"
    invoice.SourceSystem_Ext = "GW"
    assertTrue(AGI_ESCA_002.doCondition(invoice))
  }

  function testAGI_ESCA_002DoesNotFire() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "PENDING"
    assertFalse(AGI_ESCA_002.doCondition(invoice))
  }

  function testAGI_ESCA_002ActionReturnsInvoiceToPending() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "SENT"
    AGI_ESCA_002.doAction(invoice, null)
    assertEquals("PENDING", invoice.FeedStatus_Ext)
  }
}

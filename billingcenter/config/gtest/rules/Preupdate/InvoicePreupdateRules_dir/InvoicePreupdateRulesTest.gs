package rules.Preupdate.InvoicePreupdateRules_dir

uses gw.testharness.TestBase

class InvoicePreupdateRulesTest extends TestBase {

  function testAGI_PREU_010Fires() {
    var invoice = new AccountInvoice()
    invoice.BrandCode_Ext = BrandCode_Ext.TC_HERIT
    assertTrue(AGI_PREU_010.doCondition(invoice))
  }

  function testAGI_PREU_010DoesNotFire() {
    var invoice = new AccountInvoice()
    invoice.BrandCode_Ext = BrandCode_Ext.TC_ALBDIR
    assertFalse(AGI_PREU_010.doCondition(invoice))
  }

  function testAGI_PREU_010ActionReturnsInvoiceToPending() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "SENT"
    AGI_PREU_010.doAction(invoice, null)
    assertEquals("PENDING", invoice.FeedStatus_Ext)
  }
}

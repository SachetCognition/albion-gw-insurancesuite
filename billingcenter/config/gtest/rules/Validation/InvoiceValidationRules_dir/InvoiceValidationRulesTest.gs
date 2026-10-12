package rules.Validation.InvoiceValidationRules_dir

uses gw.testharness.TestBase

class InvoiceValidationRulesTest extends TestBase {

  function testAGI_VALI_011Fires() {
    var invoice = new AccountInvoice()
    invoice.BrandCode_Ext = BrandCode_Ext.TC_HERIT
    assertTrue(AGI_VALI_011.doCondition(invoice))
  }

  function testAGI_VALI_011DoesNotFire() {
    var invoice = new AccountInvoice()
    invoice.BrandCode_Ext = BrandCode_Ext.TC_RETPLS
    assertFalse(AGI_VALI_011.doCondition(invoice))
  }

  function testAGI_VALI_011ActionReturnsInvoiceToPending() {
    var invoice = new AccountInvoice()
    invoice.FeedStatus_Ext = "SENT"
    AGI_VALI_011.doAction(invoice, null)
    assertEquals("PENDING", invoice.FeedStatus_Ext)
  }
}

package albion.ws.v3

uses gw.testharness.TestBase

class DocumentRequestServiceV3Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new DocumentRequestServiceV3()
    assertTrue(svc.requestDocument(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.requestDocument("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v3\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></requestDocumentResponse>", new DocumentRequestServiceV3().requestDocument("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v3\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></requestDocumentResponse>", new DocumentRequestServiceV3().requestDocument("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v4

uses gw.testharness.TestBase

/** Pins the DocumentRequestServiceV4 response contract, including the "Premuim" element name that consumers depend on. */
class DocumentRequestServiceV4Test extends TestBase {

  function testShortOrMissingPolicyNumberReturnsAGI4001() {
    var svc = new DocumentRequestServiceV4()
    assertTrue(svc.requestDocument(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
    assertTrue(svc.requestDocument("1234", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code><Msg>"))
  }

  function testReferenceIsNormalisedAndEchoed() {
    assertEquals("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v4\"><Ref>AB12345</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></requestDocumentResponse>", new DocumentRequestServiceV4().requestDocument("ab-123 45", "ALBBRK"))
  }

  function testMissingBrandDefaultsToAlbdir() {
    assertEquals("<?xml version=\"1.0\"?><requestDocumentResponse xmlns=\"http://albiongeneral.co.uk/ws/docrequest/v4\"><Ref>1234567890</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></requestDocumentResponse>", new DocumentRequestServiceV4().requestDocument("1234567890", null))
  }
}

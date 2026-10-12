package albion.integration.floodre

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase
uses org.easymock.EasyMock

class FloodreRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testClaimNumberAndNinoSlotsCarryNullFiller() {
    // Golden sample provenance: integration/samples/floodre/good_03.xml (ClaimNumber and NINumber are not held in BillingCenter).
    var src = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("PolicyPerEffDate")).andStubReturn("P360764125X")
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andStubReturn("RETPLS")
    EasyMock.replay(src)
    var rec = FloodreRecordBuilder.buildRecord(src)
    assertEquals(600, rec.length())
    assertEquals("FL61", rec.substring(0, 4))
    assertEquals(" ".repeat(10), rec.substring(4, 14))
    assertEquals("P3607641", rec.substring(14, 22))   // silent truncation to 8, as per POLARIS
    assertEquals("00000000000", rec.substring(22, 33))
    assertEquals("00000000", rec.substring(33, 41))
  }

  function testRecordLength() {
    assertEquals(600, FloodreRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

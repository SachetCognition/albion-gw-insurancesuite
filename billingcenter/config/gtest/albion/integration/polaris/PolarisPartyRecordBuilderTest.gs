package albion.integration.polaris

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase
uses org.easymock.EasyMock

class PolarisPartyRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testClaimNumberSlotCarriesNullFiller() {
    var src = EasyMock.createNiceMock(KeyableBean)
    EasyMock.expect(src.getFieldValue("PolicyNumber")).andStubReturn("P1234")
    EasyMock.expect(src.getFieldValue("ERNRef_Ext")).andStubReturn("123/AB45678")
    EasyMock.expect(src.getFieldValue("BrandCode_Ext")).andStubReturn("HERIT")
    EasyMock.replay(src)
    var rec = PolarisPartyRecordBuilder.buildRecord(src)
    assertEquals(750, rec.length())
    assertEquals("PO45", rec.substring(0, 4))
    assertEquals("P1234" + " ".repeat(15), rec.substring(4, 24))
    assertEquals("123/AB45678" + " ".repeat(19), rec.substring(24, 54))
    assertEquals("00000000000", rec.substring(54, 65))
    assertEquals("00000000", rec.substring(65, 73))
  }

  function testRecordLength() {
    assertEquals(750, PolarisPartyRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

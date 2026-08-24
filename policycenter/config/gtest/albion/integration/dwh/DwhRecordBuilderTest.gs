package albion.integration.dwh

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class DwhRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/dwh/good_06.xml.
    characterize(\ src -> DwhRecordBuilder.buildRecord(src), "DW21", 300,
        "SumInsured_Ext", 15, "PolicyNumber_Ext", 10,
        "NINumber_Ext", 13, "ERNRef_Ext")
    characterizeCapturedSample(\ src -> DwhRecordBuilder.buildRecord(src), "DW21", 300,
        "SumInsured_Ext", 15, "DEF-36884", "PolicyNumber_Ext", 10, "AD86633913C",
        "NINumber_Ext", 13, "ERNRef_Ext", "RETPLS")
  }

  function testRecordLength() {
    assertEquals(300, DwhRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

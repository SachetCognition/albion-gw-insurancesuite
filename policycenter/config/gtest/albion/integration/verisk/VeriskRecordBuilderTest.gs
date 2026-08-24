package albion.integration.verisk

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class VeriskRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/verisk/good_03.xml.
    characterize(\ src -> VeriskRecordBuilder.buildRecord(src), "VE17", 400,
        "ERNRef_Ext", 12, "ClaimNumber_Ext", 8,
        "InceptionDate_Ext", 13, "NINumber_Ext")
    characterizeCapturedSample(\ src -> VeriskRecordBuilder.buildRecord(src), "VE17", 400,
        "ERNRef_Ext", 12, "PRB-44001", "ClaimNumber_Ext", 8, "HH14529934X",
        "InceptionDate_Ext", 13, "NINumber_Ext", "ALBDIR")
  }

  function testRecordLength() {
    assertEquals(400, VeriskRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

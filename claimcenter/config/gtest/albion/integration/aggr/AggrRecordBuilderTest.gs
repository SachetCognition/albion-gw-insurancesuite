package albion.integration.aggr

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class AggrRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/aggr/good_06.edi.
    characterize(\ src -> AggrRecordBuilder.buildRecord(src), "AG84", 512,
        "RiskPostcode_Ext", 12, "InceptionDate_Ext", 8,
        "InsuredSurname_Ext", 11, "VehicleVRM_Ext")
    characterizeCapturedSample(\ src -> AggrRecordBuilder.buildRecord(src), "AG84", 512,
        "RiskPostcode_Ext", 12, "AD88730985X", "InceptionDate_Ext", 8, "2325.74",
        "InsuredSurname_Ext", 11, "VehicleVRM_Ext", null)
  }

  function testRecordLength() {
    assertEquals(512, AggrRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

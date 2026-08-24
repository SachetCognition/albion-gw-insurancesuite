package albion.integration.polaris_mf

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PolarisMfRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/polaris_mf/good_01.xml.
    characterize(\ src -> PolarisMfRecordBuilder.buildRecord(src), "PO99", 512,
        "InsuredSurname_Ext", 12, "VehicleVRM_Ext", 30,
        "ClaimNumber_Ext", 15, "InceptionDate_Ext")
    characterizeCapturedSample(\ src -> PolarisMfRecordBuilder.buildRecord(src), "PO99", 512,
        "InsuredSurname_Ext", 12, "GWPC-13292", "VehicleVRM_Ext", 30, "P365613684X",
        "ClaimNumber_Ext", 15, "InceptionDate_Ext", "ALBDIR")
  }

  function testCobolTrailingOverpunchMapping() {
    characterizeNegativeOverpunch(\ src -> PolarisMfRecordBuilder.buildRecord(src), "PO99", 512,
        "InsuredSurname_Ext", 12, "VehicleVRM_Ext", 30,
        "ClaimNumber_Ext", 15, "InceptionDate_Ext")
  }

  function testNegativeNineOverpunchFailure() {
    characterizeNegativeOverpunchNineFailure(\ src -> PolarisMfRecordBuilder.buildRecord(src),
        "InsuredSurname_Ext", "VehicleVRM_Ext", "ClaimNumber_Ext")
  }

  function testRecordLength() {
    assertEquals(512, PolarisMfRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

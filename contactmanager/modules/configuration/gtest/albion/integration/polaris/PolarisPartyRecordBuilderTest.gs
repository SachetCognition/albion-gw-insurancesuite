package albion.integration.polaris

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PolarisPartyRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    characterize(\ src -> PolarisPartyRecordBuilder.buildRecord(src), "PO38", 400,
        "ClaimNumber_Ext", 20, "NINumber_Ext", 10,
        "VehicleVRM_Ext", 11, "PolicyNumber_Ext")
  }

  function testRecordLength() {
    assertEquals(400, PolarisPartyRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

package albion.integration.dwh

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class DwhRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> DwhRecordBuilderV2.buildRecord(src), "DW62", 400,
        "SumInsured_Ext", 10, "ERNRef_Ext", 10,
        "PolicyNumber_Ext", 15, "VehicleVRM_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> DwhRecordBuilderV2.buildRecord(src), "DW62", 400,
        "SumInsured_Ext", 10, "ERNRef_Ext", 10,
        "PolicyNumber_Ext", 15, "VehicleVRM_Ext")
  }

  function testRecordLength() {
    assertEquals(400, DwhRecordBuilderV2.RECORD_LENGTH)
  }
}

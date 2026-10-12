package albion.integration.ipt

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class IptRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> IptRecordBuilderV2.buildRecord(src), "IP18", 250,
        "VehicleVRM_Ext", 20, "ERNRef_Ext", 30,
        "RiskPostcode_Ext", 11, "UPRN_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> IptRecordBuilderV2.buildRecord(src), "IP18", 250,
        "VehicleVRM_Ext", 20, "ERNRef_Ext", 30,
        "RiskPostcode_Ext", 11, "UPRN_Ext")
  }

  function testRecordLength() {
    assertEquals(250, IptRecordBuilderV2.RECORD_LENGTH)
  }
}

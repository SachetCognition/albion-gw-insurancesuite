package albion.integration.cue

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CueRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> CueRecordBuilderV2.buildRecord(src), "CU59", 250,
        "SumInsured_Ext", 12, "ClaimNumber_Ext", 10,
        "PolicyNumber_Ext", 15, "UPRN_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> CueRecordBuilderV2.buildRecord(src), "CU59", 250,
        "SumInsured_Ext", 12, "ClaimNumber_Ext", 10,
        "PolicyNumber_Ext", 15, "UPRN_Ext")
  }

  function testRecordLength() {
    assertEquals(250, CueRecordBuilderV2.RECORD_LENGTH)
  }
}

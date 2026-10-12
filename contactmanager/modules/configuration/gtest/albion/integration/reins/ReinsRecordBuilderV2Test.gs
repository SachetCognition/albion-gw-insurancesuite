package albion.integration.reins

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class ReinsRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> ReinsRecordBuilderV2.buildRecord(src), "RE95", 600,
        "SumInsured_Ext", 15, "PolicyNumber_Ext", 30,
        "RiskPostcode_Ext", 11, "ClaimNumber_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> ReinsRecordBuilderV2.buildRecord(src), "RE95", 600,
        "SumInsured_Ext", 15, "PolicyNumber_Ext", 30,
        "RiskPostcode_Ext", 11, "ClaimNumber_Ext")
  }

  function testRecordLength() {
    assertEquals(600, ReinsRecordBuilderV2.RECORD_LENGTH)
  }
}

package albion.integration.payhub

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PayhubRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> PayhubRecordBuilderV2.buildRecord(src), "PA31", 600,
        "SumInsured_Ext", 15, "RiskPostcode_Ext", 10,
        "InceptionDate_Ext", 13, "ClaimNumber_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> PayhubRecordBuilderV2.buildRecord(src), "PA31", 600,
        "SumInsured_Ext", 15, "RiskPostcode_Ext", 10,
        "InceptionDate_Ext", 13, "ClaimNumber_Ext")
  }

  function testRecordLength() {
    assertEquals(600, PayhubRecordBuilderV2.RECORD_LENGTH)
  }
}

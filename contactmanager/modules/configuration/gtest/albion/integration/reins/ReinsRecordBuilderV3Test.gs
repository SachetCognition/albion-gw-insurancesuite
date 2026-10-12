package albion.integration.reins

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class ReinsRecordBuilderV3Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> ReinsRecordBuilderV3.buildRecord(src), "RE80", 400,
        "UPRN_Ext", 10, "SumInsured_Ext", 10,
        "InsuredSurname_Ext", 11, "RiskPostcode_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> ReinsRecordBuilderV3.buildRecord(src), "RE80", 400,
        "UPRN_Ext", 10, "SumInsured_Ext", 10,
        "InsuredSurname_Ext", 11, "RiskPostcode_Ext")
  }

  function testRecordLength() {
    assertEquals(400, ReinsRecordBuilderV3.RECORD_LENGTH)
  }
}

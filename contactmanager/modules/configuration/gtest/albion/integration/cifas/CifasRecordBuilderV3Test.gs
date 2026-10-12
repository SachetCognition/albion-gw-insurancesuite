package albion.integration.cifas

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CifasRecordBuilderV3Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> CifasRecordBuilderV3.buildRecord(src), "CI36", 250,
        "PolicyNumber_Ext", 10, "NINumber_Ext", 30,
        "RiskPostcode_Ext", 13, "InsuredSurname_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> CifasRecordBuilderV3.buildRecord(src), "CI36", 250,
        "PolicyNumber_Ext", 10, "NINumber_Ext", 30,
        "RiskPostcode_Ext", 13, "InsuredSurname_Ext")
  }

  function testRecordLength() {
    assertEquals(250, CifasRecordBuilderV3.RECORD_LENGTH)
  }
}

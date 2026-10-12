package albion.integration.crif

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CrifRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Layout as built today (padding, truncation, overpunch signs and brand codes are production behaviour).
    characterize(\ src -> CrifRecordBuilderV2.buildRecord(src), "CR27", 512,
        "AnnualPremium_Ext", 20, "RiskPostcode_Ext", 10,
        "NINumber_Ext", 11, "ERNRef_Ext")
  }

  function testNegativeOverpunch() {
    characterizeNegativeOverpunch(\ src -> CrifRecordBuilderV2.buildRecord(src), "CR27", 512,
        "AnnualPremium_Ext", 20, "RiskPostcode_Ext", 10,
        "NINumber_Ext", 11, "ERNRef_Ext")
  }

  function testRecordLength() {
    assertEquals(512, CrifRecordBuilderV2.RECORD_LENGTH)
  }
}

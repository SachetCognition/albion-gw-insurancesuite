package albion.integration.polaris

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PolarisPartyRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    characterize(\ src -> PolarisPartyRecordBuilder.buildRecord(src), "PO47", 300,
        "PolicyNumber_Ext", 12, "AnnualPremium_Ext", 10,
        "RiskPostcode_Ext", 13, "InsuredSurname_Ext")
  }

  function testRecordLength() {
    assertEquals(300, PolarisPartyRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

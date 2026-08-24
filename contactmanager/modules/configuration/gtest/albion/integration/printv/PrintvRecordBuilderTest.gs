package albion.integration.printv

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PrintvRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/printv/good_03.xml.
    characterize(\ src -> PrintvRecordBuilder.buildRecord(src), "PR16", 250,
        "InsuredSurname_Ext", 12, "ClaimNumber_Ext", 30,
        "RiskPostcode_Ext", 15, "PolicyNumber_Ext")
    characterizeCapturedSample(\ src -> PrintvRecordBuilder.buildRecord(src), "PR16", 250,
        "InsuredSurname_Ext", 12, "INC-4811", "ClaimNumber_Ext", 30, "P393799400B",
        "RiskPostcode_Ext", 15, "PolicyNumber_Ext", "RETPLS")
  }

  function testRecordLength() {
    assertEquals(250, PrintvRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

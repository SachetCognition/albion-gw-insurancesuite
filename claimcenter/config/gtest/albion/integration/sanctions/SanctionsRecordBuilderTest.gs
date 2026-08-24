package albion.integration.sanctions

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class SanctionsRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/sanctions/good_04.xml.
    characterize(\ src -> SanctionsRecordBuilder.buildRecord(src), "SA37", 250,
        "PolicyNumber_Ext", 15, "AnnualPremium_Ext", 8,
        "UPRN_Ext", 13, "RiskPostcode_Ext")
    characterizeCapturedSample(\ src -> SanctionsRecordBuilder.buildRecord(src), "SA37", 250,
        "PolicyNumber_Ext", 15, "CM-25904", "AnnualPremium_Ext", 8, "P338236852B",
        "UPRN_Ext", 13, "RiskPostcode_Ext", "ALBBRK")
  }

  function testRecordLength() {
    assertEquals(250, SanctionsRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

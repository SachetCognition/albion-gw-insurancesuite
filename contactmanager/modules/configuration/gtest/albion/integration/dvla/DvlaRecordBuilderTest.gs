package albion.integration.dvla

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class DvlaRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/dvla/good_04.xml.
    characterize(\ src -> DvlaRecordBuilder.buildRecord(src), "DV29", 400,
        "InceptionDate_Ext", 12, "SumInsured_Ext", 8,
        "RiskPostcode_Ext", 13, "ERNRef_Ext")
    characterizeCapturedSample(\ src -> DvlaRecordBuilder.buildRecord(src), "DV29", 400,
        "InceptionDate_Ext", 12, "GWPC-10517", "SumInsured_Ext", 8, "AD83333177C",
        "RiskPostcode_Ext", 13, "ERNRef_Ext", "ALBBRK")
  }

  function testRecordLength() {
    assertEquals(400, DvlaRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

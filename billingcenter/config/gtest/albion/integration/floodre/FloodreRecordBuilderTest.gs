package albion.integration.floodre

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class FloodreRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/floodre/good_03.xml.
    characterize(\ src -> FloodreRecordBuilder.buildRecord(src), "FL61", 600,
        "ClaimNumber_Ext", 10, "InceptionDate_Ext", 8,
        "SumInsured_Ext", 11, "NINumber_Ext")
    characterizeCapturedSample(\ src -> FloodreRecordBuilder.buildRecord(src), "FL61", 600,
        "ClaimNumber_Ext", 10, "HERIT-6739", "InceptionDate_Ext", 8, "P360764125X",
        "SumInsured_Ext", 11, "NINumber_Ext", "RETPLS")
  }

  function testRecordLength() {
    assertEquals(600, FloodreRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

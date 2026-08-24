package albion.integration.cue

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CueRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    // Golden sample provenance: integration/samples/cue/good_02.xml.
    characterize(\ src -> CueRecordBuilder.buildRecord(src), "CU86", 400,
        "ERNRef_Ext", 12, "NINumber_Ext", 10,
        "AnnualPremium_Ext", 11, "SumInsured_Ext")
    characterizeCapturedSample(\ src -> CueRecordBuilder.buildRecord(src), "CU86", 400,
        "ERNRef_Ext", 12, "GWBC-3232", "NINumber_Ext", 10, "HH39736970X",
        "AnnualPremium_Ext", 11, "SumInsured_Ext", "HERIT")
  }

  function testRecordLength() {
    assertEquals(400, CueRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

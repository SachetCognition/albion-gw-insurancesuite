package albion.integration.ipt

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class IptRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/ipt/good_01.xml.
    characterize(\ src -> IptRecordBuilder.buildRecord(src), "IP89", 512,
        "ERNRef_Ext", 20, "PolicyNumber_Ext", 30,
        "NINumber_Ext", 11, "VehicleVRM_Ext")
    characterizeCapturedSample(\ src -> IptRecordBuilder.buildRecord(src), "IP89", 512,
        "ERNRef_Ext", 20, "DEF-20556", "PolicyNumber_Ext", 30, "P320430358A",
        "NINumber_Ext", 11, "VehicleVRM_Ext", "ALBDIR")
  }

  function testThresholds_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateThresholds function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(512, IptRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }

  function testCobolTrailingOverpunchMapping() {
    characterizeNegativeOverpunch(\ src -> IptRecordBuilder.buildRecord(src), "IP89", 512,
        "ERNRef_Ext", 20, "PolicyNumber_Ext", 30,
        "NINumber_Ext", 11, "VehicleVRM_Ext")
  }

  function testDeclaredLengthGuardIsPreemptedByOversizedNumber() {
    characterizeOversizedNumberFailure(\ src -> IptRecordBuilder.buildRecord(src), 512,
        "ERNRef_Ext", "PolicyNumber_Ext", "NINumber_Ext", "VehicleVRM_Ext")
  }
}

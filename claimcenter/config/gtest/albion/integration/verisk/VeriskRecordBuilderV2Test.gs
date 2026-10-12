package albion.integration.verisk

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class VeriskRecordBuilderV2Test extends RecordBuilderCharacterizationTestBase {

  function testRecordLayoutAndBrandCodes() {
    characterize(\ src -> VeriskRecordBuilderV2.buildRecord(src), "VE46", 400,
        "UPRN_Ext", 15, "ClaimNumber_Ext", 30,
        "InceptionDate_Ext", 13, "NINumber_Ext")
  }

  function testCobolTrailingOverpunchMapping() {
    characterizeNegativeOverpunch(\ src -> VeriskRecordBuilderV2.buildRecord(src), "VE46", 400,
        "UPRN_Ext", 15, "ClaimNumber_Ext", 30,
        "InceptionDate_Ext", 13, "NINumber_Ext")
  }

  function testNegativeNineOverpunchFailure() {
    characterizeNegativeOverpunchNineFailure(\ src -> VeriskRecordBuilderV2.buildRecord(src),
        "UPRN_Ext", "ClaimNumber_Ext", "InceptionDate_Ext")
  }
}

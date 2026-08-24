package albion.integration.cifas

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CifasRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/cifas/good_01.xml.
    characterize(\ src -> CifasRecordBuilder.buildRecord(src), "CI87", 750,
        "NINumber_Ext", 12, "SumInsured_Ext", 10,
        "InceptionDate_Ext", 15, "InsuredSurname_Ext")
    characterizeCapturedSample(\ src -> CifasRecordBuilder.buildRecord(src), "CI87", 750,
        "NINumber_Ext", 12, "GWBC-8267", "SumInsured_Ext", 10, "P360124981B",
        "InceptionDate_Ext", 15, "InsuredSurname_Ext", "HERIT")
  }

  function testHeritageRef_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateHeritageRef function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(750, CifasRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

package albion.integration.credit

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CreditRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/credit/good_01.xml.
    characterize(\ src -> CreditRecordBuilder.buildRecord(src), "CR61", 300,
        "RiskPostcode_Ext", 15, "InceptionDate_Ext", 30,
        "PolicyNumber_Ext", 15, "SumInsured_Ext")
    characterizeCapturedSample(\ src -> CreditRecordBuilder.buildRecord(src), "CR61", 300,
        "RiskPostcode_Ext", 15, "PRB-14118", "InceptionDate_Ext", 30, "P382409352X",
        "PolicyNumber_Ext", 15, "SumInsured_Ext", "HERIT")
  }

  function testHeritageRef_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateHeritageRef function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(300, CreditRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

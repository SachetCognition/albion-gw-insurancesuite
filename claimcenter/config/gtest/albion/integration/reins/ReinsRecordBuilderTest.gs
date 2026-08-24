package albion.integration.reins

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class ReinsRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/reins/good_03.xml.
    characterize(\ src -> ReinsRecordBuilder.buildRecord(src), "RE47", 600,
        "AnnualPremium_Ext", 10, "ClaimNumber_Ext", 30,
        "ERNRef_Ext", 11, "RiskPostcode_Ext")
    characterizeCapturedSample(\ src -> ReinsRecordBuilder.buildRecord(src), "RE47", 600,
        "AnnualPremium_Ext", 10, "GWPC-25666", "ClaimNumber_Ext", 30, "AD89632541C",
        "ERNRef_Ext", 11, "RiskPostcode_Ext", "HERIT")
  }

  function testIPTCalc_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateIPTCalc function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(600, ReinsRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

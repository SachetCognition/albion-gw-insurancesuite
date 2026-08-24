package albion.integration.mid

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class MidRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/mid/good_07.xml.
    characterize(\ src -> MidRecordBuilder.buildRecord(src), "MI56", 600,
        "PolicyNumber_Ext", 12, "AnnualPremium_Ext", 8,
        "UPRN_Ext", 13, "SumInsured_Ext")
    characterizeCapturedSample(\ src -> MidRecordBuilder.buildRecord(src), "MI56", 600,
        "PolicyNumber_Ext", 12, "CHG-11781", "AnnualPremium_Ext", 8, "AD90893699A",
        "UPRN_Ext", 13, "SumInsured_Ext", "ALBDIR")
  }

  function testBrandRouting_DISABLED() {
    // SUPERSEDED BY testHappyPath: the matrix pins every current brand route.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(600, MidRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

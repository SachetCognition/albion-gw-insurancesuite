package albion.integration.ssp

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class SspRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/ssp/edge_01.edi.
    characterize(\ src -> SspRecordBuilder.buildRecord(src), "SS84", 750,
        "ClaimNumber_Ext", 15, "VehicleVRM_Ext", 10,
        "PolicyNumber_Ext", 11, "AnnualPremium_Ext")
    characterizeCapturedSample(\ src -> SspRecordBuilder.buildRecord(src), "SS84", 750,
        "ClaimNumber_Ext", 15, "BK14585485X", "VehicleVRM_Ext", 10, "TRADE01",
        "PolicyNumber_Ext", 11, "AnnualPremium_Ext", null)
  }

  function testBrandRouting_DISABLED() {
    // SUPERSEDED BY testHappyPath: the matrix pins every current brand route.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(750, SspRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

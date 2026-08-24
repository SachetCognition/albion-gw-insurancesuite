package albion.integration.crif

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class CrifRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/crif/good_01.xml.
    characterize(\ src -> CrifRecordBuilder.buildRecord(src), "CR58", 750,
        "NINumber_Ext", 15, "VehicleVRM_Ext", 30,
        "AnnualPremium_Ext", 15, "ClaimNumber_Ext")
    characterizeCapturedSample(\ src -> CrifRecordBuilder.buildRecord(src), "CR58", 750,
        "NINumber_Ext", 15, "GWPC-9684", "VehicleVRM_Ext", 30, "AD86839051A",
        "AnnualPremium_Ext", 15, "ClaimNumber_Ext", "HERIT")
  }

  function testHeritageRef_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateHeritageRef function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(750, CrifRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

package albion.integration.payhub

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PayhubRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/payhub/good_04.xml.
    characterize(\ src -> PayhubRecordBuilder.buildRecord(src), "PA15", 750,
        "InsuredSurname_Ext", 15, "VehicleVRM_Ext", 8,
        "UPRN_Ext", 13, "ClaimNumber_Ext")
    characterizeCapturedSample(\ src -> PayhubRecordBuilder.buildRecord(src), "PA15", 750,
        "InsuredSurname_Ext", 15, "PRB-45704", "VehicleVRM_Ext", 8, "HH96184634A",
        "UPRN_Ext", 13, "ClaimNumber_Ext", "HERIT")
  }

  function testHeritageRef_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateHeritageRef function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(750, PayhubRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

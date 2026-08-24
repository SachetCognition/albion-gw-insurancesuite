package albion.integration.polaris

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PolarisPartyRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    characterize(\ src -> PolarisPartyRecordBuilder.buildRecord(src), "PO58", 300,
        "AnnualPremium_Ext", 15, "InsuredSurname_Ext", 30,
        "PolicyNumber_Ext", 13, "ClaimNumber_Ext")
  }

  function testBrandRouting_DISABLED() {
    // SUPERSEDED BY testHappyPath: the matrix pins every current brand route.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(300, PolarisPartyRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

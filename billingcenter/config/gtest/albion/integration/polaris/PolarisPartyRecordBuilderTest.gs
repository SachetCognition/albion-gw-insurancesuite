package albion.integration.polaris

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class PolarisPartyRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testGoldenMasterMatrix() {
    characterize(\ src -> PolarisPartyRecordBuilder.buildRecord(src), "PO45", 750,
        "PolicyNumber_Ext", 20, "ERNRef_Ext", 30,
        "InceptionDate_Ext", 11, "ClaimNumber_Ext")
  }

  function testRecordLength() {
    assertEquals(750, PolarisPartyRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

package albion.integration.elto

uses albion.integration.testsupport.RecordBuilderCharacterizationTestBase

class EltoRecordBuilderTest extends RecordBuilderCharacterizationTestBase {

  function testHappyPath() {
    // Golden sample provenance: integration/samples/elto/prod_incident_03.xml.
    characterize(\ src -> EltoRecordBuilder.buildRecord(src), "EL82", 400,
        "InceptionDate_Ext", 15, "UPRN_Ext", 8,
        "NINumber_Ext", 13, "ERNRef_Ext")
    characterizeCapturedSample(\ src -> EltoRecordBuilder.buildRecord(src), "EL82", 400,
        "InceptionDate_Ext", 15, "GWCC-9528", "UPRN_Ext", 8, "HH73231625B",
        "NINumber_Ext", 13, "ERNRef_Ext", "RETPLS")
  }

  function testIPTCalc_DISABLED() {
    // SUPERSEDED BY testHappyPath: the record builder has no evaluateIPTCalc function.
  }

  function testHeritageRegression_HappyPath() {
    assertEquals(400, EltoRecordBuilder.RECORD_LENGTH) // Encodes current PROD behaviour, right or wrong.
  }
}

package albion.ws.v3

uses gw.testharness.TestBase

class MIDVehicleServiceV3Test extends TestBase {

  function testShortOrMissingReferenceReturnsErrorXml() {
    var expected = "<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>"
    assertEquals(expected, new MIDVehicleServiceV3().getVehicleSubmissionStatus(null, "ALBDIR"))
    assertEquals(expected, new MIDVehicleServiceV3().getVehicleSubmissionStatus("AB12", "ALBDIR"))
  }

  function testReferenceIsNormalisedAndBrandDefaultsToAlbDir() {
    var xml = new MIDVehicleServiceV3().getVehicleSubmissionStatus("ab-123 45", null)
    assertTrue(xml.startsWith("<?xml version=\"1.0\"?><VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v3\">"))
    assertTrue(xml.contains("<Ref>AB12345</Ref><Brand>ALBDIR</Brand>"))
    assertTrue(xml.contains("<Premuim>0.00</Premuim>"))
    assertTrue(xml.contains("<Status>OK</Status>"))
    assertTrue(xml.endsWith("</VehicleSubmissionStatusResponse>"))
  }

  function testBrandIsEchoedUnchanged() {
    assertTrue(new MIDVehicleServiceV3().getVehicleSubmissionStatus("GW12345678", "ALBBRK").contains("<Brand>ALBBRK</Brand>"))
    assertTrue(new MIDVehicleServiceV3().getVehicleSubmissionStatus("GW12345678", "NOVABK").contains("<Brand>NOVABK</Brand>"))
  }
}

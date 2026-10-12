package albion.ws.v3

uses gw.testharness.TestBase

class MIDVehicleServiceV3Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new MIDVehicleServiceV3()
    assertTrue(svc.getVehicleSubmissionStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getVehicleSubmissionStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v3\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></VehicleSubmissionStatusResponse>", new MIDVehicleServiceV3().getVehicleSubmissionStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v3\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></VehicleSubmissionStatusResponse>", new MIDVehicleServiceV3().getVehicleSubmissionStatus("GW12345678", "ALBBRK"))
  }
}

package albion.ws.v1

uses gw.testharness.TestBase

class MIDVehicleServiceV1Test extends TestBase {

  function testRejectsMissingOrShortPolicyNumber() {
    var svc = new MIDVehicleServiceV1()
    assertTrue(svc.getVehicleSubmissionStatus(null, "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
    assertTrue(svc.getVehicleSubmissionStatus("AB12", "ALBDIR").startsWith("<Error><Code>AGI-4001</Code>"))
  }

  function testNormalisesReferenceAndDefaultsBrand() {
    assertEquals("<?xml version=\"1.0\"?><VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v1\"><Ref>AB1234567</Ref><Brand>ALBDIR</Brand><Premuim>0.00</Premuim><Status>OK</Status></VehicleSubmissionStatusResponse>", new MIDVehicleServiceV1().getVehicleSubmissionStatus("ab-123 4567", null))
  }

  function testEchoesBrandAndKeepsContractedPremuimElement() {
    assertEquals("<?xml version=\"1.0\"?><VehicleSubmissionStatusResponse xmlns=\"http://albiongeneral.co.uk/ws/midvehicle/v1\"><Ref>GW12345678</Ref><Brand>ALBBRK</Brand><Premuim>0.00</Premuim><Status>OK</Status></VehicleSubmissionStatusResponse>", new MIDVehicleServiceV1().getVehicleSubmissionStatus("GW12345678", "ALBBRK"))
  }
}

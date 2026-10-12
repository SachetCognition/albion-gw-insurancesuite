package albion.integration.common

uses albion.integration.cifas.CifasTransport
uses albion.integration.cue.CueTransport
uses albion.integration.dvla.DvlaTransport
uses albion.integration.elto.EltoTransport
uses albion.integration.floodre.FloodreTransport
uses albion.integration.ipt.IptTransport
uses albion.integration.mid.MidTransport
uses albion.integration.payhub.PayhubTransport
uses albion.integration.polaris_mf.PolarisMfTransport
uses albion.integration.sanctions.SanctionsTransport
uses gw.testharness.TestBase
uses java.io.File
uses java.nio.charset.StandardCharsets
uses java.nio.file.Files
uses org.easymock.EasyMock

class AlbionSpoolTransportTest extends TestBase {

  function testEachTransportSpoolsToItsOwnInterface() {
    var codes = {new MidTransport().SystemCode, new CueTransport().SystemCode, new EltoTransport().SystemCode,
        new FloodreTransport().SystemCode, new SanctionsTransport().SystemCode, new DvlaTransport().SystemCode,
        new CifasTransport().SystemCode, new IptTransport().SystemCode, new PolarisMfTransport().SystemCode,
        new PayhubTransport().SystemCode}
    assertEquals({"MID", "CUE", "ELTO", "FLOODRE", "SANCTIONS", "DVLA", "CIFAS", "IPT", "POLARIS_MF", "PAYHUB"}, codes)
  }

  function testSendSpoolsThePayloadAndAcknowledges() {
    var dir = Files.createTempDirectory("spool").toFile()
    var transport = new MidTransport() {
      override property get SpoolDirectory() : File {
        return dir
      }
    }
    var message = EasyMock.createMock(Message)
    message.reportAck()
    EasyMock.expectLastCall()
    EasyMock.replay({message})
    transport.setDestinationID(60)
    transport.send(message, "MID0001AB12CDE")
    EasyMock.verify({message})
    assertEquals(60, transport.DestinationId)
    assertEquals("MID0001AB12CDE\n", new String(Files.readAllBytes(new File(dir, "MID.dat").toPath()), StandardCharsets.UTF_8))
  }

  function testCifasKeepsAnAlreadyTransformedPayload() {
    var dir = Files.createTempDirectory("spool").toFile()
    var transport = new CifasTransport() {
      override property get SpoolDirectory() : File {
        return dir
      }
    }
    var message = EasyMock.createNiceMock(Message)
    EasyMock.replay({message})
    transport.send(message, "CIFAS-REC")
    assertEquals("CIFAS-REC\n", new String(Files.readAllBytes(new File(dir, "CIFAS.dat").toPath()), StandardCharsets.UTF_8))
  }
}

package albion.integration.common

uses albion.config.AlbionConfigService
uses albion.integration.cue.CueTransport
uses albion.integration.mid.MidTransport
uses gw.testharness.TestBase
uses java.nio.file.Files
uses org.easymock.EasyMock

class AlbionSpoolTransportTest extends TestBase {

  var _dir : java.io.File

  override function beforeMethod() {
    _dir = Files.createTempDirectory("albion-transport").toFile()
    var p = new java.util.HashMap<String, String>()
    p.put("bi." + FlatFileSpooler.SPOOL_DIR_KEY, _dir.AbsolutePath)
    AlbionConfigService.setInstance(new AlbionConfigService("bi", p))
  }

  override function afterMethod() {
    AlbionConfigService.setInstance(null)
  }

  function testSendSpoolsTransformedPayloadAndAcks() {
    var msg = EasyMock.createMock(Message)
    msg.reportAck()
    EasyMock.replay({msg})
    var t = new CueTransport()
    t.setDestinationID(61)
    t.send(msg, "CUE-RECORD")
    EasyMock.verify({msg})
    assertEquals(61, t.DestinationID)
    assertEquals({"CUE-RECORD"}, Files.readAllLines(new java.io.File(_dir, "CUE.dat").toPath()))
  }

  function testSendReportsErrorWhenNothingToSpool() {
    var msg = EasyMock.createMock(Message)
    EasyMock.expect(msg.Payload).andReturn(null)
    EasyMock.expect(msg.ID).andReturn(1L).anyTimes()
    msg.reportError()
    EasyMock.replay({msg})
    new CueTransport().send(msg, null)
    EasyMock.verify({msg})
  }

  function testMidTransportUsesPayloadWhenRootIsNotAnEntity() {
    var msg = EasyMock.createMock(Message)
    EasyMock.expect(msg.MessageRoot).andReturn(null)
    EasyMock.replay({msg})
    assertEquals("RAW", new MidTransport().buildRecord(msg, "RAW"))
    assertEquals("MID", new MidTransport().Feed)
  }

  function testSuspendResume() {
    var t = new CueTransport()
    t.suspend()
    assertTrue(t.Suspended)
    t.resume()
    assertFalse(t.Suspended)
  }
}

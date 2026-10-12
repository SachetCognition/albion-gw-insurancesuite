package albion.integration.cue

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses java.io.File
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses gw.testharness.TestBase
uses org.easymock.EasyMock

class CueTransportTest extends TestBase {

  function testSpoolsRecordAndAcknowledges() {
    var dir = Files.createTempDirectory("spool").toFile()
    var values = new HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + "." + albion.integration.common.FlatFileSpooler.KEY_SPOOL_DIR, dir.AbsolutePath)
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      var root = EasyMock.createNiceMock(KeyableBean)
      EasyMock.replay(root)
      var message = EasyMock.createNiceMock(Message)
      EasyMock.expect(message.MessageRoot).andReturn(root).anyTimes()
      message.reportAck()
      EasyMock.expectLastCall().once()
      EasyMock.replay(message)
      var transport = new CueTransport()
      transport.setDestinationID(1)
      transport.send(message, "PAYLOAD|CUE")
      EasyMock.verify(message)
      var file = new File(new File(dir, "CUE"), "CUE_" + new SimpleDateFormat("yyyyMMdd").format(new java.util.Date()) + ".dat")
      assertEquals({"PAYLOAD|CUE"}, Files.readAllLines(file.toPath()))
      assertEquals("CUE", transport.FeedName)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

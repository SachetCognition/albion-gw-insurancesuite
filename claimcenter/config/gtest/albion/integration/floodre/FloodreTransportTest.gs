package albion.integration.floodre

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses java.io.File
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses gw.testharness.TestBase
uses org.easymock.EasyMock

class FloodreTransportTest extends TestBase {

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
      var transport = new FloodreTransport()
      transport.setDestinationID(1)
      transport.send(message, "PAYLOAD|FLOODRE")
      EasyMock.verify(message)
      var file = new File(new File(dir, "FLOODRE"), "FLOODRE_" + new SimpleDateFormat("yyyyMMdd").format(new java.util.Date()) + ".dat")
      assertEquals({"PAYLOAD|FLOODRE"}, Files.readAllLines(file.toPath()))
      assertEquals("FLOODRE", transport.FeedName)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

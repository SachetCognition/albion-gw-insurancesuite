package albion.integration.sanctions

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses java.io.File
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses gw.testharness.TestBase
uses org.easymock.EasyMock

class SanctionsTransportTest extends TestBase {

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
      var transport = new SanctionsTransport()
      transport.setDestinationID(1)
      transport.send(message, "PAYLOAD|SANCTIONS")
      EasyMock.verify(message)
      var file = new File(new File(dir, "SANCTIONS"), "SANCTIONS_" + new SimpleDateFormat("yyyyMMdd").format(new java.util.Date()) + ".dat")
      assertEquals({albion.integration.sanctions.SanctionsRecordBuilder.buildRecord(root)}, Files.readAllLines(file.toPath()))
      assertEquals("SANCTIONS", transport.FeedName)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

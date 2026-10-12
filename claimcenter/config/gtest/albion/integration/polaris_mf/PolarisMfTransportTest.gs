package albion.integration.polaris_mf

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses java.io.File
uses java.nio.file.Files
uses java.text.SimpleDateFormat
uses java.util.HashMap
uses gw.testharness.TestBase
uses org.easymock.EasyMock

class PolarisMfTransportTest extends TestBase {

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
      var transport = new PolarisMfTransport()
      transport.setDestinationID(1)
      transport.send(message, "PAYLOAD|POLARIS")
      EasyMock.verify(message)
      var file = new File(new File(dir, "POLARIS"), "POLARIS_" + new SimpleDateFormat("yyyyMMdd").format(new java.util.Date()) + ".dat")
      assertEquals({albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(root)}, Files.readAllLines(file.toPath()))
      assertEquals("POLARIS", transport.FeedName)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

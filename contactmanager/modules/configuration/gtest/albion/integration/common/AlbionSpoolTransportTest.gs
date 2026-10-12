package albion.integration.common

uses albion.integration.cue.CueTransport
uses albion.integration.mid.MidTransport
uses albion.testsupport.AlbionRuleTestBase
uses java.nio.file.Files
uses java.util.HashMap
uses org.easymock.EasyMock

class AlbionSpoolTransportTest extends AlbionRuleTestBase {

  private function message(root : KeyableBean) : Message {
    var msg = EasyMock.createNiceMock(Message)
    EasyMock.expect(msg.MessageRoot).andStubReturn(root)
    msg.reportAck()
    EasyMock.expectLastCall().once()
    EasyMock.replay(msg)
    return msg
  }

  function testTransportWithoutRecordBuilderSpoolsPayloadAndAcks() {
    var dir = Files.createTempDirectory("spool").toFile()
    withConfig(new HashMap<String, String>() {"co.spool.dir" -> dir.AbsolutePath}, \ -> {
      var msg = message(bean(new HashMap<String, Object>()))
      new MidTransport().send(msg, "MIDPAYLOAD")
      EasyMock.verify(msg)
      assertEquals({"MIDPAYLOAD"}, Files.readAllLines(new java.io.File(dir, "MID.dat").toPath()))
    })
  }

  function testTransportWithRecordBuilderSpoolsBuiltRecord() {
    var dir = Files.createTempDirectory("spool").toFile()
    withConfig(new HashMap<String, String>() {"co.spool.dir" -> dir.AbsolutePath}, \ -> {
      var msg = message(bean(new HashMap<String, Object>() {"BrandCode_Ext" -> "ALBDIR"}))
      new CueTransport().send(msg, "IGNORED")
      EasyMock.verify(msg)
      var lines = Files.readAllLines(new java.io.File(dir, "CUE.dat").toPath())
      assertEquals(1, lines.size())
      assertEquals(400, lines.get(0).length())
      assertTrue(lines.get(0).startsWith("CU86"))
    })
  }

  function testFeedNames() {
    assertEquals("CUE", new CueTransport().FeedName)
    assertEquals("MID", new MidTransport().FeedName)
  }
}

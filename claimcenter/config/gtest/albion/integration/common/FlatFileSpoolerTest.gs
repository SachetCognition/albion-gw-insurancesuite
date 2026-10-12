package albion.integration.common

uses albion.config.AlbionCentre
uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.nio.file.Files
uses java.util.HashMap

class FlatFileSpoolerTest extends TestBase {

  function testAppendsRecordsToDailyFeedFile() {
    var dir = Files.createTempDirectory("spool").toFile()
    var values = new HashMap<String, String>()
    values.put(AlbionCentre.PROPERTY_PREFIX + "." + FlatFileSpooler.KEY_SPOOL_DIR, dir.AbsolutePath)
    AlbionConfigService.setInstance(new AlbionConfigService(AlbionCentre.PROPERTY_PREFIX, values))
    try {
      var first = FlatFileSpooler.spool("payhub", "REC1")
      var second = FlatFileSpooler.spool("PAYHUB", "REC2")
      assertEquals(first, second)
      assertEquals(FlatFileSpooler.spoolFile("PAYHUB", new java.util.Date()), first)
      assertEquals("PAYHUB", first.ParentFile.Name)
      assertTrue(first.Name.startsWith("PAYHUB_") and first.Name.endsWith(".dat"))
      assertEquals({"REC1", "REC2"}, Files.readAllLines(first.toPath()))
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testDefaultSpoolDirectoryIsSharedOutboundPath() {
    assertEquals("/var/agi/spool/outbound", FlatFileSpooler.DEFAULT_SPOOL_DIR)
  }

  function testRejectsMissingFeedOrRecord() {
    try {
      FlatFileSpooler.spool(" ", "REC")
      fail("blank feed accepted")
    } catch (e : IllegalArgumentException) {
      assertEquals("feed is required", e.Message)
    }
    try {
      FlatFileSpooler.spool("ELTO", null)
      fail("null record accepted")
    } catch (e : IllegalArgumentException) {
      assertEquals("record is required", e.Message)
    }
  }
}

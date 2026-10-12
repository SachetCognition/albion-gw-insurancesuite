package albion.integration.common

uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.io.File
uses java.util.HashMap
uses java.nio.charset.StandardCharsets
uses java.nio.file.Files

class FlatFileSpoolerTest extends TestBase {

  function testSpoolAppendsOneLinePerRecordToTheSystemFile() {
    var dir = Files.createTempDirectory("spool").toFile()
    var file = FlatFileSpooler.spool(dir, "dwh", "REC1")
    FlatFileSpooler.spool(dir, "DWH", "REC2")
    assertEquals(new File(dir, "DWH.dat"), file)
    assertEquals("REC1\nREC2\n", new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8))
  }

  function testNullRecordIsSpooledAsEmptyLine() {
    var dir = Files.createTempDirectory("spool").toFile()
    var file = FlatFileSpooler.spool(dir, "MID", null)
    assertEquals("\n", new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8))
  }

  function testBlankSystemCodeIsRejected() {
    var dir = Files.createTempDirectory("spool").toFile()
    try {
      FlatFileSpooler.spool(dir, " ", "REC")
      fail("expected IllegalArgumentException")
    } catch (e : IllegalArgumentException) {
      assertEquals(0, dir.listFiles().length)
    }
  }

  function testSpoolDirectoryDefaultsToOutboundSpoolPath() {
    try {
      AlbionConfigService.setInstance(new AlbionConfigService("po", new HashMap<String, String>()))
      assertEquals(new File("/var/agi/spool/outbound"), FlatFileSpooler.SpoolDirectory)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }

  function testSpoolDirectoryReadsCentrePrefixedIntegrationKey() {
    try {
      AlbionConfigService.setInstance(new AlbionConfigService("po", {"po.integration.spool.dir" -> "/data/spool"}))
      assertEquals(new File("/data/spool"), FlatFileSpooler.SpoolDirectory)
    } finally {
      AlbionConfigService.setInstance(null)
    }
  }
}

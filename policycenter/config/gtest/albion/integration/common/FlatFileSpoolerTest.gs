package albion.integration.common

uses gw.testharness.TestBase
uses java.io.File
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
}

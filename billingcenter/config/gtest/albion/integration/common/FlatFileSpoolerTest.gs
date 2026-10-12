package albion.integration.common

uses albion.config.AlbionConfigService
uses gw.testharness.TestBase
uses java.nio.file.Files

class FlatFileSpoolerTest extends TestBase {

  var _dir : java.io.File

  override function beforeMethod() {
    _dir = Files.createTempDirectory("albion-spool").toFile()
    var p = new java.util.HashMap<String, String>()
    p.put("bi." + FlatFileSpooler.SPOOL_DIR_KEY, _dir.AbsolutePath)
    AlbionConfigService.setInstance(new AlbionConfigService("bi", p))
  }

  override function afterMethod() {
    AlbionConfigService.setInstance(null)
  }

  function testSpoolAppendsOneLinePerRecordToFeedFile() {
    var f = FlatFileSpooler.spool("credit", "REC1")
    FlatFileSpooler.spool("CREDIT", "REC2\nSPLIT")
    assertEquals(new java.io.File(_dir, "CREDIT.dat"), f)
    assertEquals({"REC1", "REC2 SPLIT"}, Files.readAllLines(f.toPath()))
  }

  function testSpoolRejectsMissingFeedOrRecord() {
    try { FlatFileSpooler.spool(" ", "X"); fail("expected IllegalArgumentException") } catch (e : IllegalArgumentException) { }
    try { FlatFileSpooler.spool("MID", null); fail("expected IllegalArgumentException") } catch (e : IllegalArgumentException) { }
  }
}

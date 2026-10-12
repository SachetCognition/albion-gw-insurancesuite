package albion.integration.common

uses albion.testsupport.AlbionRuleTestBase
uses java.nio.file.Files
uses java.util.HashMap

class FlatFileSpoolerTest extends AlbionRuleTestBase {

  function testSpoolAppendsOneLinePerRecordToTheFeedFile() {
    var dir = Files.createTempDirectory("spool").toFile()
    withConfig(new HashMap<String, String>() {"co.spool.dir" -> dir.AbsolutePath}, \ -> {
      var file = FlatFileSpooler.spool("CUE", "REC1")
      FlatFileSpooler.spool("CUE", "REC2")
      assertEquals("CUE.dat", file.Name)
      assertEquals({"REC1", "REC2"}, Files.readAllLines(file.toPath()))
    })
  }

  function testSpoolRequiresFeedName() {
    try {
      FlatFileSpooler.spool(" ", "REC")
      fail("expected IllegalArgumentException")
    } catch (e : java.lang.IllegalArgumentException) {
      assertEquals("feed is required", e.Message)
    }
  }
}

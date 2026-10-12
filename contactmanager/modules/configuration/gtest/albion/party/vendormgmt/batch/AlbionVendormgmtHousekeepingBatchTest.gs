package albion.party.vendormgmt.batch

uses gw.testharness.TestBase

class AlbionVendormgmtHousekeepingBatchTest extends TestBase {

  function testBatchIsRegisteredUnderItsBatchProcessType() {
    var batch = new AlbionVendormgmtHousekeepingBatch()
    assertEquals(BatchProcessType.TC_ALBIONVENDORMGMTHO_EXT, batch.BatchProcessType)
  }
}

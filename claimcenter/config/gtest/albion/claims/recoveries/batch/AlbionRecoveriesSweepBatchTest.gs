package albion.claims.recoveries.batch

uses gw.testharness.TestBase

class AlbionRecoveriesSweepBatchTest extends TestBase {

  function testRegistersItsBatchProcessType() {
    assertEquals(BatchProcessType.TC_ALBIONRECOVERIESSW_EXT, new AlbionRecoveriesSweepBatch().BatchProcessType)
  }
}

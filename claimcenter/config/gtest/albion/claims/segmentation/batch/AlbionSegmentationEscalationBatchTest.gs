package albion.claims.segmentation.batch

uses gw.testharness.TestBase

class AlbionSegmentationEscalationBatchTest extends TestBase {

  function testRegistersItsBatchProcessType() {
    assertEquals(BatchProcessType.TC_ALBIONSEGMENTATION_EXT, new AlbionSegmentationEscalationBatch().BatchProcessType)
  }
}

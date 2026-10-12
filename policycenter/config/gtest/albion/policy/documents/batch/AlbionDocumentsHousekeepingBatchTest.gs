package albion.policy.documents.batch

uses gw.testharness.TestBase

class AlbionDocumentsHousekeepingBatchTest extends TestBase {

  function testEscalatesOnlyAfter30Days() {
    assertEquals(30, AlbionDocumentsHousekeepingBatch.ESCALATION_AGE_DAYS)
    assertFalse(AlbionDocumentsHousekeepingBatch.isAged(30))
    assertTrue(AlbionDocumentsHousekeepingBatch.isAged(31))
    assertFalse(AlbionDocumentsHousekeepingBatch.isAged(0))
  }
}

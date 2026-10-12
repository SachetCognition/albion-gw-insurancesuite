package albion.policy.schemes.batch

uses gw.testharness.TestBase

class AlbionSchemesEscalationBatchTest extends TestBase {

  function testEscalatesOnlyAfter5Days() {
    assertEquals(5, AlbionSchemesEscalationBatch.ESCALATION_AGE_DAYS)
    assertFalse(AlbionSchemesEscalationBatch.isAged(5))
    assertTrue(AlbionSchemesEscalationBatch.isAged(6))
    assertFalse(AlbionSchemesEscalationBatch.isAged(0))
  }
}

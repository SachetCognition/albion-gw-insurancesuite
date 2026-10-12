package albion.policy.cancellation.batch

uses albion.policy.support.AlbionPolicyTestBeans
uses gw.testharness.TestBase

class AlbionCancellationHousekeepingBatchTest extends TestBase {

  function testOutboundRecordCarriesPolarisBrandCode() {
    var brk = AlbionCancellationHousekeepingBatch.outboundRecord(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK"}))
    assertEquals(albion.integration.polaris.PolarisPartyRecordBuilder.buildRecord(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "ALBBRK"})), brk)
    assertTrue(brk.contains("02BK00"))
    assertTrue(AlbionCancellationHousekeepingBatch.outboundRecord(AlbionPolicyTestBeans.bean({"BrandCode_Ext" -> "NOVABK"})).contains("999999"))
  }
}

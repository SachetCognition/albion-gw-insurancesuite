package albion.policy.compliance

uses albion.policy.common.AlbionPolicyTestBeans
uses gw.testharness.TestBase
uses java.io.ByteArrayOutputStream
uses java.io.PrintStream
uses java.math.BigDecimal

/*******************************************************************************
 * AlbionPS215GateTest
 *
 * Pins the PS21/5 price-walk gate: TotalIncurred_Ext against EquivalentNBPremium_Ext, strictly greater breaches.
 *
 * CHANGE HISTORY (append only - audit requirement AGI-GRC-114):
 *  13/10/2026   AGI-GW Platform  Initial version
 ******************************************************************************/
class AlbionPS215GateTest extends TestBase {

  private function renewal(amount : BigDecimal, nbPrice : BigDecimal) : KeyableBean {
    return AlbionPolicyTestBeans.bean({"TotalIncurred_Ext" -> amount, "EquivalentNBPremium_Ext" -> nbPrice})
  }

  private function codes(bean : KeyableBean) : String {
    return AlbionPolicyTestBeans.outcomes(AlbionPS215Gate.evaluate(bean))
  }

  /** Runs the gate with System.out captured; returns the printed output. */
  private function printedBy(bean : KeyableBean) : String {
    var original = System.out
    var buffer = new ByteArrayOutputStream()
    System.setOut(new PrintStream(buffer, true, "UTF-8"))
    try {
      AlbionPS215Gate.evaluate(bean)
    } finally {
      System.setOut(original)
    }
    return buffer.toString("UTF-8").trim()
  }

  function testBreachCodeConstant() {
    assertEquals("PRICE_WALK_BREACH", AlbionPS215Gate.BREACH_CODE)
  }

  function testRenewalAboveNewBusinessPriceBreaches() {
    var bean = renewal(610.00bd, 575.00bd)
    assertEquals("PRICE_WALK_BREACH", codes(bean))
    assertFalse(AlbionPS215Gate.passes(bean))
  }

  function testBreachWritesComplianceLine() {
    var bean = renewal(610.00bd, 575.00bd)
    assertEquals("COMPLIANCE-BREACH|PS215|" + bean + "|610.00|575.00", printedBy(bean))
  }

  function testRenewalBelowNewBusinessPricePasses() {
    var bean = renewal(438.10bd, 441.00bd)
    assertEquals("", codes(bean))
    assertTrue(AlbionPS215Gate.passes(bean))
    assertEquals("", printedBy(bean))
  }

  function testEqualPricePasses() {
    var bean = renewal(300.00bd, 300.00bd)
    assertEquals("", codes(bean))
    assertTrue(AlbionPS215Gate.passes(bean))
  }

  function testOnePennyAboveBreaches() {
    assertEquals("PRICE_WALK_BREACH", codes(renewal(300.01bd, 300.00bd)))
  }

  function testNullAmountIsTreatedAsZero() {
    assertEquals("", codes(renewal(null, 0bd)))
    assertEquals("", codes(renewal(null, 100.00bd)))
    var bean = renewal(null, -0.01bd)
    assertEquals("PRICE_WALK_BREACH", codes(bean))
    assertEquals("COMPLIANCE-BREACH|PS215|" + bean + "|0|-0.01", printedBy(bean))
  }

  function testNullNewBusinessPriceNeverBreaches() {
    var bean = renewal(999999.99bd, null)
    assertEquals("", codes(bean))
    assertTrue(AlbionPS215Gate.passes(bean))
    assertEquals("", printedBy(bean))
  }

  function testNullBean() {
    assertEquals("", codes(null))
    assertFalse(AlbionPS215Gate.passes(null))
  }

  function testV1BindingsDelegateToTheGate() {
    var breach = renewal(610.00bd, 575.00bd)
    var pass = renewal(438.10bd, 441.00bd)
    var noPrice = AlbionPolicyTestBeans.bean(null)
    assertFalse(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(breach))
    assertFalse(albion.policy.documents.AlbionParagonFeedManager.evaluateAlbionParagonFeedManager_v1(breach))
    assertTrue(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(pass))
    assertTrue(albion.policy.documents.AlbionParagonFeedManager.evaluateAlbionParagonFeedManager_v1(pass))
    assertTrue(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(noPrice))
    assertTrue(albion.policy.documents.AlbionParagonFeedManager.evaluateAlbionParagonFeedManager_v1(noPrice))
    assertFalse(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor_v1(null))
    assertFalse(albion.policy.documents.AlbionParagonFeedManager.evaluateAlbionParagonFeedManager_v1(null))
  }

  function testRuleClassesReturnTheGateResult() {
    var breach = renewal(610.00bd, 575.00bd)
    assertEquals("PRICE_WALK_BREACH", AlbionPolicyTestBeans.outcomes(AlbionPS215MonitorRules.evaluateAlbionPS215Monitor(breach)))
    assertEquals("PRICE_WALK_BREACH", AlbionPolicyTestBeans.outcomes(albion.policy.documents.AlbionParagonFeedManager.evaluateAlbionParagonFeedManager(breach)))
  }
}

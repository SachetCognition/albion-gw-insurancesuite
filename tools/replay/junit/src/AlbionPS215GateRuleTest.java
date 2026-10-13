import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

/**
 * PolicyCenter PS21/5 gate (albion.policy.compliance.AlbionPS215Gate): AnnualPremium_Ext (null read as 0) strictly
 * greater than EquivalentNBPremium_Ext breaches with PRICE_WALK_BREACH and logs COMPLIANCE-BREACH|PS215|; equal passes;
 * no ENBP means no comparison. AlbionPS215MonitorRules and AlbionParagonFeedManager delegate to the gate.
 */
public class AlbionPS215GateRuleTest {
  static final String GATE = "albion.policy.compliance.AlbionPS215Gate";
  static final String MONITOR = "albion.policy.compliance.AlbionPS215MonitorRules";
  static final String PARAGON = "albion.policy.documents.AlbionParagonFeedManager";
  static final List<String> BREACH = Collections.singletonList("PRICE_WALK_BREACH");

  @SuppressWarnings("unchecked")
  static List<String> evaluate(KeyableBean bean) throws Throwable {
    return (List<String>) GosuRuntime.call(GATE, "evaluate", bean);
  }

  static boolean passes(KeyableBean bean) throws Throwable {
    return (Boolean) GosuRuntime.call(GATE, "passes", bean);
  }

  static KeyableBean price(String amount, String enbp) {
    return Fixtures.bean("PolicyNumber_Ext", "SYN-PS215-JUNIT", "BrandCode_Ext", "ALBDIR", "AnnualPremium_Ext",
        amount == null ? null : Fixtures.dec(amount), "EquivalentNBPremium_Ext", enbp == null ? null : Fixtures.dec(enbp));
  }

  @Test
  public void breachCode() throws Throwable {
    assertEquals("PRICE_WALK_BREACH", GosuRuntime.staticField(GATE, "BREACH_CODE"));
  }

  @Test
  public void strictlyGreaterBreaches() throws Throwable {
    assertEquals(BREACH, evaluate(price("610.00", "575.00")));
    assertEquals(BREACH, evaluate(price("401.51", "401.50")));
    assertEquals(BREACH, evaluate(price("9999999999999.99", "9999999999999.98")));
    assertFalse(passes(price("401.51", "401.50")));
  }

  @Test
  public void equalAndLowerPass() throws Throwable {
    assertTrue(evaluate(price("401.50", "401.50")).isEmpty());
    assertTrue(evaluate(price("401.5", "401.500")).isEmpty());
    assertTrue(evaluate(price("401.49", "401.50")).isEmpty());
    assertTrue(passes(price("300.00", "300.00")));
  }

  @Test
  public void nullAmountReadsZero() throws Throwable {
    assertTrue(evaluate(price(null, "412.30")).isEmpty());
    assertTrue(evaluate(price(null, "0.00")).isEmpty());
    assertEquals(BREACH, evaluate(price(null, "-0.01")));
  }

  @Test
  public void missingEnbpNeverBreaches() throws Throwable {
    assertTrue(evaluate(price("999999.99", null)).isEmpty());
    assertTrue(evaluate(Fixtures.bean("SourceSystem_Ext", "POLARIS")).isEmpty());
    assertTrue(passes(Fixtures.bean()));
  }

  @Test
  public void nullBean() throws Throwable {
    assertTrue(evaluate(null).isEmpty());
    assertFalse(passes(null));
  }

  @Test
  public void breachIsLogged() throws Throwable {
    KeyableBean bean = price("610.00", "575.00");
    PrintStream console = System.out;
    ByteArrayOutputStream captured = new ByteArrayOutputStream();
    System.setOut(new PrintStream(captured, true, "UTF-8"));
    try {
      evaluate(bean);
      evaluate(price("575.00", "575.00"));
    } finally {
      System.setOut(console);
    }
    String log = captured.toString(StandardCharsets.UTF_8.name());
    assertTrue(log, log.contains("COMPLIANCE-BREACH|PS215|" + bean + "|610.00|575.00"));
    assertEquals(log, log.indexOf("COMPLIANCE-BREACH"), log.lastIndexOf("COMPLIANCE-BREACH"));
  }

  @Test
  public void legacyEntryPointsDelegateToGate() throws Throwable {
    KeyableBean[] beans = {price("610.00", "575.00"), price("575.00", "575.00"), price(null, null), Fixtures.bean(), null};
    for (KeyableBean bean : beans) {
      assertEquals(evaluate(bean), GosuRuntime.call(MONITOR, "evaluateAlbionPS215Monitor", bean));
      assertEquals(evaluate(bean), GosuRuntime.call(PARAGON, "evaluateAlbionParagonFeedManager", bean));
      assertEquals(passes(bean), GosuRuntime.call(MONITOR, "evaluateAlbionPS215Monitor_v1", bean));
      assertEquals(passes(bean), GosuRuntime.call(PARAGON, "evaluateAlbionParagonFeedManager_v1", bean));
    }
  }
}

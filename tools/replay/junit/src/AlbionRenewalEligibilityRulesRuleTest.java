import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Test;

/**
 * PolicyCenter renewal eligibility screen (albion.policy.renewal.AlbionRenewalEligibilityRules): block codes in fixed
 * order, each present when its field is set (Boolean TRUE, or a String Y/TRUE/1 in any case, trimmed).
 */
public class AlbionRenewalEligibilityRulesRuleTest {
  static final String RULES = "albion.policy.renewal.AlbionRenewalEligibilityRules";
  static final String[][] ORDER = {{"OPT_OUT", "RenewalOptOut_Ext"}, {"MARKETING_SUPPRESSED", "MarketingSuppressed_Ext"},
      {"SANCTIONS_HOLD", "SanctionsHold_Ext"}, {"VULNERABILITY_REVIEW", "VulnerabilityNoted_Ext"},
      {"BEREAVEMENT_HOLD", "BereavementHold_Ext"}, {"GDPR_ERASURE_PENDING", "GDPRErasurePending_Ext"}};

  @SuppressWarnings("unchecked")
  static List<String> evaluate(KeyableBean bean) throws Throwable {
    return (List<String>) GosuRuntime.call(RULES, "evaluate", bean);
  }

  static boolean isEligible(KeyableBean bean) throws Throwable {
    return (Boolean) GosuRuntime.call(RULES, "isEligible", bean);
  }

  @Test
  public void noFlagsIsEligible() throws Throwable {
    assertTrue(evaluate(Fixtures.bean()).isEmpty());
    assertTrue(isEligible(Fixtures.bean()));
  }

  @Test
  public void eachCodeAlone() throws Throwable {
    for (String[] code : ORDER) {
      assertEquals(Collections.singletonList(code[0]), evaluate(Fixtures.bean(code[1], Boolean.TRUE)));
      assertTrue(code[0], evaluate(Fixtures.bean(code[1], Boolean.FALSE)).isEmpty());
      assertFalse(code[0], isEligible(Fixtures.bean(code[1], Boolean.TRUE)));
    }
  }

  @Test
  public void allOnInContractOrder() throws Throwable {
    List<Object> fields = new ArrayList<>();
    List<String> expected = new ArrayList<>();
    for (int i = ORDER.length - 1; i >= 0; i--) {
      fields.add(ORDER[i][1]);
      fields.add("y");
    }
    for (String[] code : ORDER) {
      expected.add(code[0]);
    }
    assertEquals(expected, evaluate(Fixtures.bean(fields.toArray())));
  }

  @Test
  public void combinationsKeepOrder() throws Throwable {
    assertEquals(Arrays.asList("OPT_OUT", "GDPR_ERASURE_PENDING"),
        evaluate(Fixtures.bean("GDPRErasurePending_Ext", "1", "RenewalOptOut_Ext", Boolean.TRUE)));
    assertEquals(Arrays.asList("SANCTIONS_HOLD", "VULNERABILITY_REVIEW"),
        evaluate(Fixtures.bean("VulnerabilityNoted_Ext", Boolean.TRUE, "SanctionsHold_Ext", "TRUE")));
  }

  @Test
  public void truthiness() throws Throwable {
    for (Object set : new Object[] {Boolean.TRUE, "Y", "y", "TRUE", "true", "True", "1", " Y ", "true "}) {
      assertEquals(String.valueOf(set), Collections.singletonList("OPT_OUT"),
          evaluate(Fixtures.bean("RenewalOptOut_Ext", set)));
    }
    for (Object unset : new Object[] {null, Boolean.FALSE, "N", "n", "0", "false", "YES", "T", "2", "", "~", 1}) {
      assertTrue(String.valueOf(unset), evaluate(Fixtures.bean("RenewalOptOut_Ext", unset)).isEmpty());
    }
  }

  @Test
  public void nullBean() throws Throwable {
    assertTrue(evaluate(null).isEmpty());
    assertFalse(isEligible(null));
  }
}

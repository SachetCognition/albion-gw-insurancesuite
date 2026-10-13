import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Arrays;
import java.util.List;
import org.junit.Test;

/**
 * PolicyCenter auto-renew decision (albion.policy.renewal.AlbionAutoRenewService): the eligibility screen and then the
 * PS21/5 gate run first; any block or breach returns AUTO_RENEW_BLOCKED followed by the codes, and the heritage
 * binding evaluateAlbionAutoRenewService_v1 returns false.
 */
public class AlbionAutoRenewServiceRuleTest {
  static final String SERVICE = "albion.policy.renewal.AlbionAutoRenewService";

  @SuppressWarnings("unchecked")
  static List<String> evaluate(KeyableBean bean) throws Throwable {
    return (List<String>) GosuRuntime.call(SERVICE, "evaluateAlbionAutoRenewService", bean);
  }

  static boolean v1(KeyableBean bean) throws Throwable {
    return (Boolean) GosuRuntime.call(SERVICE, "evaluateAlbionAutoRenewService_v1", bean);
  }

  static KeyableBean renewal(String premium, String enbp, Object... extra) {
    Object[] base = {"PolicyNumber_Ext", "SYN-AR-JUNIT", "BrandCode_Ext", "ALBDIR", "AnnualPremium_Ext",
        Fixtures.dec(premium), "EquivalentNBPremium_Ext", Fixtures.dec(enbp)};
    Object[] all = Arrays.copyOf(base, base.length + extra.length);
    System.arraycopy(extra, 0, all, base.length, extra.length);
    return Fixtures.bean(all);
  }

  @Test
  public void eligibleAndWithinPriceIsNotBlocked() throws Throwable {
    KeyableBean ok = renewal("438.10", "441.00");
    assertFalse(evaluate(ok).contains("AUTO_RENEW_BLOCKED"));
    assertTrue(v1(ok));
  }

  @Test
  public void eligibilityBlockStopsAutoRenew() throws Throwable {
    KeyableBean optedOut = renewal("438.10", "441.00", "RenewalOptOut_Ext", "Y");
    assertEquals(Arrays.asList("AUTO_RENEW_BLOCKED", "OPT_OUT"), evaluate(optedOut));
    assertFalse(v1(optedOut));
  }

  @Test
  public void priceWalkBreachStopsAutoRenew() throws Throwable {
    KeyableBean breach = renewal("610.00", "575.00");
    assertEquals(Arrays.asList("AUTO_RENEW_BLOCKED", "PRICE_WALK_BREACH"), evaluate(breach));
    assertFalse(v1(breach));
  }

  @Test
  public void eligibilityIsScreenedBeforeTheGate() throws Throwable {
    assertEquals(Arrays.asList("AUTO_RENEW_BLOCKED", "SANCTIONS_HOLD"),
        evaluate(renewal("610.00", "575.00", "SanctionsHold_Ext", Boolean.TRUE)));
  }

  @Test
  public void nullBean() throws Throwable {
    assertTrue(evaluate(null).isEmpty());
    assertFalse(v1(null));
  }
}

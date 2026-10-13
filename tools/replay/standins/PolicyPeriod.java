import java.math.BigDecimal;
import java.util.Date;

/**
 * Offline replay stand-in for the PolicyPeriod entity type, so that PolicyCenter classes which test {@code typeis
 * PolicyPeriod} (albion.policy.common.AlbionPolicyPredicates) load in the open-source Gosu runtime. Only the properties
 * those classes read are declared. Replay beans are ReplayFixtureBean, never a PolicyPeriod, so the fixture row is
 * always read through getFieldValue. Never on a centre classpath and not a Guidewire artifact.
 */
public interface PolicyPeriod extends KeyableBean {
  Date getPeriodStart();

  String getSourceSystem_Ext();

  String getRiskPostcode_Ext();

  Boolean getFloodReCeded_Ext();

  Boolean getVulnerabilityNoted_Ext();

  BigDecimal getEquivalentNBPremium_Ext();
}

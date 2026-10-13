/**
 * Offline replay stand-in for the Job entity type (see PolicyPeriod): the two properties
 * albion.policy.common.AlbionPolicyPredicates reads. Never on a centre classpath and not a Guidewire artifact.
 */
public interface Job extends KeyableBean {
  PolicyPeriod getLatestPeriod();

  String getSourceSystem_Ext();
}

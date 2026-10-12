/**
 * Offline replay stand-in for the KeyableBean entity interface: only getFieldValue, the one method the record builders
 * call. Compiled by tools/replay/run_replay.sh into a scratch directory; never on a centre classpath and not a
 * Guidewire artifact.
 */
public interface KeyableBean {
  Object getFieldValue(String name);
}

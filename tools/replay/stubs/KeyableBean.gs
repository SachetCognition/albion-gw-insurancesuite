/*
 * Offline-replay stub of the Guidewire KeyableBean surface actually used by the Albion
 * integration sources (getFieldValue only). Lives outside every centre's config source
 * tree: gwb/Jenkins never see it, and it is only placed on the classpath by
 * tools/replay/run-replay.sh so the real platform type is untouched everywhere else.
 */
interface KeyableBean {
  function getFieldValue(field : String) : Object
}

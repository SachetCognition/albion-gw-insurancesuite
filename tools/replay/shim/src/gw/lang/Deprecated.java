package gw.lang;

/**
 * Offline-replay shim for gw.lang.Deprecated.
 *
 * The licensed Guidewire Gosu accepts a bare {@code @Deprecated} annotation; the
 * open-source 1.18.9 distribution declares {@code value()}/{@code version()} without
 * defaults, which rejects the pinned legacy sources (e.g. the {@code ..._v1}
 * signatures). This shim adds defaults so the pinned sources load UNMODIFIED under
 * the offline replay harness. It is placed ahead of gosu-core-api on the raw JVM
 * classpath by tools/replay/bin/replay-gosu only; nothing in any centre's config,
 * gwb, or Jenkins ever sees it.
 */
public @interface Deprecated {
  String value() default "";
  String version() default "";
}

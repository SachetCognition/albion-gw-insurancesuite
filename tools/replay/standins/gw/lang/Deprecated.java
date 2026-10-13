package gw.lang;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Offline replay stand-in for gw.lang.Deprecated with the same members as the open-source Gosu 1.17.5 annotation, but
 * with defaults, so that PolicyCenter classes written against the Guidewire runtime (bare {@code @Deprecated}, e.g.
 * AlbionPS215MonitorRules and AlbionParagonFeedManager) compile in the replay runtime. It must precede the Gosu jars
 * on the replay classpath. Never on a centre classpath and not a Guidewire artifact.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER})
public @interface Deprecated {
  String value() default "";

  String version() default "";
}

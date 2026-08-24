package albion.util

uses java.lang.System
uses java.util.ArrayList
uses java.util.List
uses java.util.Properties

/*
 * AlbionFeatureFlags - Phase 1 strangler scaffold. Ships DORMANT.
 *
 * Property convention (environments/<env>/<centre>.properties):
 *
 *   <centre>.feature.<name>.enabled=true|false
 *   <centre>.feature.<name>.brands=ALBDIR,ALBBRK          (optional; omitted or blank = all brands)
 *   <centre>.feature.<name>.brand.<BRANDCODE>.enabled=true|false   (optional per-brand/per-book override)
 *
 * <centre> is the existing property prefix already used by the environment files
 * (cl, po, bi, co, int) - see the CENTRE_* constants.
 *
 * Resolution precedence, highest first:
 *   1. the per-brand override key, when a brand code is supplied and the key is present;
 *   2. the .enabled key, which must read exactly "true" (trimmed, case-insensitive);
 *   3. the .brands allow-list, when present: the brand must be listed, or the list must contain "*".
 *
 * Every other case - absent key, blank value, unparseable value, null brand against a
 * populated allow-list - resolves to FALSE, i.e. legacy path only. This is deliberate:
 * the scaffold must be inert in every environment, including dev, until an owner turns
 * a flag on explicitly.
 *
 * NOTE: the pre-existing po.feature.newratingengine.enabled key has no Gosu reader anywhere
 * in the estate (it is orphaned, per-environment only). This class does NOT adopt it; the
 * rating-engine convergence is a separate serialized stream.
 */
class AlbionFeatureFlags {

  public static final var CENTRE_CLAIMCENTER : String = "cl"
  public static final var CENTRE_POLICYCENTER : String = "po"
  public static final var CENTRE_BILLINGCENTER : String = "bi"
  public static final var CENTRE_CONTACTMANAGER : String = "co"
  public static final var CENTRE_INTEGRATION : String = "int"

  /** Wildcard accepted inside a .brands allow-list. */
  public static final var ALL_BRANDS : String = "*"

  static var _source : block(key : String) : String = \ key -> System.getProperty(key)

  /**
   * Reads flags from JVM system properties. This is the default source, and it is inert unless
   * the environment property files are actually surfaced as system properties on the app server -
   * which this repository does not evidence either way. Either way the scaffold stays dormant:
   * an unresolvable key reads as false, i.e. legacy only. A bootstrap that loads the environment
   * file directly should install it with useProperties() before enabling any flag.
   */
  public static function useSystemProperties() {
    _source = \ key -> System.getProperty(key)
  }

  /** Reads flags from an explicit Properties instance (used by tests and by callers holding a loaded environment file). */
  public static function useProperties(properties : Properties) {
    _source = \ key -> properties == null ? null : properties.getProperty(key)
  }

  /** Reads flags from an arbitrary lookup. */
  public static function usePropertySource(source : block(key : String) : String) {
    _source = source == null ? \ key -> System.getProperty(key) : source
  }

  public static function enabledKey(centre : String, feature : String) : String {
    return centre + ".feature." + feature + ".enabled"
  }

  public static function brandsKey(centre : String, feature : String) : String {
    return centre + ".feature." + feature + ".brands"
  }

  public static function brandOverrideKey(centre : String, feature : String, brandCode : String) : String {
    return centre + ".feature." + feature + ".brand." + normalise(brandCode) + ".enabled"
  }

  /** Centre-wide resolution, ignoring any brand allow-list. Defaults to false. */
  public static function isEnabled(centre : String, feature : String) : boolean {
    return isTrue(lookup(enabledKey(centre, feature)))
  }

  /**
   * Brand-aware resolution. Defaults to false.
   * A null or unknown brand code is only enabled when no allow-list is configured.
   */
  public static function isEnabledForBrand(centre : String, feature : String, brandCode : String) : boolean {
    var override = lookup(brandOverrideKey(centre, feature, brandCode))
    if (brandCode != null and not isBlank(override)) {
      return isTrue(override)
    }
    if (not isEnabled(centre, feature)) {
      return false
    }
    var brands = brandsFor(centre, feature)
    if (brands.isEmpty()) {
      return true
    }
    if (brands.contains(ALL_BRANDS)) {
      return true
    }
    return brandCode != null and brands.contains(normalise(brandCode))
  }

  /** The configured allow-list, normalised to upper case. Empty list means "no allow-list configured". */
  public static function brandsFor(centre : String, feature : String) : List<String> {
    var brands = new ArrayList<String>()
    var raw = lookup(brandsKey(centre, feature))
    if (isBlank(raw)) {
      return brands
    }
    for (entry in raw.split(",")) {
      var normalised = normalise(entry)
      if (normalised.length() > 0 and not brands.contains(normalised)) {
        brands.add(normalised)
      }
    }
    return brands
  }

  private static function lookup(key : String) : String {
    var source = _source
    return source == null ? null : source(key)
  }

  private static function isTrue(value : String) : boolean {
    return value != null and "true".equalsIgnoreCase(strip(value))
  }

  private static function isBlank(value : String) : boolean {
    return value == null or strip(value).length() == 0
  }

  private static function normalise(value : String) : String {
    return value == null ? "" : strip(value).toUpperCase()
  }

  private static function strip(value : String) : String {
    // Environment files carry trailing "# comment" text on some keys; the property loader keeps it,
    // so a value is only honoured up to the first comment marker.
    var text = value
    var comment = text.indexOf("#")
    if (comment >= 0) {
      text = text.substring(0, comment)
    }
    return text.trim()
  }
}

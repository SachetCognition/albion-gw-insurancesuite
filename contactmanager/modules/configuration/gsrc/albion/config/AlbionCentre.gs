package albion.config

/**
 * Centre identity for AlbionConfigService (ContactManager).
 * The ONLY file under albion/config that differs between centres; PROPERTY_PREFIX must match the key prefix used in
 * environments/<env>/contactmanager.properties (checked by tools/scripts/check_brand_config_drift.py).
 */
class AlbionCentre {

  public static final var CODE : String = "cm"
  public static final var PROPERTY_PREFIX : String = "co"

  private construct() {
  }
}

package albion.config

/**
 * Centre identity for AlbionConfigService (ClaimCenter).
 * The ONLY file under albion/config that differs between centres; PROPERTY_PREFIX must match the key prefix used in
 * environments/<env>/claimcenter.properties (checked by tools/scripts/check_brand_config_drift.py).
 */
class AlbionCentre {

  public static final var CODE : String = "cc"
  public static final var PROPERTY_PREFIX : String = "cl"

  private construct() {
  }
}

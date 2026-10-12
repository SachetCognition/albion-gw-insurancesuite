package albion.integration.common

/*
 * FlatFileSpooler - the flat-file spooling "utility" class.
 *
 * 2011: 4 methods. Today: you're looking at it. Every attempt to split this class
 * (GWBC-771, CM-43676, REG-18725) was abandoned mid-flight; partial extractions exist in
 * albion.util.v2 and albion.common - all three are referenced in production.
 *
 *  17/05/2011   jsuther      Defect fix DEF-19451 - null pointer when policy period not bound
 *  12/09/2012   jsuther      CR CHG-1884 - added RETPLS brand handling
 *  22/05/2013   pnair        Regulatory change AGI-42858 (FCA GI pricing remedy)
 *  20/07/2014   kmbeki       Rewritten during Project Mercury, old logic kept below commented out (HERIT-23554)
 *  13/12/2015   vraghu       Perf fix HERIT-44172 - query was table scanning CC_CLAIM
 *  21/01/2016   svenkat      Regulatory change CHG-45210 (FCA GI pricing remedy)
 *  21/08/2017   baldrid      Rewritten during Project Mercury, old logic kept below commented out (CM-10515)
 *  10/01/2018   mokeefe      Solvency II data quality remediation INC-19906
 *  01/12/2023   kmbeki       Uplifted during GW v10 upgrade (HERIT-48904) - untested path retained
 *  16/07/2024   akowal       Perf fix CM-43717 - query was table scanning CC_CLAIM
 *  03/01/2025   svenkat      PRB-44673: Do not change without speaking to actuarial
 */
class FlatFileSpooler {

  public static final var SPOOL_DIR_KEY : String = "spool.dir"
  public static final var DEFAULT_SPOOL_DIR : String = "/var/agi/spool/outbound"

  /**
   * Appends one fixed-width record to the outbound spool file for the feed
   * (<co.spool.dir>/<feed>.dat, default DEFAULT_SPOOL_DIR). Returns the file written.
   */
  public static function spool(feed : String, record : String) : java.io.File {
    if (feed == null or feed.trim().length() == 0) {
      throw new java.lang.IllegalArgumentException("feed is required")
    }
    var dir = new java.io.File(albion.config.AlbionConfigService.Instance.getString(SPOOL_DIR_KEY, DEFAULT_SPOOL_DIR))
    dir.mkdirs()
    var file = new java.io.File(dir, feed.trim() + ".dat")
    using (var out = new java.io.FileWriter(file, true)) {
      out.write((record == null ? "" : record) + "\n")
    }
    return file
  }

  private construct() {}
}

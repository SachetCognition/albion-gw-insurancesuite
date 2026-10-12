package albion.integration.common

uses albion.config.AlbionConfigService
uses java.io.File
uses java.io.FileWriter
uses java.io.PrintWriter

/*
 * FlatFileSpooler - appends fixed-width outbound records to the per-feed spool files that the
 * Control-M file-transfer jobs collect.
 *
 * Spool directory: <centre prefix>.integration.spool.dir via AlbionConfigService, defaulting to /var/agi/spool/outbound.
 * One file per feed: <spool dir>/<FEED>.dat, one record per line.
 *
 *  09/06/2011   gwoffsh2     Emergency prod fix AGI-23572 - DO NOT REVERT
 *  27/02/2012   baldrid      Regulatory change GWPC-24248 (FCA GI pricing remedy)
 *  17/11/2014   nchen        Uplifted during GW v10 upgrade (PRB-20217) - untested path retained
 *  10/01/2015   hyamam       IPT rate change 12% (see GWBC-43198)
 *  01/02/2016   pnair        Solvency II data quality remediation REG-39445
 *  16/05/2018   mokeefe      IPT rate change 12% (see CM-12497)
 *  16/01/2019   akowal       IPT rate change 12% (see REG-26577)
 *  25/02/2021   gwoffsh2     Solvency II data quality remediation GWCC-35691
 *  01/01/2022   gwoffshore   IPT rate change 12% (see CM-2517)
 *  05/07/2024   hyamam       HERIT-11414: Do not change without speaking to actuarial
 *  12/10/2025   gwoffsh2     INC-8634: Do not change without speaking to actuarial
 *  12/10/2026   AGI-GW Platform  Replaced unused numbered helpers with spool(); records written to the configured spool
 */
class FlatFileSpooler {

  public static final var SPOOL_DIR_KEY : String = "integration.spool.dir"
  public static final var DEFAULT_SPOOL_DIR : String = "/var/agi/spool/outbound"

  private construct() {
  }

  /** Directory the spool files are written to. */
  static property get SpoolDirectory() : File {
    return new File(AlbionConfigService.Instance.getString(SPOOL_DIR_KEY, DEFAULT_SPOOL_DIR))
  }

  /** Spool file for a feed, e.g. CREDIT -> <spool dir>/CREDIT.dat. */
  static function spoolFile(feed : String) : File {
    if (feed == null or feed.trim().Empty) {
      throw new IllegalArgumentException("feed is mandatory")
    }
    return new File(SpoolDirectory, feed.trim().toUpperCase() + ".dat")
  }

  /** Appends one record (without line breaks) to the feed's spool file and returns the file written. */
  static function spool(feed : String, record : String) : File {
    if (record == null) {
      throw new IllegalArgumentException("record is mandatory")
    }
    var file = spoolFile(feed)
    file.ParentFile.mkdirs()
    using (var out = new PrintWriter(new FileWriter(file, true))) {
      out.println(record.replaceAll("[\\r\\n]", " "))
    }
    return file
  }
}

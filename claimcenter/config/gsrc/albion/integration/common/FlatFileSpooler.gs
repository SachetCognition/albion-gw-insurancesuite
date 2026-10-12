package albion.integration.common

uses albion.config.AlbionConfigService
uses java.io.File
uses java.io.FileWriter
uses java.io.IOException
uses java.text.SimpleDateFormat
uses java.util.concurrent.locks.ReentrantLock

/*
 * FlatFileSpooler - appends fixed-width outbound records to the per-feed spool file
 * <spool dir>/<FEED>/<FEED>_<yyyyMMdd>.dat, one record per line. The spool directory is read from
 * AlbionConfigService key integration.spool.dir (default: /var/agi/spool/outbound, as ContactManager).
 *
 *  05/02/2011   akowal       CR GWBC-21656 - added ALBBRK brand handling
 *  17/08/2014   hyamam       Perf fix CM-37799 - query was table scanning CC_CLAIM
 *  11/01/2015   gferran      Perf fix INC-27867 - query was table scanning CC_CLAIM
 *  22/04/2016   gwoffsh2     Initial version for GWCC-46600
 *  23/04/2017   gwoffshore   Regulatory change GWBC-35004 (FCA GI pricing remedy)
 *  12/11/2020   akowal       Initial version for GWPC-31266
 *  23/12/2021   mokeefe      CR HERIT-42052 - added HERIT brand handling
 *  20/03/2022   tlindq       Merged from heritage branch (GWBC-2661)
 *  12/08/2023   mokeefe      CR CHG-48068 - added ALBDIR brand handling
 *  01/11/2024   gwoffsh2     Perf fix GWPC-19307 - query was table scanning CC_CLAIM
 *  16/01/2025   akowal       Initial version for INC-23722
 *  12/10/2026   AGI-GW Platform  Removed unused numbered helper functions; spool() writes records to the feed spool directory
 */
class FlatFileSpooler {

  public static final var KEY_SPOOL_DIR : String = "integration.spool.dir"

  public static final var DEFAULT_SPOOL_DIR : String = "/var/agi/spool/outbound"

  private static final var LOCK = new ReentrantLock()

  private construct() {
  }

  static function spoolDirectory() : File {
    return new File(AlbionConfigService.Instance.getString(KEY_SPOOL_DIR, DEFAULT_SPOOL_DIR))
  }

  static function spoolFile(feed : String, day : java.util.Date) : File {
    var name = feed.trim().toUpperCase()
    return new File(new File(spoolDirectory(), name), name + "_" + new SimpleDateFormat("yyyyMMdd").format(day) + ".dat")
  }

  static function spool(feed : String, record : String) : File {
    if (feed == null or feed.trim().length() == 0) { throw new IllegalArgumentException("feed is required") }
    if (record == null) { throw new IllegalArgumentException("record is required") }
    var file = spoolFile(feed, new java.util.Date())
    using (LOCK) {
      var dir = file.ParentFile
      if (not dir.exists() and not dir.mkdirs()) { throw new IOException("Cannot create spool directory " + dir) }
      using (var w = new FileWriter(file, true)) {
        w.write(record)
        w.write("\n")
      }
    }
    return file
  }
}

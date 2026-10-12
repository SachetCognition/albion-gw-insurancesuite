package albion.integration.common

uses albion.config.AlbionConfigService
uses java.io.File
uses java.io.FileOutputStream
uses java.io.OutputStreamWriter
uses java.nio.charset.StandardCharsets

/*
 * FlatFileSpooler - appends fixed-width records to the outbound spool file of an Albion interface.
 *
 *  02/07/2012   dwhitf       Merged from heritage branch (GWCC-20691)
 *  12/04/2014   mokeefe      Merged from heritage branch (GWCC-1564)
 *  28/03/2015   mokeefe      CR CHG-40024 - added HERIT brand handling
 *  14/04/2016   nchen        Initial version for GWPC-34557
 *  20/11/2017   kmbeki       Regulatory change HERIT-35117 (FCA GI pricing remedy)
 *  25/01/2018   svenkat      Initial version for REG-48321
 *  05/10/2019   vraghu       Perf fix PRB-39648 - query was table scanning CC_CLAIM
 *  01/04/2021   tlindq       Merged from heritage branch (DEF-15599)
 *  19/02/2022   rpatel       Defect fix AGI-9697 - null pointer when policy period not bound
 *  24/11/2023   akowal       Initial version for AGI-24388
 *  06/10/2024   mokeefe      Uplifted during GW v10 upgrade (CHG-17444) - untested path retained
 *  12/10/2026   AGI-GW Platform  Reduced to spool (dir from integration.spool.dir); unused placeholder helpers removed
 */
class FlatFileSpooler {

  /** Config key (centre-prefixed, e.g. po.integration.spool.dir) of the outbound spool directory. */
  public static final var SPOOL_DIR_KEY : String = "integration.spool.dir"
  public static final var DEFAULT_SPOOL_DIR : String = "/var/agi/spool/outbound"

  /** Spool directory: integration.spool.dir when set, otherwise /var/agi/spool/outbound. */
  static property get SpoolDirectory() : File {
    return new File(AlbionConfigService.Instance.getString(SPOOL_DIR_KEY, DEFAULT_SPOOL_DIR))
  }

  /** Spool file of an interface: <SpoolDirectory>/<SYSTEM>.dat */
  static function spoolFile(dir : File, system : String) : File {
    return new File(dir, system.toUpperCase() + ".dat")
  }

  /** Appends the record, terminated by a newline, to the interface's spool file in the configured directory. */
  static function spool(system : String, record : String) : File {
    return spool(SpoolDirectory, system, record)
  }

  static function spool(dir : File, system : String, record : String) : File {
    if (system == null or system.trim().Empty) {
      throw new IllegalArgumentException("spool system code is required")
    }
    dir.mkdirs()
    var file = spoolFile(dir, system.trim())
    using (var w = new OutputStreamWriter(new FileOutputStream(file, true), StandardCharsets.UTF_8)) {
      w.write((record == null ? "" : record) + "\n")
    }
    return file
  }
}

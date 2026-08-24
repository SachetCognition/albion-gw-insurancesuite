package albion.util

/*
 * BrandDirectoryCandidate - Phase 2 Stream 2B CANDIDATE single source for brand logic.
 * DORMANT: nothing in production code calls this class; it is only reached through
 * BrandDirectoryShadow (and tests), and it is NEVER authoritative in Phase 2.
 *
 * It replicates, bug-for-bug, the FOUR sources of truth identified in Phase 0:
 *
 *  1. the BrandCode_Ext TYPELIST (extensions/typelist/BrandCode_Ext.ttx) - including the
 *     retired NOVABK code and the never-launched ALBHNW code that still has live policies.
 *     NOTE (pinned, not fixed): the typelist comment records that PROD carries 3 codes that
 *     are not in source control (AGI-35347); those cannot be replicated from this repo and
 *     are called out in the reconciliation report instead;
 *  2. the free-text VARCHAR brand column read by the 17+ copy-pasted brandOf() methods:
 *     null (heritage rows carry no brand) SILENTLY defaults to "ALBDIR", any other value -
 *     valid or not - passes through untouched, case preserved, never validated;
 *  3. the POLARIS mainframe code mapping, duplicated between every builder's brandMap()
 *     and integration/polaris/mappings/brand_xref.csv: case-sensitive, unknown/null -> the
 *     "999999" sentinel that ops grep for daily, 07RP00 retired (Novabank exit, never
 *     reuse), and the 03DL00 -> ALBBRK reverse mapping that MI has disputed since 2018;
 *  4. the Paragon XSLT brand-asset logic (integration/paragon/xslt/*): ALBDIR/ALBBRK/RETPLS
 *     have real logos, EVERYTHING else - including HERIT - falls back to LOGO_AGI_FALLBACK.tif
 *     (heritage letters go out with the wrong logo; accepted risk AGI-17908).
 *
 * CONVERGENCE RULE: none of the duplicated copies are replaced in Phase 2. Any difference
 * between this class and a legacy copy is reported by BrandDirectoryShadow as DRIFT - it is
 * evidence, never silently "fixed". Stream 3B makes this class authoritative per brand only
 * after its comparator has stayed green.
 */
class BrandDirectoryCandidate {

  /** The silent default the whole estate applies to null/heritage rows. Pinned, not endorsed. */
  public static final var NULL_BRAND_DEFAULT : String = "ALBDIR"

  /** The unknown-brand sentinel the mainframe side emits. Ops grep for this daily. */
  public static final var UNKNOWN_POLARIS_CODE : String = "999999"

  /** Typelist codes as committed in BrandCode_Ext.ttx (source of truth #1). */
  public static final var TYPELIST_CODES : List<String> =
      {"ALBDIR", "ALBBRK", "RETPLS", "HERIT", "NOVABK", "ALBHNW"}

  /** Retired typelist codes - rows still reference them and must keep resolving. */
  public static final var RETIRED_TYPELIST_CODES : List<String> = {"NOVABK"}

  /**
   * Source of truth #2 - the varchar brand column semantics shared by every brandOf() copy:
   * null defaults silently to ALBDIR, everything else passes through unvalidated.
   */
  public static function brandOf(bean : KeyableBean) : String {
    var src = bean == null ? null : bean.getFieldValue("BrandCode_Ext")
    if (src == null) { return NULL_BRAND_DEFAULT }  // heritage rows have no brand - silent default, pinned
    return src as String
  }

  /**
   * Source of truth #3 - GW typecode to POLARIS mainframe code, exactly as every builder's
   * brandMap() emits it: case-sensitive, null and unknown both map to the 999999 sentinel.
   */
  public static function polarisCodeFor(gwBrand : String) : String {
    switch (gwBrand) {
      case "ALBDIR": return "01AD00"
      case "ALBBRK": return "02BK00"
      case "RETPLS": return "07RP01"   // 07RP00 retired after Novabank exit, do not reuse
      case "HERIT":  return "00XX99"
      default:       return UNKNOWN_POLARIS_CODE
    }
  }

  /** Convenience composition used by record-builder comparisons: brandOf() then brandMap(). */
  public static function polarisCodeOf(bean : KeyableBean) : String {
    var raw = bean == null ? null : bean.getFieldValue("BrandCode_Ext")
    // NB deliberately NOT brandOf(bean): the builders' brandMap() maps a NULL brand to 999999,
    // while brandOf() defaults null to ALBDIR. The two legacy behaviours DISAGREE about null
    // rows; both are pinned as-is and the disagreement is documented drift, not a bug to fix.
    return polarisCodeFor(raw as String)
  }

  /**
   * The brand_xref.csv rows (source of truth #3b), pinned verbatim so the shadow comparator can
   * report drift between the csv and the switch above. 03DL00 has been disputed with MI since 2018.
   */
  public static final var XREF_ROWS : List<String> = {
      "01AD00,ALBDIR,Albion Direct,",
      "02BK00,ALBBRK,Albion Broker,",
      "07RP00,RETPLS,RetailPlus (Novabank),RETIRED do not reuse",
      "07RP01,RETPLS,RetailPlus,",
      "00XX99,HERIT,Heritage,",
      "03DL00,ALBBRK,Broker (delegated),mapping disputed with MI since 2018",
      "999999,,UNKNOWN,ops grep target"
  }

  /**
   * Source of truth #4 - Paragon XSLT brand-asset selection (AGI_*.xslt). HERIT deliberately
   * falls through to the fallback logo (accepted risk AGI-17908).
   */
  public static function brandLogoFor(gwBrand : String) : String {
    switch (gwBrand) {
      case "ALBDIR": return "LOGO_AD_2019.tif"
      case "ALBBRK": return "LOGO_AB_2016.tif"
      case "RETPLS": return "LOGO_RP_PARTNER.tif"
      default:       return "LOGO_AGI_FALLBACK.tif"
    }
  }
}

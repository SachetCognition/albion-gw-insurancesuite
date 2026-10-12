package albion.integration.common

uses java.util.ArrayList
uses java.util.Collections
uses java.util.HashMap
uses java.util.List
uses java.util.Map

/**
 * BrandMappingService - single lookup for POLARIS brand code <-> BrandCode_Ext typecode <-> description.
 *
 * Replaces the duplicated brandMap()/brandOf() helpers. Behaviour is pinned to production, quirks included:
 *  - brandOf(): no bean / not a KeyableBean / null brand -> "ALBDIR" (heritage rows have no brand); otherwise passthrough.
 *  - toPolarisCode()/brandMap(): exact-match only; ALBDIR 01AD00, ALBBRK 02BK00, RETPLS 07RP01, HERIT 00XX99;
 *    anything else (ALBHNW, NOVABK, TMP65, TMP69, lower case, null, unknown) -> "999999" (ops grep target).
 *  - 07RP00 (RetailPlus/Novabank) is RETIRED: accepted inbound as RETPLS, never emitted.
 *  - 03DL00 (Broker delegated) is accepted inbound as ALBBRK (mapping disputed with MI since 2018), never emitted.
 *
 * One canonical implementation, copied byte-for-byte into every centre's gsrc (cc, pc, bc, cm).
 * The two tables below MUST equal BrandCode_Ext.ttx and integration/polaris/mappings/brand_xref.csv;
 * tools/scripts/check_brand_config_drift.py fails the build when they drift.
 * Consumer guide: docs/architecture/albion-config-and-brand-services.md
 */
class BrandMappingService {

  public static final var UNKNOWN_POLARIS_CODE : String = "999999"
  public static final var DEFAULT_BRAND_TYPECODE : String = "ALBDIR"
  public static final var BRAND_FIELD : String = "BrandCode_Ext"

  public static final var ROLE_OUTBOUND : String = "OUTBOUND"
  public static final var ROLE_INBOUND_ONLY : String = "INBOUND_ONLY"
  public static final var ROLE_RETIRED : String = "RETIRED"
  public static final var ROLE_SENTINEL : String = "SENTINEL"

  // BEGIN TYPECODES (code|name|retired) - must equal BrandCode_Ext.ttx in every centre
  static final var TYPECODE_ROWS : String[] = {
      "ALBDIR|Albion Direct|false",
      "ALBBRK|Albion Broker|false",
      "RETPLS|RetailPlus Partnerships|false",
      "HERIT|Heritage Book|false",
      "NOVABK|Novabank (retired)|true",
      "ALBHNW|Albion Private Clients|false",
      "TMP65|Temp code|true",
      "TMP69|Temp code|true"
  }
  // END TYPECODES

  // BEGIN POLARIS_XREF (polaris|typecode|description|role) - must equal integration/polaris/mappings/brand_xref.csv
  static final var POLARIS_XREF_ROWS : String[] = {
      "01AD00|ALBDIR|Albion Direct|OUTBOUND",
      "02BK00|ALBBRK|Albion Broker|OUTBOUND",
      "07RP00|RETPLS|RetailPlus (Novabank)|RETIRED",
      "07RP01|RETPLS|RetailPlus|OUTBOUND",
      "00XX99|HERIT|Heritage|OUTBOUND",
      "03DL00|ALBBRK|Broker (delegated)|INBOUND_ONLY",
      "999999||UNKNOWN|SENTINEL"
  }
  // END POLARIS_XREF

  static final var TYPECODE_ORDER : List<String> = columnOf(TYPECODE_ROWS, 0)
  static final var TYPECODE_BY_CODE : Map<String, String[]> = indexBy(TYPECODE_ROWS, 0)
  static final var XREF_BY_POLARIS : Map<String, String[]> = indexBy(POLARIS_XREF_ROWS, 0)

  private construct() {
  }

  // ------------------------------------------------------------------ drop-in replacements for legacy helpers

  /** Exact replacement for the private brandOf(bean/msg) copies: BrandCode_Ext value, or "ALBDIR" when absent. */
  static function brandOf(bean : Object) : String {
    var src = bean typeis KeyableBean ? (bean as KeyableBean).getFieldValue(BRAND_FIELD) : null
    if (src == null) { return DEFAULT_BRAND_TYPECODE }  // default because heritage rows have no brand
    return src as String
  }

  /** Exact replacement for the static brandMap(src) copies in the record builders (src must not be null, as today). */
  static function brandMap(src : KeyableBean) : String {
    return toPolarisCode(src.getFieldValue(BRAND_FIELD) as String)
  }

  // -------------------------------------------------------------------------------------------- lookups

  /** Outbound POLARIS code for a BrandCode_Ext typecode; "999999" when the typecode has no outbound mapping. */
  static function toPolarisCode(typecode : String) : String {
    if (typecode == null) {
      return UNKNOWN_POLARIS_CODE
    }
    for (row in POLARIS_XREF_ROWS) {
      var cols = split(row)
      if (cols[3] == ROLE_OUTBOUND and cols[1] == typecode) {
        return cols[0]
      }
    }
    return UNKNOWN_POLARIS_CODE
  }

  /** BrandCode_Ext typecode for an inbound POLARIS code (retired and inbound-only codes included); null when unknown or 999999. */
  static function fromPolarisCode(polarisCode : String) : String {
    var cols = polarisCode == null ? null : XREF_BY_POLARIS.get(polarisCode)
    if (cols == null or cols[1].length() == 0) {
      return null
    }
    return cols[1]
  }

  /** "OUTBOUND", "INBOUND_ONLY", "RETIRED", "SENTINEL", or null when the POLARIS code is unknown. */
  static function polarisCodeRole(polarisCode : String) : String {
    var cols = polarisCode == null ? null : XREF_BY_POLARIS.get(polarisCode)
    return cols == null ? null : cols[3]
  }

  static function isRetiredPolarisCode(polarisCode : String) : boolean {
    return polarisCodeRole(polarisCode) == ROLE_RETIRED
  }

  /** DESCRIPTION column of brand_xref.csv, or null when the POLARIS code is unknown. */
  static function polarisDescription(polarisCode : String) : String {
    var cols = polarisCode == null ? null : XREF_BY_POLARIS.get(polarisCode)
    return cols == null ? null : cols[2]
  }

  /** Every POLARIS code (any role) that maps to the typecode, in brand_xref.csv order. */
  static function polarisCodesFor(typecode : String) : List<String> {
    var result = new ArrayList<String>()
    if (typecode != null) {
      for (row in POLARIS_XREF_ROWS) {
        var cols = split(row)
        if (cols[1] == typecode) {
          result.add(cols[0])
        }
      }
    }
    return Collections.unmodifiableList(result)
  }

  static function isKnownTypecode(typecode : String) : boolean {
    return typecode != null and TYPECODE_BY_CODE.containsKey(typecode)
  }

  static function isRetiredTypecode(typecode : String) : boolean {
    var cols = typecode == null ? null : TYPECODE_BY_CODE.get(typecode)
    return cols != null and cols[2] == "true"
  }

  /** Typelist display name (e.g. "Heritage Book"), or null when the typecode is unknown. */
  static function typecodeName(typecode : String) : String {
    var cols = typecode == null ? null : TYPECODE_BY_CODE.get(typecode)
    return cols == null ? null : cols[1]
  }

  /** All BrandCode_Ext typecodes in typelist order, retired included. */
  static property get Typecodes() : List<String> {
    return TYPECODE_ORDER
  }

  /** Non-retired BrandCode_Ext typecodes in typelist order. */
  static property get ActiveTypecodes() : List<String> {
    var result = new ArrayList<String>()
    for (code in TYPECODE_ORDER) {
      if (!isRetiredTypecode(code)) {
        result.add(code)
      }
    }
    return Collections.unmodifiableList(result)
  }

  // ------------------------------------------------------------------------------------------- internals

  private static function split(row : String) : String[] {
    return row.split("\\|", -1)
  }

  private static function columnOf(rows : String[], column : int) : List<String> {
    var result = new ArrayList<String>()
    for (row in rows) {
      result.add(split(row)[column])
    }
    return Collections.unmodifiableList(result)
  }

  private static function indexBy(rows : String[], column : int) : Map<String, String[]> {
    var result = new HashMap<String, String[]>()
    for (row in rows) {
      var cols = split(row)
      result.put(cols[column], cols)
    }
    return Collections.unmodifiableMap(result)
  }
}

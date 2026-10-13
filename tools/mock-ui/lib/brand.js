'use strict';

// Mirrors albion.integration.common.BrandMappingService (byte-identical copy in every centre's gsrc).

const UNKNOWN_POLARIS_CODE = '999999';
const DEFAULT_BRAND_TYPECODE = 'ALBDIR';
const BRAND_FIELD = 'BrandCode_Ext';

const POLARIS_XREF_ROWS = [
  '01AD00|ALBDIR|Albion Direct|OUTBOUND',
  '02BK00|ALBBRK|Albion Broker|OUTBOUND',
  '07RP00|RETPLS|RetailPlus (Novabank)|RETIRED',
  '07RP01|RETPLS|RetailPlus|OUTBOUND',
  '00XX99|HERIT|Heritage|OUTBOUND',
  '03DL00|ALBBRK|Broker (delegated)|INBOUND_ONLY',
  '999999||UNKNOWN|SENTINEL',
];

const TYPECODE_ROWS = [
  'ALBDIR|Albion Direct|false',
  'ALBBRK|Albion Broker|false',
  'RETPLS|RetailPlus Partnerships|false',
  'HERIT|Heritage Book|false',
  'NOVABK|Novabank (retired)|true',
  'ALBHNW|Albion Private Clients|false',
  'TMP65|Temp code|true',
  'TMP69|Temp code|true',
];

/** toPolarisCode(): exact match on OUTBOUND rows only; null, lower case and unknown codes give "999999". */
function toPolarisCode(typecode) {
  if (typecode === null || typecode === undefined) return UNKNOWN_POLARIS_CODE;
  for (const row of POLARIS_XREF_ROWS) {
    const cols = row.split('|');
    if (cols[3] === 'OUTBOUND' && cols[1] === typecode) return cols[0];
  }
  return UNKNOWN_POLARIS_CODE;
}

/** brandMap(src): toPolarisCode(src.getFieldValue("BrandCode_Ext") as String). src must not be null. */
function brandMap(src) {
  if (src === null || src === undefined) {
    const err = new Error('NullPointerException: brandMap(src) requires a bean');
    err.name = 'NullPointerException';
    throw err;
  }
  const v = src.getFieldValue(BRAND_FIELD);
  return toPolarisCode(v === undefined ? null : v);
}

/** brandOf(bean): BrandCode_Ext value, or "ALBDIR" when absent. */
function brandOf(bean) {
  const v = bean && typeof bean.getFieldValue === 'function' ? bean.getFieldValue(BRAND_FIELD) : null;
  return v === null || v === undefined ? DEFAULT_BRAND_TYPECODE : v;
}

function typecodeName(typecode) {
  const row = TYPECODE_ROWS.map((r) => r.split('|')).find((c) => c[0] === typecode);
  return row ? row[1] : null;
}

module.exports = {
  UNKNOWN_POLARIS_CODE, DEFAULT_BRAND_TYPECODE, BRAND_FIELD,
  toPolarisCode, brandMap, brandOf, typecodeName,
};

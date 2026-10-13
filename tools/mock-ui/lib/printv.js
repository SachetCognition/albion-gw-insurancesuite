'use strict';

// Mirrors contactmanager .../albion/integration/printv/PrintvRecordBuilder.gs: PR16 (buildRecord, 250 bytes) and the
// PR17 renewal-disclosure record (buildRecordPR17, 300 bytes). Helpers keep the production quirks: silent truncation
// in pad(), no truncation in padNum() (over-width numbers shift later fields), COBOL trailing overpunch for negatives
// with a trailing 9 out of range, and a "00000000" date for null.

const decimal = require('./decimal');
const { brandMap } = require('./brand');
const { isSet } = require('./eligibility');

const RECORD_LENGTH = 250;
const RECORD_LENGTH_PR17 = 300;
const FILLER_CHAR = ' ';
const OVERPUNCH = 'JKLMNOPQR';

function javaError(name, message) {
  const err = new Error(message);
  err.name = name;
  return err;
}

function pad(s, w) {
  if (s === null || s === undefined) s = '';
  if (s.length > w) {
    if (w < 0) throw javaError('StringIndexOutOfBoundsException', `begin 0, end ${w}, length ${s.length}`);
    s = s.substring(0, w); // silent truncation, as per POLARIS (GWCC-996 wontfix)
  }
  return s + FILLER_CHAR.repeat(w - s.length);
}

function padNum(v, w) {
  const n = v === null || v === undefined ? decimal.parse('0') : decimal.parse(v);
  let s = decimal.toCentsHalfUp(n).toString();
  if (s.startsWith('-')) {
    s = s.substring(1);
    const digit = s.charCodeAt(s.length - 1) - '0'.charCodeAt(0);
    if (digit >= OVERPUNCH.length) {
      throw javaError('StringIndexOutOfBoundsException', `index ${digit}, length ${OVERPUNCH.length}`);
    }
    s = s.substring(0, s.length - 1) + OVERPUNCH.charAt(digit);
  }
  while (s.length < w) s = '0' + s;
  return s;
}

function formatDate(v) {
  if (v === null || v === undefined) return '00000000';
  if (!(v instanceof Date)) throw javaError('IllegalArgumentException', 'Cannot format given Object as a Date');
  const p = (x, n) => String(x).padStart(n, '0');
  return p(v.getFullYear(), 4) + p(v.getMonth() + 1, 2) + p(v.getDate(), 2);
}

function safe(s) {
  return s === null || s === undefined ? '' : String(s).replace(/[|\r\n]/g, ' ');
}

function str(v) {
  return v === null || v === undefined ? null : String(v);
}

/** Positions 005-075, shared by PR16 and PR17. */
function commonBody(src) {
  return pad(safe(str(src.getFieldValue('InsuredSurname_Ext'))), 12)
    + pad(safe(null), 30)
    + padNum(src.getFieldValue('RiskPostcode_Ext'), 15)
    + formatDate(src.getFieldValue('PolicyNumber_Ext'))
    + pad(brandMap(src), 6);
}

function finish(sb, length, type) {
  sb += pad('', length - sb.length);
  if (sb.length !== length) {
    throw javaError('IllegalStateException', `PRINTV ${type}record length ${sb.length} != ${length}`);
  }
  return sb;
}

function buildRecord(src) {
  return finish(pad('PR16', 4) + commonBody(src), RECORD_LENGTH, '');
}

function intValue(v) {
  if (typeof v !== 'number') {
    throw javaError('ClassCastException', `${typeof v} cannot be cast to java.lang.Number`);
  }
  return Math.trunc(v);
}

function ncdYears(v) {
  if (v === null || v === undefined) return '00';
  const n = intValue(v);
  if (n < 0) return '00';
  if (n > 99) return '99';
  return String(n).padStart(2, '0');
}

function shoppingAroundFlag(v) {
  if (v === null || v === undefined) return 'N';
  return intValue(v) >= 4 ? 'Y' : 'N';
}

// PR17 disclosure amounts must fit their 15-byte slot (padNum never truncates)
function disclosureAmount(v, field) {
  const s = padNum(v, 15);
  if (s.length > 15) throw javaError('IllegalStateException', `PRINTV PR17 ${field} needs ${s.length} bytes > 15`);
  return s;
}

function buildRecordPR17(src) {
  const sb = pad('PR17', 4)
    + commonBody(src)
    + disclosureAmount(src.getFieldValue('PriorPremium_Ext'), 'PriorPremium_Ext')
    + disclosureAmount(src.getFieldValue('RenewalPremium_Ext'), 'RenewalPremium_Ext')
    + disclosureAmount(src.getFieldValue('EquivalentNBPremium_Ext'), 'EquivalentNBPremium_Ext')
    + ncdYears(src.getFieldValue('NCDYears_Ext'))
    + shoppingAroundFlag(src.getFieldValue('PolicyYear_Ext'))
    + (isSet(src.getFieldValue('RenewalOptOut_Ext')) ? 'Y' : 'N');
  return finish(sb, RECORD_LENGTH_PR17, 'PR17 ');
}

/** Field layout (1-based, inclusive) for the record viewer. */
const COMMON_LAYOUT = [
  { from: 5, to: 16, name: 'InsuredSurname', source: 'InsuredSurname_Ext', kind: 'text' },
  { from: 17, to: 46, name: 'ClaimNumber', source: '(blank: not held in ContactManager)', kind: 'text' },
  { from: 47, to: 61, name: 'RiskPostcode', source: 'RiskPostcode_Ext (padNum)', kind: 'num' },
  { from: 62, to: 69, name: 'PolicyNumber', source: 'PolicyNumber_Ext (yyyyMMdd)', kind: 'date' },
  { from: 70, to: 75, name: 'Brand', source: 'BrandMappingService.brandMap', kind: 'text' },
];

const LAYOUT_PR16 = [
  { from: 1, to: 4, name: 'Record type', source: 'PR16', kind: 'type' },
  ...COMMON_LAYOUT,
  { from: 76, to: 250, name: 'Filler', source: 'spaces', kind: 'filler' },
];

const LAYOUT_PR17 = [
  { from: 1, to: 4, name: 'Record type', source: 'PR17', kind: 'type' },
  ...COMMON_LAYOUT,
  { from: 76, to: 90, name: 'PriorPremium', source: 'PriorPremium_Ext (padNum)', kind: 'disclosure' },
  { from: 91, to: 105, name: 'RenewalPremium', source: 'RenewalPremium_Ext (padNum)', kind: 'disclosure' },
  { from: 106, to: 120, name: 'EquivalentNBPremium', source: 'EquivalentNBPremium_Ext (padNum)', kind: 'disclosure' },
  { from: 121, to: 122, name: 'NCDYears', source: 'NCDYears_Ext (00-99)', kind: 'disclosure' },
  { from: 123, to: 123, name: 'ShoppingAroundFlag', source: 'PolicyYear_Ext >= 4', kind: 'disclosure' },
  { from: 124, to: 124, name: 'OptOutFlag', source: 'RenewalOptOut_Ext set', kind: 'disclosure' },
  { from: 125, to: 300, name: 'Filler', source: 'spaces', kind: 'filler' },
];

module.exports = {
  RECORD_LENGTH, RECORD_LENGTH_PR17, LAYOUT_PR16, LAYOUT_PR17,
  buildRecord, buildRecordPR17, pad, padNum, formatDate, ncdYears, shoppingAroundFlag,
};

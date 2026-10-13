'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { FixtureBean } = require('../lib/bean');
const printv = require('../lib/printv');
const { createStore } = require('../lib/store');

const bean = (fields) => new FixtureBean(fields, 'TEST');
const slice = (rec, from, to) => rec.slice(from - 1, to);

test('padNum: implied 2dp, zero-padded, half-up', () => {
  assert.equal(printv.padNum('389.00', 15), '000000000038900');
  assert.equal(printv.padNum('412.305', 15), '000000000041231');
  assert.equal(printv.padNum(null, 5), '00000');
});

test('padNum: negative values carry a trailing overpunch (J..R for 0..8)', () => {
  assert.equal(printv.padNum('-12.34', 15), '00000000000123N');
  assert.equal(printv.padNum('-0.10', 5), '0001J');
  assert.equal(printv.padNum('-1.08', 5), '0010R');
});

test('padNum: production quirk - negative ending in 9 throws (overpunch table has 9 entries)', () => {
  assert.throws(() => printv.padNum('-0.09', 5), { name: 'StringIndexOutOfBoundsException' });
});

test('pad: silent truncation of overlong text, space fill otherwise', () => {
  assert.equal(printv.pad('ABCDEFGHIJKLMNOP', 12), 'ABCDEFGHIJKL');
  assert.equal(printv.pad('AB', 4), 'AB  ');
  assert.equal(printv.pad(null, 3), '   ');
});

test('PR16: 250 bytes and fixed layout', () => {
  const rec = printv.buildRecord(bean({ InsuredSurname_Ext: 'TESTPERSON-LONGNAME', BrandCode_Ext: 'ALBBRK', RiskPostcode_Ext: '-1.23' }));
  assert.equal(rec.length, 250);
  assert.equal(slice(rec, 1, 4), 'PR16');
  assert.equal(slice(rec, 5, 16), 'TESTPERSON-L');
  assert.equal(slice(rec, 17, 46), ' '.repeat(30));
  assert.equal(slice(rec, 47, 61), '00000000000012M');
  assert.equal(slice(rec, 62, 69), '00000000');
  assert.equal(slice(rec, 70, 75), '02BK00');
  assert.equal(slice(rec, 76, 250), ' '.repeat(175));
});

test('brand mapping: null / unknown brand -> 999999 sentinel', () => {
  assert.equal(slice(printv.buildRecord(bean({})), 70, 75), '999999');
  assert.equal(slice(printv.buildRecord(bean({ BrandCode_Ext: 'NOPE' })), 70, 75), '999999');
});

test('PR17: a disclosure amount wider than its 15-byte slot is rejected, not shifted', () => {
  const { FixtureBean } = require('../lib/bean');
  const s = createStore();
  const b = s.bean(s.find('SYN-REN-0004'));
  for (const f of ['PriorPremium_Ext', 'RenewalPremium_Ext', 'EquivalentNBPremium_Ext']) {
    const wide = new FixtureBean({ ...b.fields, [f]: '10000000000000.00' }, b.label);
    assert.throws(() => printv.buildRecordPR17(wide), { name: 'IllegalStateException' });
  }
  const max = new FixtureBean({ ...b.fields, PriorPremium_Ext: '9999999999999.99' }, b.label);
  assert.equal(slice(printv.buildRecordPR17(max), 76, 90), '999999999999999');
});

test('PR17: 300 bytes, 005-075 byte-identical to PR16, disclosure block offsets', () => {
  const s = createStore();
  const b = s.bean(s.find('SYN-REN-0004'));
  const pr16 = printv.buildRecord(b);
  const pr17 = printv.buildRecordPR17(b);
  assert.equal(pr17.length, 300);
  assert.equal(slice(pr17, 1, 4), 'PR17');
  assert.equal(slice(pr17, 5, 75), slice(pr16, 5, 75));
  assert.equal(slice(pr17, 76, 90), '000000000038900');
  assert.equal(slice(pr17, 91, 105), '000000000040150');
  assert.equal(slice(pr17, 106, 120), '000000000040500');
  assert.equal(slice(pr17, 121, 122), '04');
  assert.equal(slice(pr17, 123, 123), 'Y');
  assert.equal(slice(pr17, 124, 124), 'N');
  assert.equal(slice(pr17, 125, 300), ' '.repeat(176));
});

test('PR17: NCD clamp, shopping-around and opt-out flags', () => {
  const rec = (f) => printv.buildRecordPR17(bean(f));
  assert.equal(slice(rec({}), 121, 124), '00NN');
  assert.equal(slice(rec({ NCDYears_Ext: 150, PolicyYear_Ext: 3, RenewalOptOut_Ext: ' true ' }), 121, 124), '99NY');
  assert.equal(slice(rec({ NCDYears_Ext: -2, PolicyYear_Ext: 4, RenewalOptOut_Ext: 'N' }), 121, 124), '00YN');
  assert.equal(slice(rec({ NCDYears_Ext: 7.9, PolicyYear_Ext: 9, RenewalOptOut_Ext: true }), 121, 124), '07YY');
  assert.equal(slice(rec({ PriorPremium_Ext: '-5.55' }), 76, 90), '00000000000055O');
});

test('layout metadata covers every byte exactly once', () => {
  for (const [layout, len] of [[printv.LAYOUT_PR16, 250], [printv.LAYOUT_PR17, 300]]) {
    let next = 1;
    for (const s of layout) { assert.equal(s.from, next); next = s.to + 1; }
    assert.equal(next - 1, len);
  }
});

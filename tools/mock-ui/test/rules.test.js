'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { FixtureBean } = require('../lib/bean');
const eligibility = require('../lib/eligibility');
const ps215 = require('../lib/ps215');
const { createStore } = require('../lib/store');

const bean = (fields, label = 'TEST-BEAN') => new FixtureBean(fields, label);

test('eligibility: catalogue order, source fields and activity patterns match the contract', () => {
  assert.deepEqual(eligibility.CODES.map((c) => [c.code, c.field, c.pattern]), [
    ['OPT_OUT', 'RenewalOptOut_Ext', 'renewal_suppression'],
    ['MARKETING_SUPPRESSED', 'MarketingSuppressed_Ext', 'renewal_suppression'],
    ['SANCTIONS_HOLD', 'SanctionsHold_Ext', 'renewal_sanctions_hold'],
    ['VULNERABILITY_REVIEW', 'VulnerabilityNoted_Ext', 'renewal_vulnerability_review'],
    ['BEREAVEMENT_HOLD', 'BereavementHold_Ext', 'renewal_bereavement_hold'],
    ['GDPR_ERASURE_PENDING', 'GDPRErasurePending_Ext', 'renewal_suppression'],
  ]);
});

test('eligibility: SET truthiness (Boolean true, or trimmed case-insensitive Y/TRUE/1)', () => {
  for (const v of [true, 'Y', 'y', ' TRUE ', 'true', '1', ' 1']) assert.equal(eligibility.isSet(v), true, String(v));
  for (const v of [null, undefined, false, 'N', 'yes', '0', '', 1, 'T', 'Y1']) assert.equal(eligibility.isSet(v), false, String(v));
});

test('eligibility: null bean -> no codes, not eligible', () => {
  assert.deepEqual(eligibility.evaluate(null), []);
  assert.equal(eligibility.isEligible(null), false);
});

test('eligibility: all fields set -> every code in fixed contract order', () => {
  const b = bean({
    GDPRErasurePending_Ext: '1', BereavementHold_Ext: 'y', VulnerabilityNoted_Ext: true,
    SanctionsHold_Ext: 'TRUE', MarketingSuppressed_Ext: true, RenewalOptOut_Ext: 'Y',
  });
  assert.deepEqual(eligibility.evaluate(b), [
    'OPT_OUT', 'MARKETING_SUPPRESSED', 'SANCTIONS_HOLD', 'VULNERABILITY_REVIEW', 'BEREAVEMENT_HOLD', 'GDPR_ERASURE_PENDING',
  ]);
  assert.equal(eligibility.isEligible(b), false);
  assert.equal(eligibility.isEligible(bean({})), true);
});

test('ps215: strictly greater breaches and logs the exact compliance line', () => {
  const lines = [];
  const codes = ps215.evaluate(bean({ AnnualPremium_Ext: '610.00', EquivalentNBPremium_Ext: '575.00' }, 'SYN-REN-0002'), (l) => lines.push(l));
  assert.deepEqual(codes, ['PRICE_WALK_BREACH']);
  assert.deepEqual(lines, ['COMPLIANCE-BREACH|PS215|SYN-REN-0002|610.00|575.00']);
});

test('ps215: equal price passes (boundary) and does not log', () => {
  const lines = [];
  const b = bean({ AnnualPremium_Ext: '300.00', EquivalentNBPremium_Ext: '300.00' });
  assert.deepEqual(ps215.evaluate(b, (l) => lines.push(l)), []);
  assert.equal(ps215.passes(b), true);
  assert.deepEqual(lines, []);
});

test('ps215: null NB price is a data gap -> never breaches; null bean -> empty, passes false', () => {
  assert.deepEqual(ps215.evaluate(bean({ AnnualPremium_Ext: '99999.99' })), []);
  assert.deepEqual(ps215.evaluate(null), []);
  assert.equal(ps215.passes(null), false);
});

test('ps215: gate input is AnnualPremium_Ext (not RenewalPremium_Ext); null amount treated as 0', () => {
  assert.equal(ps215.AMOUNT_FIELD, 'AnnualPremium_Ext');
  assert.deepEqual(ps215.evaluate(bean({ RenewalPremium_Ext: '999.00', EquivalentNBPremium_Ext: '100.00' })), []);
  assert.deepEqual(ps215.evaluate(bean({ AnnualPremium_Ext: '100.01', EquivalentNBPremium_Ext: '100.00' })), ['PRICE_WALK_BREACH']);
  assert.deepEqual(ps215.evaluate(bean({ EquivalentNBPremium_Ext: '-0.01' })), ['PRICE_WALK_BREACH']);
});

test('ps215: compareTo semantics ignore scale (438.1 == 438.10)', () => {
  assert.deepEqual(ps215.evaluate(bean({ AnnualPremium_Ext: '438.1', EquivalentNBPremium_Ext: '438.10' })), []);
});

test('seed policies produce the contract outcomes', () => {
  const s = createStore();
  const out = (ref) => {
    const b = s.bean(s.find(ref));
    return [eligibility.evaluate(b), ps215.evaluate(b)];
  };
  assert.deepEqual(out('SYN-REN-0001'), [[], []]);
  assert.deepEqual(out('SYN-REN-0002'), [[], ['PRICE_WALK_BREACH']]);
  assert.deepEqual(out('SYN-REN-0003')[0], ['VULNERABILITY_REVIEW']);
  assert.deepEqual(out('SYN-REN-0004'), [[], []]);
  assert.deepEqual(out('SYN-REN-0005'), [[], []]);
  const p4 = s.find('SYN-REN-0004').fields;
  assert.equal(p4.FeedStatus_Ext, 'PENDING');
  assert.equal(p4.PolicyYear_Ext, 4);
  assert.equal(s.find('HR12345678A').heritage, true);
});

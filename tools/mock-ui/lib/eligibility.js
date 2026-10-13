'use strict';

// Mirrors albion.policy.renewal.AlbionRenewalEligibilityRules (renewal eligibility screen) and the pattern
// mapping used by albion.policy.renewal.AlbionRenewalEligibilityActivities.

const CODES = [
  {
    code: 'OPT_OUT', field: 'RenewalOptOut_Ext', pattern: 'renewal_suppression',
    meaning: 'Customer opted out of automatic renewal',
  },
  {
    code: 'MARKETING_SUPPRESSED', field: 'MarketingSuppressed_Ext', pattern: 'renewal_suppression',
    meaning: 'Renewal marketing suppressed for the customer',
  },
  {
    code: 'SANCTIONS_HOLD', field: 'SanctionsHold_Ext', pattern: 'renewal_sanctions_hold',
    meaning: 'Sanctions screening hold on the party',
  },
  {
    code: 'VULNERABILITY_REVIEW', field: 'VulnerabilityNoted_Ext', pattern: 'renewal_vulnerability_review',
    meaning: 'Customer identified as vulnerable (FCA FG21/1); renewal reviewed by a handler',
  },
  {
    code: 'BEREAVEMENT_HOLD', field: 'BereavementHold_Ext', pattern: 'renewal_bereavement_hold',
    meaning: 'Bereavement notified; renewal held',
  },
  {
    code: 'GDPR_ERASURE_PENDING', field: 'GDPRErasurePending_Ext', pattern: 'renewal_suppression',
    meaning: 'GDPR erasure request pending',
  },
];

/** SET = Boolean.TRUE, or a String equal (trimmed, case-insensitive) to Y, TRUE or 1. Anything else is not set. */
function isSet(value) {
  if (value === true) return true;
  if (typeof value === 'string') {
    const v = value.trim().toUpperCase();
    return v === 'Y' || v === 'TRUE' || v === '1';
  }
  return false;
}

/** Block codes in contract order; empty list when eligible or when the bean is null. */
function evaluate(bean) {
  if (bean === null || bean === undefined) return [];
  return CODES.filter((c) => isSet(bean.getFieldValue(c.field))).map((c) => c.code);
}

function isEligible(bean) {
  return bean !== null && bean !== undefined && evaluate(bean).length === 0;
}

function patternFor(code) {
  const c = CODES.find((x) => x.code === code);
  return c ? c.pattern : null;
}

module.exports = { CODES, isSet, evaluate, isEligible, patternFor };

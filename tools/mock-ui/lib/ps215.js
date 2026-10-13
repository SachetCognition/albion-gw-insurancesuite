'use strict';

// Mirrors albion.policy.compliance.AlbionPS215Gate and the AlbionPolicyPredicates helpers it calls.

const decimal = require('./decimal');

const BREACH_CODE = 'PRICE_WALK_BREACH';
const RULE = 'PS215';
/** The gate input is AnnualPremium_Ext, the annualised premium of the renewal period (not TotalIncurred_Ext claim costs). */
const AMOUNT_FIELD = 'AnnualPremium_Ext';
const NB_FIELD = 'EquivalentNBPremium_Ext';

/** AlbionPolicyPredicates.equivalentNewBusinessPrice: EquivalentNBPremium_Ext, null when absent. */
function equivalentNewBusinessPrice(bean) {
  const v = bean.getFieldValue(NB_FIELD);
  return v === null || v === undefined ? null : decimal.parse(v);
}

/** AlbionPolicyPredicates.complianceBreachLine: "COMPLIANCE-BREACH|" + rule + "|" + bean + "|" + actual + "|" + allowed */
function complianceBreachLine(rule, bean, actual, allowed) {
  return 'COMPLIANCE-BREACH|' + rule + '|' + String(bean) + '|' + decimal.toText(actual) + '|' + decimal.toText(allowed);
}

/**
 * evaluate(bean): [] for a null bean; ["PRICE_WALK_BREACH"] when AnnualPremium_Ext (null -> 0) is strictly greater
 * than the equivalent NB price; [] when the NB price is absent (data gap) or the amount is equal or lower.
 * `log` receives the compliance line (print() in production).
 */
function evaluate(bean, log) {
  if (bean === null || bean === undefined) return [];
  const raw = bean.getFieldValue(AMOUNT_FIELD);
  const amount = raw === null || raw === undefined ? decimal.parse('0') : decimal.parse(raw);
  const nb = equivalentNewBusinessPrice(bean);
  if (nb !== null && decimal.compare(amount, nb) > 0) {
    const line = complianceBreachLine(RULE, bean, amount, nb);
    if (typeof log === 'function') log(line);
    return [BREACH_CODE];
  }
  return [];
}

function passes(bean, log) {
  return bean !== null && bean !== undefined && evaluate(bean, log).length === 0;
}

module.exports = {
  BREACH_CODE, RULE, AMOUNT_FIELD, NB_FIELD,
  evaluate, passes, equivalentNewBusinessPrice, complianceBreachLine,
};

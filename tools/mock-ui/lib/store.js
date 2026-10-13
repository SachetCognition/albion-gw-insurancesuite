'use strict';

const { seedPolicies } = require('./seed');
const { FixtureBean } = require('./bean');

function createStore() {
  const state = { policies: new Map(), complianceLog: [], activities: [], optOuts: [] };

  function reset() {
    state.policies.clear();
    for (const p of seedPolicies()) state.policies.set(p.ref, p);
    state.complianceLog.length = 0;
    state.activities.length = 0;
    state.optOuts.length = 0;
  }

  function find(ref) {
    if (ref === null || ref === undefined) return null;
    const key = String(ref).trim().toUpperCase();
    for (const p of state.policies.values()) {
      if (p.ref.toUpperCase() === key) return p;
    }
    return null;
  }

  function bean(p) {
    return new FixtureBean(p.fields, p.ref);
  }

  reset();
  return { state, reset, find, bean, list: () => [...state.policies.values()] };
}

module.exports = { createStore };

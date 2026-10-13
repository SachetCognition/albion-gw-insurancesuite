'use strict';

const path = require('path');
const express = require('express');

const { createStore } = require('./lib/store');
const eligibility = require('./lib/eligibility');
const ps215 = require('./lib/ps215');
const printv = require('./lib/printv');
const invite = require('./lib/renewalInvite');
const brand = require('./lib/brand');
const { JOURNEY_REF, BREACH_REF, HERITAGE_REF } = require('./lib/seed');

const SCREEN_ROUTES = [
  '/', '/invite/:ref', '/optout/:ref', '/ps215/:ref', '/admin/eligibility', '/records/:ref', '/journey',
];

function cicsDelayMs() {
  const v = Number.parseInt(process.env.CICS_DELAY_MS, 10);
  return Number.isFinite(v) && v >= 0 ? v : 2500;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createApp(options = {}) {
  const store = options.store || createStore();
  const delay = typeof options.cicsDelayMs === 'number' ? () => options.cicsDelayMs : cicsDelayMs;
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  function view(p) {
    if (p.heritage) {
      return {
        ref: p.ref, heritage: true, route: 'CICS', product: p.product, fields: p.fields,
        brandPolaris: brand.toPolarisCode(p.fields.BrandCode_Ext),
      };
    }
    const b = store.bean(p);
    const year = p.fields.PolicyYear_Ext;
    return {
      ref: p.ref,
      heritage: false,
      route: 'GW',
      product: p.product,
      renewalDate: p.renewalDate,
      fields: p.fields,
      brandName: brand.typecodeName(p.fields.BrandCode_Ext),
      brandPolaris: brand.brandMap(b),
      shoppingAround: typeof year === 'number' && year >= 4,
      vulnerable: eligibility.isSet(p.fields.VulnerabilityNoted_Ext),
      suppressed: eligibility.isSet(p.fields.RenewalOptOut_Ext),
      eligibilityCodes: eligibility.evaluate(b),
      ps215Preview: ps215.evaluate(b, null),
    };
  }

  function gateResult(p, log, once = false) {
    const b = store.bean(p);
    const lines = [];
    const codes = ps215.evaluate(b, (line) => lines.push(line));
    if (log) {
      for (const line of lines) {
        if (once && store.state.complianceLog.some((e) => e.line === line)) continue;
        store.state.complianceLog.push({ at: new Date().toISOString(), line });
      }
    }
    return {
      ref: p.ref,
      codes,
      passes: codes.length === 0,
      actual: p.fields.TotalIncurred_Ext,
      actualField: ps215.AMOUNT_FIELD,
      allowed: p.fields.EquivalentNBPremium_Ext,
      allowedField: ps215.NB_FIELD,
      line: lines[0] || null,
    };
  }

  // once = true keeps journey steps idempotent when a deep link is reloaded.
  function decide(p, once = false) {
    const b = store.bean(p);
    const codes = eligibility.evaluate(b);
    const raised = codes.map((code) => ({ ref: p.ref, code, pattern: eligibility.patternFor(code) }));
    for (const a of raised) {
      if (once && store.state.activities.some((x) => x.ref === a.ref && x.code === a.code)) continue;
      store.state.activities.push({ at: new Date().toISOString(), ...a });
    }
    const gate = codes.length === 0 ? gateResult(p, true, once) : null;
    const blockedBy = codes.length > 0 ? codes : gate.codes;
    return {
      ref: p.ref,
      eligibility: { eligible: codes.length === 0, codes },
      ps215: gate ? { evaluated: true, ...gate } : { evaluated: false, reason: 'Not reached: renewal blocked by the eligibility screen' },
      autoRenew: blockedBy.length === 0 ? 'ALLOWED' : 'BLOCKED',
      blockedBy,
      activities: raised,
    };
  }

  function records(p) {
    const b = store.bean(p);
    const out = { ref: p.ref, layoutPR16: printv.LAYOUT_PR16, layoutPR17: printv.LAYOUT_PR17 };
    for (const [key, fn] of [['pr16', printv.buildRecord], ['pr17', printv.buildRecordPR17]]) {
      try {
        out[key] = fn(b);
      } catch (e) {
        out[key] = null;
        out[`${key}Error`] = `${e.name}: ${e.message}`;
      }
    }
    return out;
  }

  function withPolicy(handler, { allowHeritage = false } = {}) {
    return (req, res) => {
      const p = store.find(req.params.ref);
      if (!p) return res.status(404).json({ error: `Unknown policy ${req.params.ref}` });
      if (p.heritage && !allowHeritage) {
        return res.status(409).json({
          error: `${p.ref} is a heritage reference mastered on POLARIS; it is served by the CICS passthrough`,
          route: 'CICS',
        });
      }
      return handler(p, req, res);
    };
  }

  // ---------------------------------------------------------------- RenewalInviteServiceV1..V4 stubs (text/xml)
  app.get('/ws/v:version(\\d+)/RenewalInviteService', async (req, res) => {
    const version = Number(req.params.version);
    const centre = String(req.query.centre || 'pc').toLowerCase();
    if (!invite.supports(centre, version)) {
      return res.status(404).type('text/plain').send(`RenewalInviteServiceV${version} is not deployed in centre ${centre}`);
    }
    const one = (v) => (Array.isArray(v) ? v[0] : v);
    const policyNumber = req.query.policyNumber === undefined ? null : String(one(req.query.policyNumber));
    const brandCode = req.query.brandCode === undefined ? null : String(one(req.query.brandCode));
    const result = invite.getInviteStatus(version, policyNumber, brandCode, centre);
    res.set('X-Albion-Route', result.route);
    res.set('X-Albion-Centre', invite.CENTRES[centre].name);
    if (result.route === 'CICS') {
      const ms = delay();
      res.set('X-Albion-CICS-Transaction', result.transaction);
      res.set('X-Albion-CICS-Delay-Ms', String(ms));
      await sleep(ms);
    }
    res.type('text/xml').send(result.xml);
  });

  // ---------------------------------------------------------------------------------------------- JSON API
  app.get('/api/policies', (req, res) => res.json(store.list().map(view)));
  app.get('/api/policies/:ref', withPolicy((p, req, res) => res.json(view(p)), { allowHeritage: true }));

  app.post('/api/policies/:ref/optout', withPolicy((p, req, res) => {
    const body = req.body || {};
    p.fields.RenewalOptOut_Ext = 'Y';
    const event = {
      at: new Date().toISOString(), ref: p.ref,
      reason: body.reason ? String(body.reason).slice(0, 80) : null,
      channel: body.channel ? String(body.channel).slice(0, 40) : null,
    };
    store.state.optOuts.push(event);
    res.json({ policy: view(p), optOut: event, field: 'RenewalOptOut_Ext', value: 'Y' });
  }));

  app.post('/api/policies/:ref/decision', withPolicy((p, req, res) => res.json(decide(p))));
  app.post('/api/policies/:ref/ps215', withPolicy((p, req, res) => res.json(gateResult(p, true))));
  app.get('/api/policies/:ref/records', withPolicy((p, req, res) => res.json(records(p))));

  app.get('/api/compliance-log', (req, res) => res.json(store.state.complianceLog));
  app.get('/api/activities', (req, res) => res.json(store.state.activities));
  app.get('/api/eligibility/codes', (req, res) => res.json({
    codes: eligibility.CODES,
    truthiness: 'SET = Boolean.TRUE, or a String equal (trimmed, case-insensitive) to Y, TRUE or 1',
    gate: {
      rule: ps215.RULE, breachCode: ps215.BREACH_CODE, actualField: ps215.AMOUNT_FIELD, allowedField: ps215.NB_FIELD,
      comparison: 'breach when actual > allowed (equal passes); no comparison when allowed is null',
    },
  }));

  app.post('/api/journey/:step(\\d+)', (req, res) => {
    const step = Number(req.params.step);
    if (step < 1 || step > 7) return res.status(400).json({ error: 'step must be 1..7' });
    const p = store.find(JOURNEY_REF);
    p.fields.RenewalOptOut_Ext = step >= 5 ? 'Y' : null;
    const out = { step, ref: p.ref, policy: view(p) };
    if (step === 2) out.eligibility = { codes: eligibility.evaluate(store.bean(p)) };
    if (step === 3) out.gates = [gateResult(p, true, true), gateResult(store.find(BREACH_REF), true, true)];
    if (step === 4) out.records = records(p);
    if (step >= 6) out.decision = decide(p, true);
    if (step === 7) {
      out.records = records(p);
      out.breach = gateResult(store.find(BREACH_REF), false);
      out.complianceLog = store.state.complianceLog;
    }
    res.json(out);
  });

  app.post('/api/reset', (req, res) => {
    store.reset();
    res.json({ ok: true, policies: store.list().length });
  });

  // -------------------------------------------------------------------------------------------- screens
  const publicDir = path.join(__dirname, 'public');
  app.use('/assets', express.static(publicDir, { index: false, maxAge: 0 }));
  app.get(SCREEN_ROUTES, (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

  app.locals.store = store;
  app.locals.refs = { JOURNEY_REF, BREACH_REF, HERITAGE_REF };
  return app;
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT, 10) || 4317;
  createApp().listen(port, () => {
    console.log(`Albion renewal mock UI (offline demo, synthetic data) on http://localhost:${port}`);
  });
}

module.exports = { createApp };

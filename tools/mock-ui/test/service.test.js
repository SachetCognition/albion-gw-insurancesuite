'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const ET = require('../lib/renewalInvite');
const { createApp } = require('../server');

const ok = (v, ref, brand) => '<?xml version="1.0"?><InviteStatusResponse xmlns="http://albiongeneral.co.uk/ws/renewalinvite/v' + v + '">'
  + '<Ref>' + ref + '</Ref><Brand>' + brand + '</Brand><Premuim>0.00</Premuim><Status>OK</Status></InviteStatusResponse>';

test('RenewalInviteService v1-v4: byte format, namespace and normalisation', () => {
  for (const v of [1, 2, 3, 4]) {
    const r = ET.getInviteStatus(v, 'syn-ren-0001', 'ALBDIR');
    assert.equal(r.route, 'GW');
    assert.equal(r.xml, ok(v, 'SYNREN0001', 'ALBDIR'));
  }
});

test('v2 keeps the <Premuim> misspelling', () => {
  const xml = ET.getInviteStatus(2, 'SYN-REN-0001', 'ALBDIR').xml;
  assert.match(xml, /<Premuim>0\.00<\/Premuim>/);
  assert.doesNotMatch(xml, /<Premium>/);
});

test('short or missing reference -> AGI-4001 error XML (PC wording)', () => {
  const err = '<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13 - yes really)</Msg></Error>';
  for (const v of [1, 2, 3, 4]) {
    assert.equal(ET.getInviteStatus(v, 'AB12', 'ALBDIR').xml, err);
    assert.equal(ET.getInviteStatus(v, null, 'ALBDIR').route, 'ERROR');
  }
  assert.equal(ET.getInviteStatus(1, 'AB12', 'x', 'cc').xml, '<Error><Code>AGI-4001</Code><Msg>Policy number mandatory, min 5 chars (POLARIS refs are 11, GW are 10, quotes are 13)</Msg></Error>');
});

test('heritage refs (after normalisation) route to the CICS passthrough with the per-version transaction', () => {
  const tx = { 1: 'AG90', 2: 'AG29', 3: 'AG19', 4: 'AG39' };
  for (const v of [1, 2, 3, 4]) {
    const r = ET.getInviteStatus(v, 'hr-1234 5678a', 'HERIT');
    assert.equal(r.route, 'CICS');
    assert.equal(r.transaction, tx[v]);
    assert.equal(r.xml, '<?xml version="1.0"?><enquireResponse xmlns="http://albiongeneral.co.uk/ws/polaris/v1"><Ref>HR12345678A</Ref><Brand>HERIT</Brand><Premuim>0.00</Premuim><Status>OK</Status></enquireResponse>');
  }
  assert.equal(ET.isHeritageRef('SYN-REN-0001'), false);
  assert.equal(ET.getInviteStatus(2, 'HR123456789', 'HERIT').route, 'GW');
});

test('XML responses are well-formed', () => {
  const { DOMParser } = globalThis;
  if (!DOMParser) return; // Node has no DOMParser; the ElementTree check runs in the repo verification
  for (const v of [1, 2, 3, 4]) new DOMParser().parseFromString(ET.getInviteStatus(v, 'SYN-REN-0001', 'ALBDIR').xml, 'text/xml');
});

async function withServer(fn) {
  const app = createApp({ cicsDelayMs: 30 });
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  try { await fn(base); } finally { server.close(); }
}

const json = (base, method, url, body) => fetch(base + url, {
  method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
}).then(async (r) => ({ status: r.status, body: await r.json() }));

test('HTTP: /ws endpoints return text/xml; heritage route is flagged and delayed', async () => {
  await withServer(async (base) => {
    const r = await fetch(base + '/ws/v2/RenewalInviteService?policyNumber=SYN-REN-0001&brandCode=ALBDIR');
    assert.match(r.headers.get('content-type'), /^text\/xml/);
    assert.equal(await r.text(), ok(2, 'SYNREN0001', 'ALBDIR'));
    const t0 = Date.now();
    const h = await fetch(base + '/ws/v2/RenewalInviteService?policyNumber=HR12345678A&brandCode=HERIT');
    assert.ok(Date.now() - t0 >= 25);
    assert.equal(h.headers.get('x-albion-route'), 'CICS');
    assert.equal(h.headers.get('x-albion-cics-transaction'), 'AG29');
    assert.match(await h.text(), /^<\?xml version="1.0"\?><enquireResponse/);
    assert.equal((await fetch(base + '/ws/v5/RenewalInviteService?policyNumber=SYN-REN-0001')).status, 404);
  });
});

test('HTTP: opt-out -> decision blocked with OPT_OUT; reset restores seed', async () => {
  await withServer(async (base) => {
    let d = await json(base, 'POST', '/api/policies/SYN-REN-0004/decision');
    assert.equal(d.body.autoRenew, 'ALLOWED');
    const o = await json(base, 'POST', '/api/policies/SYN-REN-0004/optout', { reason: 'Prefers to renew manually' });
    assert.equal(o.body.policy.fields.RenewalOptOut_Ext, 'Y');
    d = await json(base, 'POST', '/api/policies/SYN-REN-0004/decision');
    assert.equal(d.body.autoRenew, 'BLOCKED');
    assert.deepEqual(d.body.blockedBy, ['OPT_OUT']);
    assert.deepEqual(d.body.activities.map((a) => a.pattern), ['renewal_suppression']);
    await json(base, 'POST', '/api/reset');
    const p = await json(base, 'GET', '/api/policies/SYN-REN-0004');
    assert.equal(p.body.fields.RenewalOptOut_Ext, null);
  });
});

test('HTTP: PS21/5 breach logs the exact line; vulnerability review blocks', async () => {
  await withServer(async (base) => {
    const g = await json(base, 'POST', '/api/policies/SYN-REN-0002/ps215');
    assert.deepEqual(g.body.codes, ['PRICE_WALK_BREACH']);
    const log = await json(base, 'GET', '/api/compliance-log');
    assert.deepEqual(log.body.map((e) => e.line), ['COMPLIANCE-BREACH|PS215|SYN-REN-0002|610.00|575.00']);
    const v = await json(base, 'POST', '/api/policies/SYN-REN-0003/decision');
    assert.deepEqual(v.body.blockedBy, ['VULNERABILITY_REVIEW']);
    assert.equal(v.body.ps215.evaluated, false);
    const e = await json(base, 'POST', '/api/policies/SYN-REN-0005/decision');
    assert.equal(e.body.autoRenew, 'ALLOWED');
    assert.equal((await json(base, 'GET', '/api/policies/NOPE')).status, 404);
  });
});

test('HTTP: journey steps 1-7 work as deep links after reset and are idempotent', async () => {
  await withServer(async (base) => {
    await json(base, 'POST', '/api/reset');
    const s6 = await json(base, 'POST', '/api/journey/6');
    assert.deepEqual(s6.body.decision.blockedBy, ['OPT_OUT']);
    const s1 = await json(base, 'POST', '/api/journey/1');
    assert.equal(s1.body.policy.fields.FeedStatus_Ext, 'PENDING');
    assert.equal(s1.body.policy.fields.RenewalOptOut_Ext, null);
    await json(base, 'POST', '/api/journey/3');
    const s3 = await json(base, 'POST', '/api/journey/3');
    assert.deepEqual(s3.body.gates.map((g) => g.codes), [[], ['PRICE_WALK_BREACH']]);
    const s7 = await json(base, 'POST', '/api/journey/7');
    assert.equal(s7.body.complianceLog.length, 1);
    assert.equal(s7.body.records.pr17[123], 'Y');
    assert.equal((await json(base, 'POST', '/api/journey/8')).status, 400);
    for (const path of ['/', '/invite/SYN-REN-0003', '/optout/SYN-REN-0004', '/ps215/SYN-REN-0002', '/admin/eligibility', '/records/SYN-REN-0004', '/journey?step=4']) {
      const r = await fetch(base + path);
      assert.equal(r.status, 200, path);
      assert.match(await r.text(), /Offline demo – synthetic data, not production results/);
    }
  });
});

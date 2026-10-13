// Drives the renewal mock UI (tools/mock-ui) through the Phase 1 journey and records one 1280x720 WebM per clip,
// with a caption overlay per step. Uses only the mock UI's public routes and data-testids.
//   node record_ui.mjs <out dir>
// Env: PORT (default 4317) or MOCK_UI_URL; PW_CHANNEL to use an installed browser channel instead of the bundled one;
// STEP_PAUSE_MS (default 2600) pause per caption.
// Writes <out dir>/<clip>.webm, <clip>.webm.trim (lead-in seconds to cut) and ui-clips.txt (clip order).
import { chromium, request } from 'playwright';
import { writeFileSync, renameSync, mkdirSync, mkdtempSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const BASE = (process.env.MOCK_UI_URL || `http://localhost:${process.env.PORT || 4317}`).replace(/\/$/, '');
const OUT = path.resolve(process.argv[2] || '.');
const PAUSE = Number(process.env.STEP_PAUSE_MS || '2600');
const SIZE = { width: 1280, height: 720 };
const HERITAGE_TIMEOUT_MS = 60000;

function fail(msg) {
  console.error(`record_ui: ${msg}`);
  process.exit(1);
}

const OVERLAY = ({ step, title, detail }) => {
  const id = '__phase1_caption';
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement('div');
    box.id = id;
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;pointer-events:none;'
      + 'background:rgba(11,21,38,.92);color:#fff;border-top:3px solid #f5b301;padding:12px 28px 14px;'
      + "font-family:'DejaVu Sans',sans-serif;box-shadow:0 -4px 16px rgba(0,0,0,.25)";
    (document.body || document.documentElement).appendChild(box);
  }
  box.innerHTML = '';
  const head = document.createElement('div');
  head.style.cssText = 'font-size:20px;font-weight:700';
  head.textContent = (step ? step + ' · ' : '') + title;
  const sub = document.createElement('div');
  sub.style.cssText = 'font-size:15px;color:#c9d6ea;margin-top:4px';
  sub.textContent = detail || '';
  const badge = document.createElement('div');
  badge.style.cssText = 'position:absolute;right:24px;top:-30px;font-size:12px;color:#5b4300;background:#f5d27a;'
    + 'border-radius:4px 4px 0 0;padding:5px 10px';
  badge.textContent = 'Synthetic data · offline mock UI · not production results';
  box.append(head, sub, badge);
};

class Clip {
  constructor(browser, name) { this.browser = browser; this.name = name; this.caption = null; }

  async open() {
    this.videoDir = mkdtempSync(path.join(tmpdir(), 'phase1-ui-'));
    this.context = await this.browser.newContext({ viewport: SIZE, recordVideo: { dir: this.videoDir, size: SIZE } });
    this.t0 = Date.now();
    this.page = await this.context.newPage();
    this.page.on('load', () => { if (this.caption) this.page.evaluate(OVERLAY, this.caption).catch(() => {}); });
    this.trimmed = false;
  }

  async go(route, timeout = 15000) {
    const res = await this.page.goto(BASE + route, { waitUntil: 'load', timeout });
    if (!res || !res.ok()) fail(`${route} returned HTTP ${res ? res.status() : 'no response'}`);
    if (!this.trimmed) {
      this.trimmed = true;
      writeFileSync(path.join(OUT, `${this.name}.webm.trim`), ((Date.now() - this.t0) / 1000).toFixed(2));
    }
    if (this.caption) await this.page.evaluate(OVERLAY, this.caption);
  }

  async say(step, title, detail = '', pause = PAUSE) {
    this.caption = { step, title, detail };
    await this.page.evaluate(OVERLAY, this.caption);
    await this.page.waitForTimeout(pause);
  }

  el(testid) { return this.page.getByTestId(testid).first(); }

  async need(testid, timeout = 10000) {
    const loc = this.el(testid);
    try {
      await loc.waitFor({ state: 'visible', timeout });
    } catch {
      fail(`data-testid="${testid}" not visible on ${this.page.url()}`);
    }
    return loc;
  }

  async raw(testid) { return (await (await this.need(testid)).innerText()) || ''; }

  async text(testid) { return (await this.raw(testid)).trim(); }

  async mark(testid) {
    const loc = await this.need(testid);
    await loc.scrollIntoViewIfNeeded();
    await loc.evaluate((n) => { n.style.outline = '3px solid #f5b301'; n.style.outlineOffset = '3px'; });
    return loc;
  }

  async close() {
    const video = this.page.video();
    await this.context.close();
    renameSync(await video.path(), path.join(OUT, `${this.name}.webm`));
    rmSync(this.videoDir, { recursive: true, force: true });
    appendFileSync(path.join(OUT, 'ui-clips.txt'), `${this.name}\n`);
  }
}

function expectText(actual, needle, where) {
  if (!actual.includes(needle)) fail(`expected "${needle}" in ${where}, got: ${actual.slice(0, 200)}`);
}

// The fixed-width record line inside a record-pr16/record-pr17 element, located by its record type prefix and
// padded back to the record length (trailing filler spaces may be dropped by the page). Null when not found.
function recordLine(text, type, length, minLength) {
  const line = text.split('\n').map((l) => l.replace(/\r$/, '')).find((l) => l.startsWith(type) && l.length >= minLength);
  return line === undefined ? null : line.padEnd(length).slice(0, length);
}

async function readRecords(c) {
  return {
    pr16: recordLine(await c.raw('record-pr16'), 'PR16', 250, 75),
    pr17: recordLine(await c.raw('record-pr17'), 'PR17', 300, 124),
  };
}

const CLIPS = [
  ['ui-01-pending-invite', async (c) => {
    await c.go('/');
    await c.say('', 'Renewal mock UI', 'Seed state restored with POST /api/reset; every policy is synthetic', 2200);
    await c.go('/journey?step=1');
    await c.need('journey-step-1');
    await c.say('Step 1', 'PENDING renewal SYN-REN-0004 loaded', 'ALBDIR, policy year 4');
    await c.go('/invite/SYN-REN-0004');
    await c.mark('invite-summary');
    const prior = await c.text('prior-premium');
    const renewal = await c.text('renewal-premium');
    const nb = await c.text('nb-equivalent');
    await c.mark('prior-premium'); await c.mark('renewal-premium'); await c.mark('nb-equivalent');
    await c.say('Step 1', 'Renewal invite: last year, this year and equivalent new business price',
      `Prior ${prior} · renewal ${renewal} · equivalent NB ${nb} (ICOBS 6A disclosure)`, 3400);
    await c.mark('shopping-around-prompt');
    await c.say('Step 1', 'Shopping-around prompt shown', 'Policy year 4 or more: the invite carries the encouragement to shop around');
  }],
  ['ui-02-eligibility-pass', async (c) => {
    await c.go('/journey?step=2');
    await c.mark('journey-step-2');
    await c.say('Step 2', 'Renewal eligibility screen: SYN-REN-0004 eligible',
      'No block codes: opt-out, marketing suppression, sanctions, vulnerability, bereavement, GDPR erasure all clear');
  }],
  ['ui-03-ps215-gate', async (c) => {
    await c.go('/journey?step=3');
    await c.need('journey-step-3');
    await c.say('Step 3', 'PS21/5 price-walking gate', 'Renewal price must not exceed the equivalent new business price', 2200);
    await c.go('/ps215/SYN-REN-0004');
    const pass = await c.text('ps215-result');
    if (pass.includes('PRICE_WALK_BREACH')) fail(`SYN-REN-0004 should pass PS21/5, got: ${pass}`);
    await c.mark('ps215-result');
    await c.say('Step 3', 'SYN-REN-0004 passes PS21/5', `Result: ${pass.split('\n')[0]}`);
    await c.go('/ps215/SYN-REN-0002');
    const breach = await c.text('ps215-result');
    expectText(breach, 'PRICE_WALK_BREACH', 'ps215-result for SYN-REN-0002');
    await c.mark('ps215-result');
    const log = await c.text('compliance-log');
    expectText(log, 'COMPLIANCE-BREACH|PS215', 'compliance-log for SYN-REN-0002');
    await c.mark('compliance-log');
    await c.say('Step 3', 'Breach variant SYN-REN-0002: PRICE_WALK_BREACH', 'Compliance log line written for the breach', 3600);
    await c.go('/ps215/SYN-REN-0005');
    const equal = await c.text('ps215-result');
    if (equal.includes('PRICE_WALK_BREACH')) fail(`SYN-REN-0005 (equal price) should pass PS21/5, got: ${equal}`);
    await c.mark('ps215-result');
    await c.say('Step 3', 'Boundary SYN-REN-0005: renewal equal to new business price passes', 'Only a strictly higher renewal price breaches');
  }],
  ['ui-04-vulnerability-banner', async (c) => {
    await c.go('/invite/SYN-REN-0003');
    await c.mark('vulnerability-banner');
    await c.say('Vulnerability', 'SYN-REN-0003: vulnerability noted (FCA FG21/1)',
      'Eligibility returns VULNERABILITY_REVIEW: the renewal goes to review instead of auto-renewing', 3400);
  }],
  ['ui-05-pr16-pr17-records', async (c) => {
    await c.go('/journey?step=4');
    await c.need('journey-step-4');
    await c.say('Step 4', 'PRINTV disclosure records', 'PR16 (250 bytes) unchanged; PR17 (300 bytes) adds the ICOBS 6A renewal disclosure', 2200);
    await c.go('/records/SYN-REN-0004');
    await c.mark('record-pr16');
    await c.mark('record-pr17');
    const { pr16, pr17 } = await readRecords(c);
    let detail = 'PR16 positions 005-075 are carried into PR17 unchanged';
    if (pr16 && pr17) {
      if (pr16.slice(4, 75) !== pr17.slice(4, 75)) fail('PR17 positions 005-075 differ from PR16');
      detail = `005-075 identical to PR16 · NCD years ${pr17.slice(120, 122)} · shopping-around ${pr17[122]} · opt-out ${pr17[123]}`;
    }
    await c.say('Step 4', 'PR16 and PR17 for SYN-REN-0004', detail, 4200);
  }],
  ['ui-06-opt-out', async (c) => {
    await c.go('/optout/SYN-REN-0004');
    const form = await c.mark('optout-form');
    await c.say('Step 5', 'Customer opts out of auto-renewal', 'Opt-out form for SYN-REN-0004', 2200);
    for (const box of await form.locator('input[type=checkbox][required]:not(:checked)').all()) await box.check();
    for (const field of await form.locator('input[required]:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea[required]').all()) {
      if (!(await field.inputValue())) await field.fill('Customer request');
    }
    for (const sel of await form.locator('select[required]').all()) {
      const values = (await sel.locator('option').evaluateAll((os) => os.map((o) => o.value))).filter(Boolean);
      if (values.length) await sel.selectOption(values[0]);
    }
    await Promise.all([c.page.waitForLoadState('load'), c.el('optout-submit').click()]);
    if (!(await c.el('suppression-flag').isVisible().catch(() => false))) await c.go('/optout/SYN-REN-0004');
    await c.mark('suppression-flag');
    await c.say('Step 5', 'Opt-out captured: renewal suppressed', `Suppression flag: ${(await c.text('suppression-flag')).split('\n')[0]}`, 3000);
    await c.go('/journey?step=5');
    await c.mark('journey-step-5');
    await c.say('Step 5', 'Journey: opt-out recorded', 'SYN-REN-0004 now carries the renewal opt-out');
    await c.go('/records/SYN-REN-0004');
    await c.mark('record-pr17');
    const { pr17 } = await readRecords(c);
    await c.say('Step 5', 'PR17 re-read after the opt-out',
      pr17 ? `Position 124 (opt-out flag) = ${pr17[123]}` : 'Position 124 of PR17 carries the opt-out flag', 3200);
  }],
  ['ui-07-auto-renew-blocked', async (c) => {
    await c.go('/journey?step=6');
    await c.need('journey-step-6');
    const status = await c.text('auto-renew-status');
    expectText(status, 'OPT_OUT', 'auto-renew-status on /journey?step=6');
    await c.mark('auto-renew-status');
    await c.say('Step 6', 'Auto-renewal blocked: OPT_OUT', status.split('\n')[0], 3200);
    await c.mark('journey-next');
    await Promise.all([c.page.waitForLoadState('load'), c.el('journey-next').click()]);
    await c.mark('journey-step-7');
    await c.say('Step 7', 'Journey summary', 'Eligibility, PS21/5 gate, PR17 disclosure and opt-out for the same renewal', 3400);
  }],
  ['ui-08-admin-eligibility', async (c) => {
    await c.go('/admin/eligibility');
    const table = await c.text('eligibility-codes-table');
    expectText(table, 'VULNERABILITY_REVIEW', 'eligibility-codes-table');
    expectText(table, 'OPT_OUT', 'eligibility-codes-table');
    await c.mark('eligibility-codes-table');
    await c.say('Admin', 'Eligibility block codes across the seed policies',
      'Codes in fixed order: OPT_OUT, MARKETING_SUPPRESSED, SANCTIONS_HOLD, VULNERABILITY_REVIEW, BEREAVEMENT_HOLD, GDPR_ERASURE_PENDING', 4000);
  }],
  ['ui-09-heritage-cics', async (c) => {
    await c.go('/');
    await c.say('Heritage', 'Heritage reference HR12345678A', 'Routed to the simulated CICS passthrough, which answers with a delay', 2200);
    const started = Date.now();
    await c.go('/invite/HR12345678A', HERITAGE_TIMEOUT_MS);
    await c.need('invite-summary', HERITAGE_TIMEOUT_MS);
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    await c.mark('invite-summary');
    await c.say('Heritage', `HR12345678A answered by the simulated CICS passthrough after ${secs} s`, 'Brand HERIT', 3600);
  }],
];

mkdirSync(OUT, { recursive: true });
rmSync(path.join(OUT, 'ui-clips.txt'), { force: true });
const api = await request.newContext();
const reset = await api.post(`${BASE}/api/reset`).catch((e) => fail(`mock UI not reachable at ${BASE}: ${e.message}`));
if (!reset.ok()) fail(`POST /api/reset returned HTTP ${reset.status()}`);
await api.dispose();

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
try {
  for (const [name, run] of CLIPS) {
    console.error(`record_ui: ${name}`);
    const clip = new Clip(browser, name);
    await clip.open();
    try { await run(clip); } finally { await clip.close(); }
  }
} finally {
  await browser.close();
}
console.error(`record_ui: ${CLIPS.length} clips written to ${OUT}`);

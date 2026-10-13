(function () {
  'use strict';

  const main = document.getElementById('main');
  const LABEL = 'Offline demo – synthetic data, not production results';
  const JOURNEY_REF = 'SYN-REN-0004';
  const BREACH_REF = 'SYN-REN-0002';
  const STEPS = [
    'PENDING policy loaded', 'Eligibility screen', 'PS21/5 price-walk gate', 'PRINTV PR16 vs PR17',
    'Opt-out captured', 'Auto-renew blocked', 'Summary',
  ];

  // ------------------------------------------------------------------------------------------- helpers
  const esc = (v) => String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const money = (v) => (v === null || v === undefined || v === '' ? '—' : '£' + Number(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const flagText = (v) => (v === null || v === undefined ? 'null' : String(v));

  async function api(method, url, body) {
    const opts = { method, headers: { Accept: 'application/json' } };
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || res.statusText); e.status = res.status; e.data = data; throw e; }
    return data;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function setNav(key) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render(html, title) {
    main.innerHTML = html;
    document.title = (title ? title + ' – ' : '') + 'Albion General renewal compliance (offline demo)';
  }

  function head(eyebrow, title, lede, extra) {
    return '<div class="page-head"><div><p class="eyebrow">' + esc(eyebrow) + '</p><h1>' + esc(title) + '</h1>'
      + (lede ? '<p class="lede">' + lede + '</p>' : '') + '</div>' + (extra || '') + '</div>'
      + '<p class="sr-only">' + esc(LABEL) + '</p>';
  }

  function policyPicker(current, base, includeHeritage) {
    return '<div class="picker"><label class="small muted" for="picker">Policy</label>'
      + '<select id="picker" data-base="' + esc(base) + '">'
      + state.policies.filter((p) => includeHeritage || !p.heritage)
        .map((p) => '<option value="' + esc(p.ref) + '"' + (p.ref === current ? ' selected' : '') + '>' + esc(p.ref) + ' · ' + esc(p.fields.BrandCode_Ext) + '</option>').join('')
      + '</select></div>';
  }

  function bindPicker() {
    const s = document.getElementById('picker');
    if (s) s.addEventListener('change', () => go(s.dataset.base + encodeURIComponent(s.value)));
  }

  function go(url) { history.pushState({}, '', url); route(); }

  const state = { policies: [] };
  async function loadPolicies() { state.policies = await api('GET', '/api/policies'); }

  // ----------------------------------------------------------------------------------------- components
  function codeChips(codes) {
    if (!codes || !codes.length) return '<span class="chip chip-ok">Eligible</span>';
    return codes.map((c) => '<span class="chip ' + (c === 'VULNERABILITY_REVIEW' ? 'chip-warn' : 'chip-bad') + '">' + esc(c) + '</span>').join('');
  }

  function vulnerabilityBanner(p) {
    if (!p.vulnerable) return '';
    return '<div class="callout callout-warn" role="alert" data-testid="vulnerability-banner">'
      + '<span class="icon" aria-hidden="true">!</span><div><strong>Customer in vulnerable circumstances – FCA FG21/1</strong>'
      + '<p>This customer has a vulnerability noted (<code>VulnerabilityNoted_Ext</code>). Automatic renewal is held for review '
      + '(<code>VULNERABILITY_REVIEW</code> → activity <code>renewal_vulnerability_review</code>). Agree communication needs and confirm '
      + 'the customer understands the renewal terms before proceeding; do not apply pressure to renew.</p></div></div>';
  }

  function shoppingPrompt(p) {
    if (!p.shoppingAround) return '';
    return '<div class="callout callout-info" data-testid="shopping-around-prompt">'
      + '<span class="icon" aria-hidden="true">i</span><div><strong>You have been with us for ' + esc(p.fields.PolicyYear_Ext) + ' years – it may pay to shop around</strong>'
      + '<p>ICOBS 6A: you may be able to get the same cover for less, from us or another insurer. Compare your renewal price with what you could pay elsewhere before you decide.</p></div></div>';
  }

  function autoRenewStatus(status, codes) {
    const blocked = status === 'BLOCKED';
    return '<div class="verdict ' + (blocked ? 'verdict-blocked' : 'verdict-pass') + '" data-testid="auto-renew-status" data-status="' + esc(status) + '">'
      + '<span class="badge" aria-hidden="true">' + (blocked ? '■' : '✓') + '</span><div><div class="muted small">Auto-renew</div>'
      + '<div class="big">' + esc(status) + '</div>'
      + (codes && codes.length ? '<div class="chips" style="margin-top:6px">' + codeChips(codes) + '</div>' : '<div class="muted small">No eligibility blocks and no PS21/5 breach</div>')
      + '</div></div>';
  }

  function inviteSummary(p) {
    const f = p.fields;
    return '<section class="card" data-testid="invite-summary" aria-labelledby="inv-' + esc(p.ref) + '">'
      + '<div class="card-head"><div><p class="eyebrow">Renewal invitation</p><h2 id="inv-' + esc(p.ref) + '" class="mono">' + esc(p.ref) + '</h2></div>'
      + '<div class="chips"><span class="chip">' + esc(p.brandName || f.BrandCode_Ext) + '</span><span class="chip chip-info">FeedStatus ' + esc(f.FeedStatus_Ext) + '</span></div></div>'
      + '<dl class="kv" style="margin-bottom:18px"><dt>Policyholder</dt><dd>' + esc(f.InsuredSurname_Ext) + '</dd><dt>Product</dt><dd>' + esc(p.product) + '</dd>'
      + '<dt>Renewal date</dt><dd>' + esc(p.renewalDate) + '</dd><dt>Policy year</dt><dd>' + esc(f.PolicyYear_Ext) + '</dd><dt>No-claims years</dt><dd>' + esc(f.NCDYears_Ext) + '</dd></dl>'
      + '<div class="tiles" role="group" aria-label="Premium disclosure">'
      + '<div class="tile tile-prior"><div class="label">Last year you paid</div><div class="value" data-testid="prior-premium">' + money(f.PriorPremium_Ext) + '</div><div class="sub mono">PriorPremium_Ext</div></div>'
      + '<div class="tile tile-renewal"><div class="label">Your renewal price</div><div class="value" data-testid="renewal-premium">' + money(f.RenewalPremium_Ext) + '</div><div class="sub mono">RenewalPremium_Ext</div></div>'
      + '<div class="tile tile-nb"><div class="label">Equivalent new-customer price</div><div class="value" data-testid="nb-equivalent">' + money(f.EquivalentNBPremium_Ext) + '</div><div class="sub mono">EquivalentNBPremium_Ext</div></div>'
      + '</div></section>';
  }

  function gateCard(g, label) {
    const breach = !g.passes;
    return '<div class="card" data-testid="ps215-result" data-ref="' + esc(g.ref) + '" data-result="' + (breach ? 'BREACH' : 'PASS') + '">'
      + (label ? '<p class="eyebrow">' + esc(label) + '</p>' : '')
      + '<div class="verdict ' + (breach ? 'verdict-breach' : 'verdict-pass') + '"><span class="badge" aria-hidden="true">' + (breach ? '✕' : '✓') + '</span>'
      + '<div><div class="muted small mono">' + esc(g.ref) + ' · AlbionPS215Gate.evaluate</div><div class="big">' + (breach ? esc(g.codes.join(', ')) : 'PASS') + '</div>'
      + '<div class="muted small">' + (breach ? 'Renewal price exceeds the equivalent new-business price' : (g.allowed === null ? 'No equivalent NB price held – no comparison possible' : 'Renewal price is not above the equivalent new-business price')) + '</div></div></div>'
      + '<div class="compare"><div class="side"><div class="muted small">Renewal premium (gate input)</div><div class="value">' + money(g.actual) + '</div><div class="field">' + esc(g.actualField) + '</div></div>'
      + '<div class="op" aria-label="' + (breach ? 'greater than' : 'not greater than') + '">' + (breach ? '&gt;' : '≤') + '</div>'
      + '<div class="side"><div class="muted small">Equivalent NB price (allowed)</div><div class="value">' + money(g.allowed) + '</div><div class="field">' + esc(g.allowedField) + '</div></div></div>'
      + '</div>';
  }

  function complianceLog(entries) {
    const lines = entries.map((e) => e.line);
    return '<section class="card"><div class="card-head"><h3>Compliance log</h3><span class="chip">AlbionPolicyPredicates.logComplianceBreach</span></div>'
      + '<pre class="log' + (lines.length ? '' : ' empty') + '" data-testid="compliance-log" aria-live="polite">'
      + (lines.length ? esc(lines.join('\n')) : 'No breaches logged since the last reset.') + '</pre></section>';
  }

  function suppressionFlag(p) {
    const on = p.suppressed;
    return '<div class="flag' + (on ? ' on' : '') + '" data-testid="suppression-flag" data-value="' + esc(flagText(p.fields.RenewalOptOut_Ext)) + '">'
      + '<span class="dot" aria-hidden="true"></span>RenewalOptOut_Ext = ' + esc(flagText(p.fields.RenewalOptOut_Ext))
      + '<span class="chip ' + (on ? 'chip-bad' : 'chip-ok') + '">' + (on ? 'Suppressed' : 'Not suppressed') + '</span></div>';
  }

  function recordView(rec, which) {
    const layout = which === 'pr16' ? rec.layoutPR16 : rec.layoutPR17;
    const text = rec[which];
    const testid = which === 'pr16' ? 'record-pr16' : 'record-pr17';
    const title = which === 'pr16' ? 'PR16 – current production (250 bytes)' : 'PR17 – disclosure candidate (300 bytes)';
    if (text === null) {
      return '<section class="card" data-testid="' + testid + '"><h3>' + title + '</h3><div class="callout callout-bad"><span class="icon">!</span><div><strong>Record not built</strong><p class="mono">' + esc(rec[which + 'Error']) + '</p></div></div></section>';
    }
    const kindAt = new Array(text.length);
    const nameAt = new Array(text.length);
    layout.forEach((s) => { for (let i = s.from; i <= s.to; i++) { kindAt[i - 1] = s.kind; nameAt[i - 1] = s.name; } });
    let ruler = ''; let bytes = '';
    for (let i = 0; i < text.length; i++) {
      const pos = i + 1;
      ruler += '<span class="' + (pos % 10 === 0 ? 'ten' : '') + '">' + (pos % 10 === 0 ? String(pos / 10 % 10) : (pos % 5 === 0 ? '·' : '')) + '</span>';
      const ch = text[i];
      bytes += '<span class="k-' + esc(kindAt[i]) + '" title="' + pos + ' ' + esc(nameAt[i]) + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>';
    }
    const rows = layout.map((s) => {
      const val = text.slice(s.from - 1, s.to);
      return '<tr' + (s.kind === 'disclosure' ? ' style="background:rgba(63,208,201,.07)"' : '') + '><td class="mono">' + String(s.from).padStart(3, '0') + '–' + String(s.to).padStart(3, '0') + '</td><td>' + esc(s.name)
        + (s.kind === 'disclosure' ? ' <span class="chip chip-info">disclosure</span>' : '') + '</td><td class="mono small">' + esc(s.source) + '</td><td class="mono">' + (s.kind === 'filler' ? '<span class="muted">' + (s.to - s.from + 1) + ' spaces</span>' : '“' + esc(val).replace(/ /g, '&nbsp;') + '”') + '</td></tr>';
    }).join('');
    return '<section class="card" data-testid="' + testid + '" data-length="' + text.length + '">'
      + '<div class="card-head"><h3>' + title + '</h3><span class="chip ' + (which === 'pr17' ? 'chip-info' : '') + '">length ' + text.length + '</span></div>'
      + '<div class="record" role="img" aria-label="' + esc(which.toUpperCase()) + ' record bytes with offset ruler">'
      + chunks(ruler, bytes, text.length) + '</div>'
      + '<div class="table-wrap"><table><thead><tr><th>Offset</th><th>Field</th><th>Source</th><th>Value</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function chunks(rulerHtml, bytesHtml, len) {
    // 75-byte rows: row 2 of PR17 starts exactly at the disclosure block (076)
    const r = rulerHtml.match(/<span[^>]*>.*?<\/span>/g); const b = bytesHtml.match(/<span[^>]*>.*?<\/span>/g);
    let out = '';
    for (let i = 0; i < len; i += 75) {
      out += '<div class="record-row"><div class="off">' + String(i + 1).padStart(3, '0') + '</div><div><div class="ruler">' + r.slice(i, i + 75).join('') + '</div><div class="bytes">' + b.slice(i, i + 75).join('') + '</div></div></div>';
    }
    return out;
  }

  const legend = '<div class="legend"><span><i class="k-type"></i>Record type</span><span><i class="k-text"></i>Party / brand text</span><span><i class="k-num"></i>padNum (implied 2dp)</span><span><i class="k-date"></i>Date (yyyyMMdd)</span><span><i class="k-disclosure"></i>PR17 disclosure block 076–124</span></div>';

  // --------------------------------------------------------------------------------------------- screens
  async function homeScreen() {
    setNav('home');
    const cards = state.policies.map((p) => {
      if (p.heritage) {
        return '<article class="card policy-card"><div class="card-head"><h3>' + esc(p.ref) + '</h3><span class="chip chip-info">Heritage · POLARIS</span></div>'
          + '<div class="meta">' + esc(p.product) + ' · brand ' + esc(p.fields.BrandCode_Ext) + '</div>'
          + '<p class="small muted">Matches <code>^[A-Z]{2}[0-9]{8}[A-Z]$</code> – the invite service routes it to the CICS passthrough instead of Guidewire.</p>'
          + '<div class="links"><a href="/invite/' + esc(p.ref) + '">Invite status via CICS</a></div></article>';
      }
      const f = p.fields;
      return '<article class="card policy-card"><div class="card-head"><h3>' + esc(p.ref) + '</h3><span class="chip">' + esc(f.BrandCode_Ext) + '</span></div>'
        + '<div class="meta">' + esc(p.product) + ' · year ' + esc(f.PolicyYear_Ext) + ' · renews ' + esc(p.renewalDate) + ' · FeedStatus ' + esc(f.FeedStatus_Ext) + '</div>'
        + '<dl class="kv"><dt>Prior</dt><dd>' + money(f.PriorPremium_Ext) + '</dd><dt>Renewal</dt><dd>' + money(f.RenewalPremium_Ext) + '</dd><dt>Equivalent NB</dt><dd>' + money(f.EquivalentNBPremium_Ext) + '</dd></dl>'
        + '<div class="chips" style="margin-top:12px">' + codeChips(p.eligibilityCodes)
        + (p.ps215Preview.length ? '<span class="chip chip-bad">' + esc(p.ps215Preview.join(', ')) + '</span>' : '<span class="chip chip-ok">PS21/5 pass</span>')
        + (p.shoppingAround ? '<span class="chip chip-info">Shopping-around prompt</span>' : '') + '</div>'
        + '<div class="links"><a href="/invite/' + esc(p.ref) + '">Invite</a><a href="/optout/' + esc(p.ref) + '">Opt-out</a><a href="/ps215/' + esc(p.ref) + '">PS21/5</a><a href="/records/' + esc(p.ref) + '">PRINTV</a></div></article>';
    }).join('');
    render(head('Renewal compliance', 'Renewal book – synthetic policies',
      'Each renewal passes the eligibility screen (opt-out, suppression, sanctions, vulnerability, bereavement, GDPR erasure), then the PS21/5 price-walk gate, before an invite is issued with the ICOBS 6A price disclosure.',
      '<a class="btn btn-primary" href="/journey?step=1">Start the guided journey</a>')
      + '<div class="grid grid-auto">' + cards + '</div>'
      + serviceConsole(), 'Policies');
    bindConsole();
  }

  function serviceConsole() {
    return '<section class="card" style="margin-top:24px" aria-labelledby="ws-h"><div class="card-head"><div><p class="eyebrow">Integration stub</p><h2 id="ws-h">RenewalInviteService V1–V4</h2></div><span class="chip">GET /ws/v{1..4}/RenewalInviteService</span></div>'
      + '<form id="ws-form" class="grid grid-3" style="align-items:end"><div><label for="ws-v">Version</label><select id="ws-v"><option value="1">V1</option><option value="2" selected>V2</option><option value="3">V3</option><option value="4">V4</option></select></div>'
      + '<div><label for="ws-p">policyNumber</label><input id="ws-p" type="text" value="SYN-REN-0001" autocomplete="off"></div>'
      + '<div><label for="ws-b">brandCode</label><input id="ws-b" type="text" value="ALBDIR" autocomplete="off"></div>'
      + '<div class="actions" style="grid-column:1/-1;margin-top:0"><button class="btn btn-primary" type="submit">Call service</button>'
      + '<button class="btn btn-ghost" type="button" data-fill="HR12345678A|HERIT">Heritage ref</button><button class="btn btn-ghost" type="button" data-fill="AB1|ALBDIR">Short ref (AGI-4001)</button></div></form>'
      + '<div id="ws-out" style="margin-top:14px"></div></section>';
  }

  function bindConsole() {
    const form = document.getElementById('ws-form');
    if (!form) return;
    form.querySelectorAll('[data-fill]').forEach((b) => b.addEventListener('click', () => {
      const [p, br] = b.dataset.fill.split('|');
      document.getElementById('ws-p').value = p; document.getElementById('ws-b').value = br;
    }));
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      callService(document.getElementById('ws-v').value, document.getElementById('ws-p').value, document.getElementById('ws-b').value, document.getElementById('ws-out'));
    });
  }

  async function callService(version, policyNumber, brandCode, out) {
    const url = '/ws/v' + version + '/RenewalInviteService?policyNumber=' + encodeURIComponent(policyNumber) + '&brandCode=' + encodeURIComponent(brandCode);
    const heritage = /^[A-Z]{2}[0-9]{8}[A-Z]$/.test(policyNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase()) && policyNumber.length >= 5;
    out.innerHTML = heritage
      ? '<div class="cics" role="status" data-testid="cics-routing"><span class="spinner" aria-hidden="true"></span><div><strong>Routing via CICS…</strong><div class="small muted">Heritage reference – PolarisCICSGateway.enquire on the POLARIS mainframe (simulated latency)</div></div></div>'
      : '<div class="muted small" role="status">Calling…</div>';
    const t0 = performance.now();
    const res = await fetch(url);
    const xml = await res.text();
    const ms = Math.round(performance.now() - t0);
    const routeHdr = res.headers.get('X-Albion-Route');
    const tx = res.headers.get('X-Albion-CICS-Transaction');
    out.innerHTML = (routeHdr === 'CICS'
      ? '<div class="cics" data-testid="cics-routing" data-routed="true"><span class="chip chip-info">Routed via CICS</span><div class="small">PolarisCICSGateway.enquire(<code>' + esc(tx) + '</code>) · ' + ms + ' ms round trip</div></div>'
      : '<div class="chips"><span class="chip">Served by Guidewire</span><span class="chip">' + ms + ' ms</span><span class="chip">HTTP ' + res.status + ' · ' + esc(res.headers.get('Content-Type')) + '</span></div>')
      + '<pre class="log xml" style="margin-top:10px" data-testid="ws-response">' + esc(xml) + '</pre>';
  }

  async function inviteScreen(ref) {
    setNav('home');
    let p;
    try { p = await api('GET', '/api/policies/' + encodeURIComponent(ref)); } catch (e) { return notFound(ref); }
    if (p.heritage) {
      render(head('Screen 1 · Renewal invite', p.ref, 'Heritage policies are mastered on POLARIS. The invite service normalises the reference, detects the heritage pattern and passes the enquiry through to CICS.', policyPicker(ref, '/invite/', true))
        + '<section class="card"><h2>Invite status</h2><div id="ws-out"></div></section>', p.ref);
      bindPicker();
      return callService(2, p.ref, p.fields.BrandCode_Ext, document.getElementById('ws-out'));
    }
    const status = p.eligibilityCodes.length ? 'BLOCKED' : (p.ps215Preview.length ? 'BLOCKED' : 'ALLOWED');
    render(head('Screen 1 · Renewal invite', 'Your renewal, ' + p.fields.InsuredSurname_Ext,
      'Prior premium, renewal premium and the equivalent new-business price are disclosed side by side.', policyPicker(ref, '/invite/', true))
      + '<div class="stack">' + vulnerabilityBanner(p) + inviteSummary(p) + shoppingPrompt(p)
      + '<section class="card"><div class="card-head"><h3>Renewal decision preview</h3><div class="chips">' + codeChips(p.eligibilityCodes) + '</div></div>'
      + autoRenewStatus(status, p.eligibilityCodes.length ? p.eligibilityCodes : p.ps215Preview)
      + '<div class="actions"><a class="btn btn-ghost" href="/optout/' + esc(p.ref) + '">Opt out of auto-renewal</a><a class="btn btn-ghost" href="/ps215/' + esc(p.ref) + '">PS21/5 check</a><a class="btn btn-ghost" href="/records/' + esc(p.ref) + '">PRINTV record</a></div></section></div>', p.ref);
    bindPicker();
  }

  async function optoutScreen(ref) {
    setNav('home');
    let p;
    try { p = await api('GET', '/api/policies/' + encodeURIComponent(ref)); } catch (e) { return notFound(ref); }
    if (p.heritage) return notFound(ref, 'Heritage policies are opted out on POLARIS, not in this screen.');
    render(head('Screen 2 · Opt-out capture', 'Stop automatic renewal', 'Recording the customer\'s choice sets the suppression flag <code>RenewalOptOut_Ext = Y</code>. The eligibility screen then returns <code>OPT_OUT</code> and the auto-renewal is blocked.', policyPicker(ref, '/optout/', false))
      + '<div class="grid grid-2"><section class="card">' + optoutForm(p) + '</section>'
      + '<section class="card"><h3>Suppression flag</h3>' + suppressionFlag(p) + '<div id="decision" style="margin-top:18px">' + (p.suppressed ? autoRenewStatus('BLOCKED', p.eligibilityCodes) : '') + '</div></section></div>', 'Opt-out ' + p.ref);
    bindPicker();
    bindOptout(p.ref, false);
  }

  function optoutForm(p, readOnly) {
    const dis = readOnly ? ' disabled' : '';
    return '<form data-testid="optout-form" id="optout-form" aria-describedby="optout-hint"><h3>Opt-out of auto-renewal · <span class="mono">' + esc(p.ref) + '</span></h3>'
      + '<p class="hint" id="optout-hint">The customer keeps cover until ' + esc(p.renewalDate) + '. No renewal will be taken automatically.</p>'
      + '<fieldset' + dis + '><legend>Reason given (optional)</legend>'
      + ['Arranging cover elsewhere', 'Prefers to renew manually', 'No longer needs cover', 'Prefer not to say'].map((r, i) => '<label class="radio"><input type="radio" name="reason" value="' + esc(r) + '"' + (i === 1 ? ' checked' : '') + '> ' + esc(r) + '</label>').join('')
      + '</fieldset><div class="field"><label for="channel">Channel</label><select id="channel" name="channel"' + dis + '><option>Telephone</option><option>Online account</option><option>Post</option><option>Broker</option></select></div>'
      + '<button class="btn btn-danger" type="submit" data-testid="optout-submit"' + (p.suppressed || readOnly ? ' disabled' : '') + '>' + (p.suppressed ? 'Opt-out recorded' : 'Record opt-out') + '</button></form>';
  }

  function bindOptout(ref) {
    const form = document.getElementById('optout-form');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      await api('POST', '/api/policies/' + encodeURIComponent(ref) + '/optout', { reason: fd.get('reason'), channel: fd.get('channel') });
      const d = await api('POST', '/api/policies/' + encodeURIComponent(ref) + '/decision');
      toast('Opt-out recorded – RenewalOptOut_Ext = Y');
      await loadPolicies();
      await optoutScreen(ref);
      document.getElementById('decision').innerHTML = autoRenewStatus(d.autoRenew, d.blockedBy) + activitiesList(d.activities);
    });
  }

  function activitiesList(acts) {
    if (!acts || !acts.length) return '';
    return '<p class="small muted" style="margin-top:12px">Activities raised (AlbionRenewalEligibilityActivities.raise): '
      + acts.map((a) => '<code>' + esc(a.code) + '</code> → <code>' + esc(a.pattern) + '</code>').join(', ') + '</p>';
  }

  async function ps215Screen(ref) {
    setNav('ps215');
    let g;
    try { g = await api('POST', '/api/policies/' + encodeURIComponent(ref) + '/ps215'); } catch (e) { return notFound(ref, e.status === 409 ? e.message : undefined); }
    const log = await api('GET', '/api/compliance-log');
    render(head('Screen 4 · PS21/5 price walking', 'Renewal price vs equivalent new-business price',
      'FCA PS21/5: a renewing customer must not be quoted more than an equivalent new customer. The gate breaches only when the renewal premium is <em>strictly greater</em>; an equal price passes.', policyPicker(ref, '/ps215/', false))
      + '<div class="stack">' + gateCard(g)
      + '<div class="callout callout-info"><span class="icon" aria-hidden="true">i</span><div><strong>Gate input mapping</strong><p>The production gate reads the renewal premium from <code>AnnualPremium_Ext</code> and compares it with <code>EquivalentNBPremium_Ext</code>. A missing NB price means no comparison (no breach).</p></div></div>'
      + complianceLog(log) + '</div>', 'PS21/5 ' + ref);
    bindPicker();
  }

  async function adminScreen() {
    setNav('admin');
    const [cat, acts] = await Promise.all([api('GET', '/api/eligibility/codes'), api('GET', '/api/activities')]);
    const rows = cat.codes.map((c, i) => '<tr><td>' + (i + 1) + '</td><td><code>' + esc(c.code) + '</code></td><td><code>' + esc(c.field) + '</code></td><td><code>' + esc(c.pattern) + '</code></td><td class="small muted">' + esc(c.meaning || '') + '</td></tr>').join('');
    const matrix = state.policies.filter((p) => !p.heritage).map((p) => '<tr><td class="mono">' + esc(p.ref) + '</td>'
      + cat.codes.map((c) => { const on = p.eligibilityCodes.includes(c.code); return '<td>' + (on ? '<span class="chip chip-bad">SET</span>' : '<span class="muted">–</span>') + '</td>'; }).join('')
      + '<td>' + (p.ps215Preview.length ? '<span class="chip chip-bad" title="' + esc(p.ps215Preview[0]) + '">BREACH</span>' : '<span class="chip chip-ok">pass</span>') + '</td></tr>').join('');
    render(head('Screen 5 · Administration', 'Renewal eligibility codes',
      'Codes are evaluated in this fixed order by <code>AlbionRenewalEligibilityRules.evaluate</code>. Each code raises its activity pattern.', '')
      + '<div class="stack"><section class="card"><div class="card-head"><h2>Eligibility code catalogue</h2><span class="chip">' + esc(cat.truthiness) + '</span></div>'
      + '<div class="table-wrap"><table data-testid="eligibility-codes-table"><thead><tr><th>#</th><th>Code</th><th>Source field (PolicyPeriod)</th><th>Activity pattern</th><th>Meaning</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>'
      + '<section class="card"><div class="card-head"><h2>PS21/5 gate input mapping</h2><span class="chip">AlbionPS215Gate</span></div>'
      + '<div class="table-wrap"><table data-testid="ps215-mapping"><thead><tr><th>Role</th><th>Field read</th><th>Carries</th></tr></thead><tbody>'
      + '<tr><td>Actual (renewal premium)</td><td><code>' + esc(cat.gate.actualField) + '</code></td><td>The renewal premium being invited (production mapping; null treated as 0.00)</td></tr>'
      + '<tr><td>Allowed (ceiling)</td><td><code>' + esc(cat.gate.allowedField) + '</code></td><td>Equivalent new-business price (null = no comparison)</td></tr>'
      + '<tr><td>Rule</td><td colspan="2">' + esc(cat.gate.comparison) + ' → <code>' + esc(cat.gate.breachCode) + '</code>, log <code>COMPLIANCE-BREACH|PS215|&lt;bean&gt;|&lt;actual&gt;|&lt;allowed&gt;</code></td></tr></tbody></table></div></section>'
      + '<section class="card"><h2>Current book</h2><div class="table-wrap"><table class="matrix"><thead><tr><th>Policy</th>' + cat.codes.map((c) => '<th>' + esc(c.code) + '</th>').join('') + '<th>PS21/5</th></tr></thead><tbody>' + matrix + '</tbody></table></div>'
      + (acts.length ? '<p class="small muted">Activities raised since reset: ' + acts.map((a) => '<code>' + esc(a.ref) + ' ' + esc(a.code) + ' → ' + esc(a.pattern) + '</code>').join(', ') + '</p>' : '') + '</section></div>', 'Eligibility admin');
  }

  async function recordsScreen(ref) {
    setNav('records');
    let rec;
    try { rec = await api('GET', '/api/policies/' + encodeURIComponent(ref) + '/records'); } catch (e) { return notFound(ref, e.status === 409 ? e.message : undefined); }
    render(head('PRINTV print records', 'PR16 vs PR17 · ' + ref,
      'PR16 stays byte-identical. PR17 keeps positions 001–075 and adds the ICOBS 6A disclosure block at 076–124 (prior, renewal and equivalent NB premium as implied-2dp padNum, NCD years, shopping-around and opt-out flags).', policyPicker(ref, '/records/', false))
      + legend + '<div class="stack">' + recordView(rec, 'pr16') + recordView(rec, 'pr17') + '</div>', 'PRINTV ' + ref);
    bindPicker();
  }

  function notFound(ref, msg) {
    render(head('Not available', String(ref), esc(msg || 'No synthetic policy with this reference.'), '<a class="btn btn-ghost" href="/">Back to policies</a>'), 'Not found');
  }

  // ---------------------------------------------------------------------------------------------- journey
  async function journeyScreen() {
    setNav('journey');
    let step = Number.parseInt(new URLSearchParams(location.search).get('step'), 10);
    if (!(step >= 1 && step <= 7)) step = 1;
    const d = await api('POST', '/api/journey/' + step);
    const p = d.policy;
    const stepper = '<ol class="stepper" aria-label="Journey steps">' + STEPS.map((s, i) => {
      const n = i + 1;
      return '<li><a href="/journey?step=' + n + '" class="' + (n < step ? 'done' : '') + '"' + (n === step ? ' aria-current="step"' : '') + '><span class="n">' + n + '</span>' + esc(s) + '</a></li>';
    }).join('') + '</ol>';
    let body = '';
    if (step === 1) {
      body = '<div class="callout callout-info"><span class="icon">1</span><div><strong>Renewal ' + esc(p.ref) + ' is waiting to be invited</strong><p>The PolicyCenter feed shows <code>FeedStatus_Ext = ' + esc(p.fields.FeedStatus_Ext) + '</code>. The customer is in policy year ' + esc(p.fields.PolicyYear_Ext) + ', so the ICOBS shopping-around prompt applies.</p></div></div>'
        + inviteSummary(p) + shoppingPrompt(p);
    } else if (step === 2) {
      body = '<section class="card"><h2>AlbionRenewalEligibilityRules.evaluate(' + esc(p.ref) + ')</h2>'
        + '<div class="verdict verdict-pass" data-testid="eligibility-result" data-codes="' + esc(d.eligibility.codes.join('|') || 'NONE') + '"><span class="badge">✓</span><div><div class="big">Eligible</div><div class="muted small">No block codes: none of the six suppression fields is set</div></div></div>'
        + '<div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>Code</th><th>Field</th><th>Value</th></tr></thead><tbody>'
        + ['OPT_OUT:RenewalOptOut_Ext', 'MARKETING_SUPPRESSED:MarketingSuppressed_Ext', 'SANCTIONS_HOLD:SanctionsHold_Ext', 'VULNERABILITY_REVIEW:VulnerabilityNoted_Ext', 'BEREAVEMENT_HOLD:BereavementHold_Ext', 'GDPR_ERASURE_PENDING:GDPRErasurePending_Ext']
          .map((x) => { const [c, f] = x.split(':'); return '<tr><td><code>' + c + '</code></td><td><code>' + f + '</code></td><td class="mono">' + esc(flagText(p.fields[f])) + '</td></tr>'; }).join('')
        + '</tbody></table></div></section>';
    } else if (step === 3) {
      const log = await api('GET', '/api/compliance-log');
      body = '<div class="grid grid-2">' + gateCard(d.gates[0], 'Journey policy') + gateCard(d.gates[1], 'Breach variant') + '</div>' + complianceLog(log);
    } else if (step === 4) {
      body = legend + recordView(d.records, 'pr16') + recordView(d.records, 'pr17');
    } else if (step === 5) {
      body = '<div class="grid grid-2"><section class="card">' + optoutForm(p, true) + '</section><section class="card"><h3>Suppression flag written</h3>' + suppressionFlag(p)
        + '<p class="small muted" style="margin-top:12px">The customer asked not to be auto-renewed. The opt-out is stored on the policy period and travels to the PR17 record (offset 124).</p></section></div>';
    } else if (step === 6) {
      body = '<section class="card"><h2>Renewal decision · ' + esc(p.ref) + '</h2>' + autoRenewStatus(d.decision.autoRenew, d.decision.blockedBy) + activitiesList(d.decision.activities)
        + '<p class="small muted">' + esc(d.decision.ps215.evaluated ? 'PS21/5 evaluated.' : d.decision.ps215.reason) + '</p></section>';
    } else {
      const pr17 = d.records.pr17 || '';
      const items = [
        ['Policy loaded', p.ref + ' with FeedStatus_Ext ' + p.fields.FeedStatus_Ext + ', policy year ' + p.fields.PolicyYear_Ext + ' (shopping-around prompt shown).'],
        ['Eligibility screen', 'Six suppression fields evaluated in contract order; the policy was eligible before the opt-out.'],
        ['PS21/5 gate', p.ref + ' renewal ' + money(p.fields.AnnualPremium_Ext) + ' ≤ NB ' + money(p.fields.EquivalentNBPremium_Ext) + ' passes; ' + d.breach.ref + ' ' + money(d.breach.actual) + ' > ' + money(d.breach.allowed) + ' raises ' + (d.breach.codes[0] || 'none') + '.'],
        ['PRINTV records', 'PR16 ' + (d.records.pr16 || '').length + ' bytes unchanged; PR17 ' + pr17.length + ' bytes with disclosure block 076–124.'],
        ['Opt-out captured', 'RenewalOptOut_Ext = ' + flagText(p.fields.RenewalOptOut_Ext) + '; PR17 opt-out flag (offset 124) = ' + (pr17[123] || '?') + '.'],
        ['Auto-renew blocked', d.decision.autoRenew + ' by ' + d.decision.blockedBy.join(', ') + ' → activity ' + (d.decision.activities[0] ? d.decision.activities[0].pattern : '—') + '.'],
      ];
      body = '<section class="card"><h2>What the journey showed</h2><ul class="summary-list">' + items.map((it, i) => '<li><span class="n">' + (i + 1) + '</span><div><strong>' + esc(it[0]) + '</strong><div class="muted small">' + esc(it[1]) + '</div></div></li>').join('') + '</ul></section>'
        + autoRenewStatus(d.decision.autoRenew, d.decision.blockedBy) + complianceLog(d.complianceLog);
    }
    const next = step < 7
      ? '<a class="btn btn-primary" data-testid="journey-next" href="/journey?step=' + (step + 1) + '">Next: ' + esc(STEPS[step]) + ' →</a>'
      : '<button class="btn btn-primary" type="button" data-testid="journey-next" id="journey-restart">Reset and restart journey</button>';
    const prev = step > 1 ? '<a class="btn btn-ghost" href="/journey?step=' + (step - 1) + '">← Back</a>' : '<span></span>';
    render(head('Guided journey · step ' + step + ' of 7', STEPS[step - 1], '', '<span class="chip mono">' + esc(JOURNEY_REF) + ' · breach variant ' + esc(BREACH_REF) + '</span>')
      + stepper + '<section data-testid="journey-step-' + step + '" aria-label="Step ' + step + ': ' + esc(STEPS[step - 1]) + '" class="stack">' + body + '</section>'
      + '<div class="journey-nav">' + prev + next + '</div>', 'Journey step ' + step);
    const restart = document.getElementById('journey-restart');
    if (restart) restart.addEventListener('click', async () => { await api('POST', '/api/reset'); await loadPolicies(); go('/journey?step=1'); });
  }

  // ----------------------------------------------------------------------------------------------- router
  async function route() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    let m;
    try {
      await loadPolicies();
      if (path === '/') await homeScreen();
      else if ((m = path.match(/^\/invite\/([^/]+)$/))) await inviteScreen(decodeURIComponent(m[1]));
      else if ((m = path.match(/^\/optout\/([^/]+)$/))) await optoutScreen(decodeURIComponent(m[1]));
      else if ((m = path.match(/^\/ps215\/([^/]+)$/))) await ps215Screen(decodeURIComponent(m[1]));
      else if ((m = path.match(/^\/records\/([^/]+)$/))) await recordsScreen(decodeURIComponent(m[1]));
      else if (path === '/admin/eligibility') await adminScreen();
      else if (path === '/journey') await journeyScreen();
      else notFound(path, 'Unknown screen.');
      main.setAttribute('data-ready', 'true');
    } catch (e) {
      render('<div class="callout callout-bad" role="alert"><span class="icon">!</span><div><strong>Something went wrong</strong><p>' + esc(e.message) + '</p></div></div>');
    }
  }

  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href]');
    if (!a || a.target || ev.metaKey || ev.ctrlKey || ev.shiftKey || a.origin !== location.origin || a.pathname.startsWith('/ws/') || a.pathname.startsWith('/api/')) return;
    ev.preventDefault();
    main.removeAttribute('data-ready');
    go(a.pathname + a.search);
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });
  window.addEventListener('popstate', route);
  document.getElementById('reset-demo').addEventListener('click', async () => {
    await api('POST', '/api/reset');
    toast('Demo reset to seed state');
    main.removeAttribute('data-ready');
    route();
  });
  route();
}());

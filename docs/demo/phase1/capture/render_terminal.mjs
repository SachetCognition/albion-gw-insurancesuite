// Renders an asciinema v2 cast (or a title card) to a 1280x720 WebM with Playwright and the asciinema-player
// bundle from node_modules (no network). A caption header sits above the terminal.
//   node render_terminal.mjs cast <file.cast> <out.webm> <caption> <detail>
//   node render_terminal.mjs card <out.webm> <title> <detail> [seconds]
// Writes <out.webm>.trim with the number of seconds of blank lead-in to cut.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, renameSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const playerCss = readFileSync(require.resolve('asciinema-player/dist/bundle/asciinema-player.css'), 'utf8');
const playerJs = readFileSync(require.resolve('asciinema-player/dist/bundle/asciinema-player.min.js'), 'utf8');
const SIZE = { width: 1280, height: 720 };
const SPEED = Number(process.env.CAST_SPEED || '1');
const HOLD_MS = Number(process.env.CAST_HOLD_MS || '3000');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const BADGE = 'Synthetic data &middot; offline run &middot; not production results';
const STYLE = `
  html,body{margin:0;height:100%;background:#0b1526;color:#e8eef8;font-family:'DejaVu Sans',sans-serif;overflow:hidden}
  header{height:96px;box-sizing:border-box;padding:16px 32px;background:#12223d;border-bottom:3px solid #f5b301}
  header h1{margin:0;font-size:26px;font-weight:700} header p{margin:6px 0 0;font-size:16px;color:#b9c7dd}
  .badge{position:absolute;top:18px;right:28px;font-size:12px;color:#f5d27a;border:1px solid #f5d27a;border-radius:4px;padding:3px 8px}
  #term{position:absolute;top:112px;left:24px;right:24px;bottom:16px}
  .card{display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 96px;box-sizing:border-box}
  .card h1{font-size:44px;margin:0 0 18px} .card p{font-size:22px;color:#b9c7dd;margin:6px 0;white-space:pre-line}
  .card .rule{width:120px;height:5px;background:#f5b301;margin:0 0 28px}
  .card .foot{margin-top:40px;font-size:16px;color:#f5d27a}`;

async function record(out, build) {
  mkdirSync(path.dirname(out), { recursive: true });
  const videoDir = mkdtempSync(path.join(tmpdir(), 'phase1-term-'));
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: videoDir, size: SIZE } });
  const t0 = Date.now();
  const page = await context.newPage();
  try {
    await build(page, () => writeFileSync(`${out}.trim`, ((Date.now() - t0) / 1000).toFixed(2)));
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    if (video) renameSync(await video.path(), out);
    rmSync(videoDir, { recursive: true, force: true });
  }
}

async function renderCast(castFile, out, caption, detail) {
  const cast = readFileSync(castFile, 'utf8');
  const header = JSON.parse(cast.split('\n', 1)[0]);
  if (header.version !== 2) throw new Error(`${castFile}: expected an asciinema v2 cast`);
  await record(out, async (page, ready) => {
    await page.setContent(`<!doctype html><html><head><style>${playerCss}</style><style>${STYLE}</style></head><body>
      <header><h1>${esc(caption)}</h1><p>${esc(detail)}</p><span class="badge">${BADGE}</span></header>
      <div id="term"></div></body></html>`);
    await page.addScriptTag({ content: playerJs });
    await page.evaluate(({ data, speed }) => new Promise((resolve) => {
      const player = window.AsciinemaPlayer.create({ data }, document.getElementById('term'), {
        autoPlay: true, controls: false, fit: 'both', speed, idleTimeLimit: 2, theme: 'monokai',
        terminalFontFamily: "'DejaVu Sans Mono', monospace",
      });
      window.__player = player;
      player.addEventListener('ended', () => { window.__ended = true; });
      resolve();
    }), { data: cast, speed: SPEED });
    ready();
    const duration = await page.evaluate(() => window.__player.getDuration());
    await page.waitForFunction(() => window.__ended === true, null, {
      timeout: Math.max(30000, ((duration || 60) / SPEED) * 1000 * 2), polling: 200,
    });
    await page.waitForTimeout(HOLD_MS);
  });
}

async function renderCard(out, title, detail, seconds) {
  await record(out, async (page, ready) => {
    await page.setContent(`<!doctype html><html><head><style>${STYLE}</style></head><body><div class="card">
      <div class="rule"></div><h1>${esc(title)}</h1><p>${esc(detail)}</p><p class="foot">${BADGE}</p></div></body></html>`);
    await page.waitForTimeout(300);
    ready();
    await page.waitForTimeout(seconds * 1000);
  });
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'cast' && args.length === 4) await renderCast(...args);
else if (mode === 'card' && args.length >= 3) await renderCard(args[0], args[1], args[2], Number(args[3] || 4));
else {
  console.error('usage: render_terminal.mjs cast <file.cast> <out.webm> <caption> <detail>\n'
    + '       render_terminal.mjs card <out.webm> <title> <detail> [seconds]');
  process.exit(2);
}

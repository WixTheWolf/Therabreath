// Exports the presentation (/host) to two PDFs, from the running site, exactly as the room will see it:
//   <out>-Deck.pdf            every scene at its last build, one 16:9 page each (the offline fallback)
//   <out>-Presenter-Deck.pdf  landscape Letter for the team: a cover with the run of show, then every scene with its
//                             number, time, objective and talking points
// It uses a fresh browser profile, so the concept cards, marks and Now, Next, Later are blank. Nothing is written to the
// live session.
// Usage: node scripts/export-show.mjs <baseUrl> <password> <outPrefix>
// Needs Playwright (npm i -g playwright, or set NODE_PATH to a folder that has it).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = await import('playwright').catch(() => createRequire(import.meta.url)('playwright'));

const [base, password, out] = process.argv.slice(2);
if (!base || !password || !out) { console.error('Usage: node scripts/export-show.mjs <baseUrl> <password> <outPrefix>'); process.exit(1); }

const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(base) ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
const login = await ctx.request.post(`${base}/api/login`, { data: { password } });
if (!login.ok()) throw new Error('login failed: ' + login.status());

const page = await ctx.newPage();
// ?still=1 shows THE FLAVOR RACE as its poster instead of playing it.
await page.goto(`${base}/host?still=1`, { waitUntil: 'load' });
await page.waitForFunction(() => Array.isArray(window.__show), null, { timeout: 30000 });
await page.waitForTimeout(2500);
const scenes = await page.evaluate(() => window.__show);
const run = await page.evaluate(() => window.__run);
const shots = [];
for (let i = 0; i < scenes.length; i++) {
  await page.evaluate((h) => { location.hash = h; }, `#${i + 1}.99`);
  // Let the scene fade in and its builds land; the gap's glasses take longest to fill.
  await page.waitForTimeout(scenes[i].id === 'gap' ? 6500 : 3200);
  shots.push(await page.screenshot({ type: 'jpeg', quality: 90 }));
  console.log('scene', i + 1, 'of', scenes.length, scenes[i].id);
}

const img = (b) => `data:image/jpeg;base64,${b.toString('base64')}`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Geist:wght@400;500&family=Geist+Mono:wght@500&display=block" rel="stylesheet">';

// The deck: one 16:9 page per scene.
const deck = `<!doctype html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0}img{display:block;width:1920px;height:1080px;page-break-after:always}</style></head><body>${shots.map((b) => `<img src="${img(b)}">`).join('')}</body></html>`;
const d = await ctx.newPage();
await d.setContent(deck, { waitUntil: 'load' });
writeFileSync(`${out}-Deck.pdf`, await d.pdf({ width: '1920px', height: '1080px', printBackground: true }));

// The presenter edition.
const blockOf = (id) => run.find((b) => b.id === id);
const range = (id) => { const ix = scenes.map((s, j) => (s.block === id ? j + 1 : 0)).filter(Boolean); return ix.length > 1 ? `${ix[0]} to ${ix[ix.length - 1]}` : `${ix[0] || ''}`; };
const told = scenes.some((s) => s.id === 'prework');
const css = `@page{size:11in 8.5in;margin:.4in}*{box-sizing:border-box}body{margin:0;font:400 10pt/1.45 Geist,Helvetica,Arial,sans-serif;color:#0B1B2B;background:#fff}
section{height:7.7in;page-break-after:always;display:flex;flex-direction:column;gap:.12in;overflow:hidden}
.k{font:500 8pt/1.4 'Geist Mono',Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#2E8FA8}
h1{font:300 46pt/1 Newsreader,Georgia,serif;letter-spacing:-.02em;margin:.1in 0 0}h1 em{font-style:italic;color:#2E8FA8}
.sub{font-size:11pt;max-width:8.6in;color:rgba(11,27,43,.75)}
table{border-collapse:collapse;width:100%;margin-top:.1in}th,td{text-align:left;padding:6px 10px 6px 0;border-bottom:1px solid rgba(11,27,43,.12);vertical-align:top}th{font:500 7.5pt 'Geist Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:rgba(11,27,43,.5)}td.t{font:500 9pt 'Geist Mono',monospace;white-space:nowrap;color:#2E8FA8}
.foot{margin-top:auto;font:500 7.5pt 'Geist Mono',monospace;color:rgba(11,27,43,.45)}
header{display:flex;gap:.25in;align-items:baseline;border-bottom:1px solid #0B1B2B;padding-bottom:4px}header b{font:400 13pt Newsreader,Georgia,serif;margin-right:auto}header span{font:500 8pt 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:rgba(11,27,43,.6)}
.slide{height:5.6in;width:auto;align-self:flex-start;border-radius:4px;box-shadow:0 0 0 1px rgba(11,27,43,.12)}
ul{margin:0;padding-left:16px;columns:2;column-gap:.4in}li{margin:0 0 4px;break-inside:avoid}
.wait{flex:1;display:grid;place-items:center;border:1px dashed rgba(11,27,43,.3);border-radius:6px;padding:.5in;font:300 15pt/1.4 Newsreader,Georgia,serif;color:rgba(11,27,43,.7)}`;
const cover = `<section><p class="k">Presenter edition · ${esc(run[0].t)} to ${esc(run[run.length - 1].end)} · Monday, November 9, 2026 · Darwin room, Princeton</p>
<h1>The Future <em>of Freshness</em></h1>
<p class="sub">Every scene exactly as the room will see it on the TV, at its last build, with the time and the talking points. It is a discussion: each of Ross’s four objectives opens in his words and closes on questions for the room; what the room decides is marked or typed in live and becomes the Playbook at the end. ${scenes.length} scenes${told ? '' : ', plus “You told us” once the pre-brief answers are in'}. The live presentation is at /host: right arrow or click to go on, F for full screen, N for the talking points.</p>
<table><thead><tr><th>Time</th><th>Part</th><th>Objective</th><th>Scenes</th></tr></thead><tbody>${run.map((b) => `<tr><td class="t">${esc(b.t)} to ${esc(b.end)}</td><td>${esc(b.title)}</td><td>${esc(b.obj || '')}</td><td>${range(b.id)}</td></tr>`).join('')}</tbody></table>
<p class="foot">Confidential. For The Flavor Factory team; not for distribution.</p></section>`;
const pages = scenes.map((s, j) => {
  const b = blockOf(s.block);
  const pg = `<section><header><b>${j + 1} / ${scenes.length} · ${esc(s.title)}</b>${b ? `<span>${esc(b.t)} to ${esc(b.end)}</span>` : ''}${b?.obj ? `<span>Objective ${esc(b.obj)}</span>` : ''}${s.builds ? `<span>${s.builds} build${s.builds > 1 ? 's' : ''}</span>` : ''}</header>
<img class="slide" src="${img(shots[j])}"><ul>${s.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
  const wait = !told && s.id === 'brief' ? `<section><header><b>After ${j + 1} · You told us</b></header><div class="wait">Appears here once the pre-brief answers are in (Ross sends the pre-brief on November 3): the consumer the room most wants to win, the moment TheraBreath is missing, and the flavors they would never approve, without names. Every scene after it is numbered one higher.</div><ul><li>The pre-brief homework: the consumer the room most wants to win, and the moment TheraBreath is missing.</li><li>Have some fun with the vetoes. No names on screen.</li></ul></section>` : '';
  return pg + wait;
}).join('');
const p = await ctx.newPage();
await p.setContent(`<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${css}</style></head><body>${cover}${pages}</body></html>`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
writeFileSync(`${out}-Presenter-Deck.pdf`, await p.pdf({ width: '11in', height: '8.5in', printBackground: true }));
console.log(`${shots.length} scenes to ${out}-Deck.pdf and ${out}-Presenter-Deck.pdf`);
await browser.close();

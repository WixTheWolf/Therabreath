// Exports the presentation (/host) to two PDFs, from the running site, exactly as it will look on the TV:
//   <out>-Deck.pdf            every slide at its last build, one 16:9 page each (the offline fallback); the slides that
//                             change as they build (PAGES below) get a page for each state
//   <out>-Presenter-Deck.pdf  landscape Letter for the team: a cover with the run of show, then every slide with its
//                             number, time, objective and talking points
// ?still=1 never writes to the session, so this is safe against the live site; the votes, concept cards and the plan
// show whatever the session holds (blank before November 9).
// Usage: node scripts/export-show.mjs <baseUrl> <signIn> <outPrefix>, where <signIn> is the team link's path (/t/KEY)
// or the host password: the presentation only opens for the team.
// Needs Playwright (npm i -g playwright, or set NODE_PATH to a folder that has it).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = await import('playwright').catch(() => createRequire(import.meta.url)('playwright'));

const [base, password, out] = process.argv.slice(2);
if (!base || !password || !out) { console.error('Usage: node scripts/export-show.mjs <baseUrl> </t/KEY or host password> <outPrefix>'); process.exit(1); }

const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(base) ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
const login = password.startsWith('/t/') ? await ctx.request.get(base + password, { maxRedirects: 0 }) : await ctx.request.post(`${base}/api/login`, { data: { password } });
if (!(await ctx.cookies()).some((c) => c.name === 'pb_host')) throw new Error('sign-in did not open the presentation: ' + login.status());

const page = await ctx.newPage();
// ?still=1 shows THE FLAVOR RACE as its poster instead of playing it.
await page.goto(`${base}/host?still=1`, { waitUntil: 'load' });
await page.waitForFunction(() => Array.isArray(window.__show), null, { timeout: 30000 });
await page.waitForTimeout(2500);
const scenes = await page.evaluate(() => window.__show);
const run = await page.evaluate(() => window.__run);
// The slides whose builds replace each other rather than add up: one page per state, so the PDF shows all of them. The
// tasting gets its blind state (coded A to D, no names) before the reveal, so the backup can run the tasting blind.
const PAGES = { gap: [0, 3], signals: [0, 1], school: [0, 1, 2], map: [0, 1, 2, 3, 4], tasting: [0, 2], playbook: [0, 7] };
const caps = scenes.flatMap((s) => (PAGES[s.id] || [99]).map((b, k) => ({ s, b, k, of: (PAGES[s.id] || [99]).length })));
const shots = [];
for (let i = 0; i < caps.length; i++) {
  const sc = caps[i].s;
  await page.evaluate((h) => { location.hash = h; }, `#${sc.at}.${caps[i].b}`);
  // Let the scene fade in and its builds land. The gap's glasses take longest to fill, and a site from before November 2
  // only shows their percentages once the 3D starts (8 s at the latest), so wait past that.
  await page.waitForTimeout(sc.id === 'gap' && caps[i].b > 0 ? 9000 : 3200);
  // A busy machine can fall behind that timer (the slide after the gap came out half faded), so also wait until every
  // fade and build has finished. Looping motion, like the bobbing dots, never finishes and is left out.
  const settled = await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().endTime === Infinity), null, { timeout: 10000, polling: 200 }).then(() => true, () => false);
  if (!settled) console.log('  still moving after 10 s, captured anyway');
  shots.push(await page.screenshot({ type: 'jpeg', quality: 90 }));
  console.log('page', i + 1, 'of', caps.length, sc.id, caps[i].b === 99 ? 'last build' : 'build ' + caps[i].b);
}

const img = (b) => `data:image/jpeg;base64,${b.toString('base64')}`;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=Geist:wght@400;500&family=Geist+Mono:wght@500&display=block" rel="stylesheet">';

// The deck: one 16:9 page per slide (or per state).
// Each page carries a small label in its bottom corner, below the chapter bar: the slide's number and title as the
// presenter view's Go to list has them, and which state it is when a slide has more than one page.
const slides = Math.max(...scenes.map((s) => s.at));
const label = (c) => `${c.s.at} / ${slides} · ${esc(c.s.title)}${c.of > 1 ? ` · ${c.k + 1} of ${c.of}` : ''}`;
const deck = `<!doctype html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0}.pg{position:relative;width:1920px;height:1080px;page-break-after:always}img{display:block;width:1920px;height:1080px}.lab{position:absolute;right:24px;bottom:12px;font:500 15px/1 Menlo,monospace;letter-spacing:.06em;color:#F0EEE9;background:rgba(11,27,43,.62);padding:6px 11px;border-radius:99px}</style></head><body>${shots.map((b, j) => `<div class="pg"><img src="${img(b)}"><span class="lab">${label(caps[j])}</span></div>`).join('')}</body></html>`;
const d = await ctx.newPage();
await d.setContent(deck, { waitUntil: 'load' });
writeFileSync(`${out}-Deck.pdf`, await d.pdf({ width: '1920px', height: '1080px', printBackground: true }));

// The presenter edition.
const blockOf = (id) => run.find((b) => b.id === id);
// Scene numbers are the presentation's own (the presenter view's Go to list), so they never shift when a scene is skipped.
const total = Math.max(...scenes.map((s) => s.at));
const range = (id) => { const ix = scenes.filter((s) => s.block === id).map((s) => s.at); return ix.length > 1 ? `${ix[0]} to ${ix[ix.length - 1]}` : `${ix[0] || ''}`; };
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
<p class="sub">Every slide as it’ll look on the TV, with its time and talking points; the slides that change as they build show each state. The morning is a conversation, not a talk: the first slide of each part carries its objective, and most slides end on a question for the room. Phones vote three times (the trends, the tasting and the chips), and everything we decide is tapped in, not typed, and becomes the Playbook at the end. ${scenes.length} slides${told ? '' : ', plus “Your pre-brief answers” once the answers are in'}. The live presentation is at /host, opened from the team link. Use the right arrow or click to go on, ] to jump to the next part, S to skip the optional builds, F for full screen and N for the talking points.</p>
<table><thead><tr><th>Time</th><th>Part</th><th>Objective</th><th>Slides</th></tr></thead><tbody>${run.map((b) => `<tr><td class="t">${esc(b.t)} to ${esc(b.end)}</td><td>${esc(b.title)}</td><td>${esc(b.obj || '')}</td><td>${range(b.id)}</td></tr>`).join('')}</tbody></table>
<p class="foot">Confidential. For The Flavor Factory team; not for distribution.</p></section>`;
const pages = caps.map(({ s, b: bn, k, of }, j) => {
  const b = blockOf(s.block);
  const state = of > 1 ? `<span>Build ${bn} · page ${k + 1} of ${of}</span>` : '';
  const opt = s.skip?.length ? `<span>Optional build${s.skip.length > 1 ? 's' : ''} ${s.skip.join(' and ')}</span>` : '';
  const pg = `<section><header><b>${s.at} / ${total} · ${esc(s.title)}</b>${b ? `<span>${esc(b.t)} to ${esc(b.end)}</span>` : ''}${b?.obj ? `<span>Objective ${esc(b.obj)}</span>` : ''}${s.builds ? `<span>${s.builds} build${s.builds > 1 ? 's' : ''}</span>` : ''}${k === 0 ? opt : ''}${state}</header>
<img class="slide" src="${img(shots[j])}">${k === 0 ? `<ul>${s.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</section>`;
  if (k > 0) return pg;
  const wait = !told && s.id === 'brief' ? `<section><header><b>${s.at + 1} / ${total} · Your pre-brief answers</b></header><div class="wait">This slide shows up once at least one pre-brief answer is in (the pre-brief went out on November 3). It opens on who they think TheraBreath’s next flavor should be for, then the moment TheraBreath is missing with their own taste in freshness, then what would feel off-brand, all without names. Until then the presentation goes straight from ${s.at} to ${s.at + 2}.</div><ul><li>These are their pre-brief answers: who they think TheraBreath’s next flavor should be for, and the moment TheraBreath is missing. Say how many answers there are. It’s a starting point for the conversation, not consumer research.</li><li>A tie is a tie: tied answers light up together. Explore the off-brand answers rather than treating them as a veto list. There are no names on screen.</li></ul></section>` : '';
  return pg + wait;
}).join('');
const p = await ctx.newPage();
await p.setContent(`<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${css}</style></head><body>${cover}${pages}</body></html>`, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// A page whose talking points run past the bottom gets a slightly smaller slide picture first, then slightly smaller
// notes, so no note is ever cut off. Anything that still doesn't fit is reported.
const fit = await p.evaluate(() => {
  document.body.style.width = '10.2in'; // measure at the printed width (11in less the margins), not the window's
  const out = [];
  for (const sec of document.querySelectorAll('section')) {
    const img = sec.querySelector('img.slide'), ul = sec.querySelector('ul'); if (!img || !ul) continue;
    let h = 5.6, f = 10;
    // The notes sit in two columns, so too much text spills into a hidden third column as well as down the page.
    const over = () => sec.scrollHeight > sec.clientHeight + 1 || ul.scrollWidth > ul.clientWidth + 1;
    while (over() && (h > 4.4 || f > 8.5)) {
      if (h > 4.4) { h = Math.round((h - 0.1) * 10) / 10; img.style.height = h + 'in'; } else { f -= 0.25; ul.style.fontSize = f + 'pt'; }
    }
    const t = sec.querySelector('header b')?.textContent || '';
    if (h < 5.6 || f < 10) out.push(`${t}: slide ${h}in, notes ${f}pt`);
    // Still too long: the last notes move to a page of their own right after, under the same header.
    if (over()) {
      const cont = document.createElement('section'); const hd = sec.querySelector('header').cloneNode(true);
      hd.querySelector('b').textContent = t + ', notes continued'; const ul2 = document.createElement('ul'); ul2.style.fontSize = f + 'pt';
      cont.append(hd, ul2); sec.after(cont);
      while (over() && ul.children.length > 1) ul2.prepend(ul.lastElementChild);
      out.push(`${t}: ${ul2.children.length} notes on a continuation page`);
      if (over()) out.push(`${t}: STILL OVERFLOWS`);
    }
  }
  return out;
});
fit.forEach((x) => console.log('fit', x));
writeFileSync(`${out}-Presenter-Deck.pdf`, await p.pdf({ width: '11in', height: '8.5in', printBackground: true }));
console.log(`${scenes.length} slides, ${shots.length} pages to ${out}-Deck.pdf and ${out}-Presenter-Deck.pdf`);
await browser.close();

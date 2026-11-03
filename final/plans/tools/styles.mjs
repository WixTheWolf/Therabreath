#!/usr/bin/env node
// Proves a refactor moved nothing: records the computed styles of every element (and its ::before and ::after) on
// every page, every presentation slide, and a phone and the presenter window on every slide, then compares two
// recordings. Used by plans 003 (Route A), 004, 005 and 006, which change how values are written, not what they
// resolve to.
// Local servers only: it joins a phone and drives the REHEARSE session, so it refuses anything but localhost.
//
//   node plans/tools/styles.mjs record http://localhost:3000 /tmp/styles-before.json
//   (apply the plan, rebuild, restart the server)
//   node plans/tools/styles.mjs record http://localhost:3000 /tmp/styles-after.json
//   node plans/tools/styles.mjs compare /tmp/styles-before.json /tmp/styles-after.json
//
// Start the server with STORE=memory and PLAYBOOK_HOST_PASSWORD set; pass the same value as TEAM_PW (default
// host-test). Restart the server between recordings so both start from an empty session. A recording takes about
// 10 minutes. Needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`).
// Why computed styles and not screenshots: the presentation's light is a full-screen WebGL canvas that never renders
// the same frame twice, so pixels differ on every run; computed values do not.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

// require() rather than import, so a global Playwright on NODE_PATH works as well as a local one.
const { chromium } = createRequire(import.meta.url)('playwright');

const [mode, a, b] = process.argv.slice(2);
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
const LIMIT = Number(process.env.LIMIT || 0); // record only the first N slides (for a quick trial run)
const PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'outline-color', 'outline-style', 'box-shadow', 'text-shadow', 'fill', 'stroke', 'text-decoration-color', 'caret-color', 'opacity', 'transform', 'filter',
  'backdrop-filter', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'border-radius', 'padding', 'margin',
  'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'animation-name', 'animation-duration'];

// Runs in the page: wait for fades and builds to finish, park looping animations on their first frame, then read
// every element's computed values, keyed by its path from <body>.
async function snapshot(page) {
  await page.waitForFunction(() => document.getAnimations().every((x) => x.playState !== 'running' || x.effect?.getComputedTiming().endTime === Infinity), null, { timeout: 10000, polling: 250 }).catch(() => {});
  return page.evaluate((props) => {
    // Loops stop on their first frame; anything slower than the wait (the 30 s slow push on the photos) jumps to its end.
    document.getAnimations().forEach((x) => { if (x.effect?.getComputedTiming().endTime === Infinity) { x.pause(); x.currentTime = 0; } else if (x.playState === 'running') x.finish(); });
    const out = {};
    const key = (el) => {
      const parts = [];
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const same = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [e];
        parts.unshift(e.tagName.toLowerCase() + [...e.classList].map((c) => '.' + c).join('') + (same.length > 1 ? `:nth-of-type(${same.indexOf(e) + 1})` : ''));
      }
      return parts.join(' > ') || 'body';
    };
    const read = (cs) => Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    for (const el of [document.body, ...document.body.querySelectorAll('*')]) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue; // QR codes and icons: thousands of identical paths
      const k = key(el);
      out[k] = read(getComputedStyle(el));
      for (const pseudo of ['::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (cs.content && cs.content !== 'none' && cs.content !== 'normal') out[k + pseudo] = read(cs);
      }
    }
    return out;
  }, PROPS);
}

async function record(base, file) {
  if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base || '')) throw new Error('record needs a local base URL, for example http://localhost:3000');
  const br = await chromium.launch({ proxy });
  const pages = {};
  const open = async (ctx, url) => { const pg = await ctx.newPage(); await pg.goto(url, { waitUntil: 'load', timeout: 90000 }); await pg.waitForTimeout(1500); return pg; };
  const doc = async (ctx, url, name) => { const pg = await open(ctx, url); pages[name] = await snapshot(pg); await pg.close(); console.log('recorded', name); };

  const anon = await br.newContext({ viewport: { width: 1440, height: 900 } });
  await doc(anon, base + '/login', 'login');

  const team = await br.newContext({ viewport: { width: 1440, height: 900 } });
  const pw = process.env.TEAM_PW || 'host-test';
  const r = await team.request.post(base + '/api/login', { data: { password: pw, host: false } });
  if (!r.ok()) throw new Error(`team sign-in failed: start the server with PLAYBOOK_HOST_PASSWORD=${pw} or set TEAM_PW`);
  const tp = await open(team, base + '/team');
  const brief = await tp.getAttribute('a[href^="/survey/"]', 'href');
  await tp.close();
  for (const [name, path] of [['team', '/team'], ['front', '/'], ['run', '/host/run'], ['scorecard', '/scorecard'], ['writeup', '/host/writeup?code=REHEARSE'], ['prebrief', brief]]) {
    await doc(team, base + path, name);
  }

  // The presentation in export mode (never writes to the session), slide by slide at its last build, moved by the
  // address hash as scripts/export-show.mjs does.
  const stage = await br.newContext({ viewport: { width: 1920, height: 1080 }, storageState: await team.storageState() });
  const sp = await open(stage, `${base}/host?code=REHEARSE&still=1`);
  await sp.waitForFunction(() => Array.isArray(window.__show), null, { timeout: 60000 });
  let scenes = await sp.evaluate(() => window.__show);
  if (LIMIT) scenes = scenes.slice(0, LIMIT);
  for (let i = 0; i < scenes.length; i++) {
    await sp.evaluate((h) => { location.hash = h; }, `#${scenes[i].at}.99`);
    await sp.waitForTimeout(scenes[i].id === 'gap' ? 9000 : 3200);
    const name = `stage-${String(i + 1).padStart(2, '0')}-${scenes[i].id}`;
    pages[name] = await snapshot(sp); console.log('recorded', name);
  }
  await sp.close();

  // A phone in the rehearsal session, following the live presentation scene by scene.
  const ev = await (await team.request.get(base + '/api/s/REHEARSE/events')).json();
  const k = String(ev.topic || '').replace(/^pb-/, '');
  const phone = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const ph = await open(phone, `${base}/j/REHEARSE?k=${k}`);
  await ph.fill('input[aria-label="Your first name"]', 'Tester');
  await ph.click('button.rm-btn');
  const host = await open(stage, `${base}/host?code=REHEARSE`);
  await host.waitForFunction(() => Array.isArray(window.__show), null, { timeout: 60000 });
  // The presenter window follows the presentation over a BroadcastChannel, so it opens in the same browser.
  const pres = await open(stage, `${base}/host/presenter?code=REHEARSE`);
  const moved = async (scene) => {
    for (let t = 0; t < 60; t++) {
      const j = await (await team.request.get(base + '/api/s/REHEARSE/events')).json();
      const g = j.events.filter((e) => e.kind === 'goto').pop();
      if (g && g.data && g.data.scene === scene) return;
      await host.waitForTimeout(500);
    }
    throw new Error(`the presentation never reached scene ${scene + 1}`);
  };
  for (let i = 0; i < scenes.length; i++) {
    await host.evaluate((h) => { location.hash = h; }, `#${scenes[i].at}`);
    // Wait until the move is in the session, then give the phone (it polls every 1.1 s) time to follow and fade.
    await moved(scenes[i].at - 1);
    await ph.waitForTimeout(3500);
    const name = `${String(i + 1).padStart(2, '0')}-${scenes[i].id}`;
    pages['phone-' + name] = await snapshot(ph);
    pages['presenter-' + name] = await snapshot(pres); console.log('recorded phone and presenter', name);
  }
  await br.close();
  writeFileSync(file, JSON.stringify(pages));
  const n = Object.values(pages).reduce((s, p) => s + Object.keys(p).length, 0);
  console.log(`\nrecorded ${Object.keys(pages).length} pages, ${n} elements, into ${file}`);
}

function compare(fa, fb) {
  const A = JSON.parse(readFileSync(fa, 'utf8')), B = JSON.parse(readFileSync(fb, 'utf8'));
  let changed = 0;
  for (const page of Object.keys(A)) {
    if (!B[page]) { console.log(`MISSING PAGE  ${page}`); changed++; continue; }
    const lines = [];
    for (const el of new Set([...Object.keys(A[page]), ...Object.keys(B[page])])) {
      const x = A[page][el], y = B[page][el];
      if (!x || !y) { lines.push(`  ${x ? 'gone' : 'new '}  ${el}`); continue; }
      for (const p of Object.keys(x)) if (x[p] !== y[p]) lines.push(`  ${el}\n      ${p}: ${x[p]}  ->  ${y[p]}`);
    }
    if (!lines.length) { console.log(`same     ${page}`); continue; }
    changed++;
    console.log(`CHANGED  ${page}  (${lines.length})`); console.log(lines.slice(0, 40).join('\n')); if (lines.length > 40) console.log(`  ... ${lines.length - 40} more`);
  }
  console.log(changed ? `\n${changed} page(s) differ. Every difference is listed above.` : '\nAll pages identical.');
  process.exit(changed ? 1 : 0);
}

if (mode === 'record') await record(a, b);
else if (mode === 'compare') compare(a, b);
else { console.error('usage: styles.mjs record <local base url> <out.json> | compare <before.json> <after.json>'); process.exit(2); }

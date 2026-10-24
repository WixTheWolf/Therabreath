// Exports the Stage as a 16:9 PDF: one page per scene, each at its final build step.
// Run it on a clean code for the offline fallback deck, or on the live code after the session for the
// leave-behind with the room's results. It moves the Stage, so never run it on a session that is in progress.
// Usage: node scripts/export-deck.mjs <baseUrl> <code> <password> <out.pdf> [chromiumPath]
// Needs Playwright (npm i -g playwright, or set NODE_PATH to a folder that has it).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
// ES modules ignore NODE_PATH; a CommonJS require honors it, so a global Playwright install also works.
const { chromium } = await import('playwright').catch(() => createRequire(import.meta.url)('playwright'));

const [base, code, password, out, exe] = process.argv.slice(2);
if (!base || !code || !password || !out) { console.error('Usage: node scripts/export-deck.mjs <baseUrl> <code> <password> <out.pdf> [chromiumPath]'); process.exit(1); }

const browser = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const login = await ctx.request.post(`${base}/api/login`, { data: { password } });
if (!login.ok()) throw new Error('login failed: ' + login.status());
let n = 0;
const goto = async (scene) => {
  const r = await ctx.request.post(`${base}/api/s/${code}/events`, { data: { events: [{ id: `deck-${Date.now()}-${n++}`, kind: 'goto', data: { scene, step: 99 }, t: Date.now() }] } });
  if (!r.ok()) throw new Error('goto failed: ' + r.status());
};

const page = await ctx.newPage();
await page.goto(`${base}/stage/${code}`, { waitUntil: 'load' });
await page.waitForTimeout(3000);
// The Console header reads "<act> · <scene> of <last>", which gives the number of scenes in the run of show.
const con = await ctx.newPage();
await con.goto(`${base}/console/${code}`, { waitUntil: 'load' });
await con.locator('.cx-now .k').waitFor({ timeout: 30000 });
const last = Number(((await con.locator('.cx-now .k').innerText()).match(/(\d+) of (\d+)/i) || [])[2]);
if (!last) throw new Error('could not read the scene count from the Console');
await con.close();
const shots = [];
for (let i = 0; i <= last; i++) {
  await goto(i);
  await page.waitForTimeout(1500);
  await goto(i);
  // Wait for the scene to finish fading in (slow machines and software rendering can take several seconds), then let the builds land.
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.stage-scene') || document.body).opacity === '1', null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);
  shots.push(await page.screenshot({ type: 'jpeg', quality: 88 }));
  console.log('scene', i, 'of', last);
}

const html = `<!doctype html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0}img{display:block;width:1920px;height:1080px;page-break-after:always}</style></head><body>${shots.map((b) => `<img src="data:image/jpeg;base64,${b.toString('base64')}">`).join('')}</body></html>`;
const doc = await ctx.newPage();
await doc.setContent(html, { waitUntil: 'load' });
writeFileSync(out, await doc.pdf({ width: '1920px', height: '1080px', printBackground: true }));
console.log(`${shots.length} pages to ${out}`);
await browser.close();

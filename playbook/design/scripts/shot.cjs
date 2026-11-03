// usage: node shot.cjs <url> <out.png> [width height]
const { chromium } = require('playwright-core');
(async () => {
  const [url, out, w = 1920, h = 1080] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const logs = []; p.on('console', m => logs.push(m.text())); p.on('pageerror', e => logs.push('ERR ' + e.message));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 500 });
  const done = await p.evaluate(() => window.__done);
  await p.screenshot({ path: out });
  console.log(JSON.stringify(done), logs.join(' | '));
  await b.close();
})();

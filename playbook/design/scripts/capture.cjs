// usage: node capture.cjs <url> <outDir> <frames>
// Steps window.renderFrame(i) and screenshots each frame as a numbered JPEG.
const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const [url, dir, n = 210] = process.argv.slice(2);
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const done = await p.evaluate(() => window.__done);
  if (done.err) { console.log(done.err); process.exit(1); }
  const t0 = Date.now();
  for (let i = 0; i < +n; i++) {
    await p.evaluate((k) => window.renderFrame(k), i);
    await p.screenshot({ path: `${dir}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 94 });
    if (i % 30 === 0) console.log('frame', i, Math.round((Date.now() - t0) / 1000) + 's');
  }
  await b.close();
})();

// usage: node pack.cjs <url> <out.pdf> [previewDir]
// Prints the discovery pack to a 16:9 PDF, and optionally screenshots each page as a preview JPEG.
const { chromium } = require('playwright-core');
(async () => {
  const [url, out, prev] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__done, null, { timeout: 60000 });
  await p.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
  if (prev) {
    const pages = await p.$$('.page');
    for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: `${prev}/p${String(i + 1).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 });
    console.log('pages', pages.length);
  }
  if (out && out !== '-') {
    await p.emulateMedia({ media: 'print' });
    await p.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
    console.log('pdf', out);
  }
  await b.close();
})();

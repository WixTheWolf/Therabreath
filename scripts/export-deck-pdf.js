#!/usr/bin/env node
/*
 * Export the workshop deck (deck/index.html) to a PDF, one 1920 × 1080
 * slide per page, for presenting offline or sending as a leave-behind.
 *
 *   npm i --no-save playwright-core     # any recent version
 *   CHROME_PATH=/path/to/chrome node scripts/export-deck-pdf.js
 *
 * Writes dist/TheraBreath_Flavor_Playbook_Deck.pdf. The deck is served from a
 * small local web server (the 3D models can't load from file://), rendered in
 * print mode, and each 3D slide is captured as an image before printing.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright-core");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".glb": "model/gltf-binary", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf" };

(async () => {
  const root = path.resolve(__dirname, "..");
  const out = path.join(root, "dist", "TheraBreath_Flavor_Playbook_Deck.pdf");
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
    const file = path.join(root, rel || "index.html");
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", ...(process.env.EXTRA_CHROME_ARGS || "").split(" ").filter(Boolean)]
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://127.0.0.1:${port}/deck/index.html?print`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 240000 });
  await page.waitForTimeout(600);
  await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  server.close();
  console.log("Wrote " + path.relative(root, out));
})().catch(e => { console.error(e); process.exit(1); });

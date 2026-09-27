#!/usr/bin/env node
/*
 * Export the workshop deck (deck/index.html) to a PDF, one 1920 × 1080
 * slide per page, for presenting offline or sending as a leave-behind.
 *
 *   npm i --no-save playwright-core     # any recent version
 *   CHROME_PATH=/path/to/chrome node scripts/export-deck-pdf.js
 *
 * Writes dist/TheraBreath_Flavor_Playbook_Deck.pdf. Needs network access for
 * the Google Fonts the deck uses.
 */
const path = require("path");
const { chromium } = require("playwright-core");

(async () => {
  const root = path.resolve(__dirname, "..");
  const out = path.join(root, "dist", "TheraBreath_Flavor_Playbook_Deck.pdf");
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--allow-file-access-from-files", ...(process.env.EXTRA_CHROME_ARGS || "").split(" ").filter(Boolean)]
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto("file://" + path.join(root, "deck", "index.html") + "?print", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.pdf({ path: out, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log("Wrote " + path.relative(root, out));
})().catch(e => { console.error(e); process.exit(1); });

// Stills from the V5 film for review, from one bundle: node scripts/fof5_stills.mjs <brief|site> <outdir> <t1> <t2> ...
// Times are film seconds; each still is written as <outdir>/<ending>_<t>.jpg. Uses public_v5 like the renders.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [ending, outDir, ...times] = process.argv.slice(2);
const id = ending === "site" ? "FutureOfFreshnessV5Site" : "FutureOfFreshnessV5Brief";
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index5.ts"), publicDir: path.resolve("public_v5") });
const composition = await selectComposition({ serveUrl, id });
for (const s of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 30));
  const output = path.join(outDir, `${ending}_${Number(s).toFixed(2)}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85 });
  console.log(output);
}

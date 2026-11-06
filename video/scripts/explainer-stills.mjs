// Renders a handful of frames of the team explainer in one bundle, for checking layouts without a full render.
// usage: node scripts/explainer-stills.mjs OUT_DIR FRAME...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/indexExplainer.ts") });
const composition = await selectComposition({ serveUrl, id: "MorningExplainer", browserExecutable: process.env.CHROME || null });
for (const f of frames.map(Number)) {
  await renderStill({ serveUrl, composition, frame: f, output: path.join(out, `f${String(f).padStart(4, "0")}.png`), browserExecutable: process.env.CHROME || null });
  console.log("frame", f);
}
console.log("frames in all:", composition.durationInFrames);

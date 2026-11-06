// Renders a handful of frames of the team explainer in one bundle, for checking layouts without a full render.
// usage: [PUBLIC_DIR=dir] node scripts/explainer-stills.mjs OUT_DIR FRAME...
// PUBLIC_DIR points the bundle at a folder holding only what the explainer uses (fonts, explainer/, fof4/audio/music_b.mp3):
// the full public folder is gigabytes of race footage, and every bundle copies it. The bundle is deleted afterwards.
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/indexExplainer.ts"), publicDir: process.env.PUBLIC_DIR ? path.resolve(process.env.PUBLIC_DIR) : undefined });
const composition = await selectComposition({ serveUrl, id: "MorningExplainer", browserExecutable: process.env.CHROME || null });
for (const f of frames.map(Number)) {
  await renderStill({ serveUrl, composition, frame: f, output: path.join(out, `f${String(f).padStart(4, "0")}.png`), browserExecutable: process.env.CHROME || null });
  console.log("frame", f);
}
console.log("frames in all:", composition.durationInFrames);
fs.rmSync(serveUrl, { recursive: true, force: true });

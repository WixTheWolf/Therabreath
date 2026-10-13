// Seedance 2.5 text-to-video through the official Higgsfield SDK (server-side only).
// Credentials: HF_CREDENTIALS="key-id:key-secret", loaded at runtime from video/.env.local (Git-ignored) or from the
// environment. The value is never printed or logged.
// usage (from video/): npx tsx higgsfield/index.ts
import path from "node:path";
import dotenv from "dotenv";
import { config, higgsfield } from "@higgsfield/client/v2";

dotenv.config({ path: path.resolve(__dirname, "..", ".env.local"), quiet: true });

const MODEL = "bytedance/seedance-2.5/text-to-video";

async function main(): Promise<number> {
  if (!process.env.HF_CREDENTIALS) {
    console.error("HF_CREDENTIALS is not set. Add it to video/.env.local as HF_CREDENTIALS=key-id:key-secret.");
    return 2;
  }
  // The key in the cloud environment authenticates on platform.higgsfield.ai (api.higgsfield.ai answers 401 for it).
  config({ credentials: process.env.HF_CREDENTIALS, baseURL: process.env.HF_BASE ?? "https://platform.higgsfield.ai" });

  let result;
  try {
    result = await higgsfield.subscribe(MODEL, {
      input: {
        prompt: "A cinematic scene at sunset",
        duration: 5,
        resolution: "720p",
        aspect_ratio: "16:9",
      },
      withPolling: true,
    });
  } catch (err) {
    // SDK errors (authentication, credits, validation, timeout) carry no credential values
    const e = err as { name?: string; message?: string };
    console.error(`Request failed: ${e.name ?? "Error"}: ${e.message ?? String(err)}`);
    return 1;
  }

  const status = String(result.status);
  console.log(`request ${result.request_id}: ${status}`);
  if (status === "completed" && result.video?.url) {
    console.log(`video: ${result.video.url}`);
    return 0;
  }
  if (status === "nsfw") console.error("The request was blocked by content moderation; no video was produced.");
  else if (status === "failed") console.error("The generation failed; no video was produced.");
  else if (status === "canceled" || status === "cancelled") console.error("The request was canceled; no video was produced.");
  else console.error(`Finished without a video (status: ${status}).`);
  return 1;
}

main().then((code) => process.exit(code));

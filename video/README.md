# Pre-read reel

A 32-second cinematic cut (1920 × 1080, 30 fps) for the TheraBreath pre-read page, built with [Remotion](https://remotion.dev).

- **Scenes** (`src/scenes/`), every one starting on a bar of the music:
  1. **Open** (0–3 s): one drop in extreme macro; "What does fresh taste like next?"
  2. **Ask** (3–7 s): what TheraBreath asked for, in Ross’s words, then the four objectives on the beat.
  3. **Trends** (7–13 s): twelve trends, one per beat, each tagged with its lens and stage.
  4. **Worlds** (13–19 s): six flavor worlds pour in over each other while the bottle refills.
  5. **Wildcards** (19–25 s): nine wildcards stamped like a passport, with origin and trend.
  6. **Playbook** (25–29 s): Trends + Territories + Concepts + Pipeline = The Flavor Playbook, its six chapters and the 30/60/90 plan.
  7. **End** (29–32 s): "See you on November 9."
- **Footage**: twelve unbranded Higgsfield clips (Seedance 2.5, 1080p, no audio), listed in `scripts/clips.json`. `node scripts/fetch-clips.mjs` downloads them into `public/clips/` and records which are present in `src/clips.ts`. The clip files are git-ignored. Sage, Watermelon and Cedar have no clip yet, and any shot without one falls back to the matching animated canvas world, so the reel always renders.
- **Shared data**: flavors, wildcards, trends, objectives, the playbook chapters, the bottle and the animated worlds all come from `../assets/playbook-core.js`, the same file the site and deck use.
- **Finish**: letterbox, vignette and moving film grain (`Grade` in `src/scenes/Shot.tsx`).
- **Sound**: original music (120 BPM) and sound effects synthesized from scratch in `scripts/make-audio.mjs`, so there are no third-party samples or licences. Build from 27 s, final hit on 29 s.

```bash
npm i
NODE_USE_ENV_PROXY=1 node scripts/fetch-clips.mjs   # pull the Higgsfield footage (the env var makes Node use HTTPS_PROXY)
node scripts/make-audio.mjs                 # regenerate public/audio/*.wav
npx remotion studio                         # preview
npx remotion render PreReadReel out/reel.mp4 --crf=20
npx remotion render PreReadReel out/reel.webm --codec=vp9 --crf=30
npx remotion still PreReadReel out/poster.jpg --frame=470 --image-format=jpeg
```

The rendered files the pre-read uses live in `../brief/media/`.

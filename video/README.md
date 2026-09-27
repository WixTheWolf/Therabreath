# Pre-read reel

A 15-second motion piece (1920 × 1080, 30 fps) for the TheraBreath pre-read page, built with [Remotion](https://remotion.dev).

- **Scenes** (`src/scenes/`): Drop → Fresh can feel… → Bottle refills through six flavors → Flavor mosaic ("Tasted blind.") → Taste / Choose / Assign → "See you on November 9."
- **Shared data**: flavors, the bottle drawing and the generative flavor art come from `../assets/playbook-core.js`, the same file the site and deck use.
- **Sound**: original music (120 BPM) and sound effects synthesized from scratch in `scripts/make-audio.mjs`, so no third-party samples or licences are involved. Every cut lands on the beat grid (one beat = 15 frames).

```bash
npm i
node scripts/make-audio.mjs                 # regenerate public/audio/*.wav
npx remotion studio                         # preview
npx remotion render PreReadReel out/reel.mp4
npx remotion render PreReadReel out/reel.webm --codec=vp9
```

The rendered files the pre-read uses live in `../brief/media/`.

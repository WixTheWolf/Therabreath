# The Flavor Playbook: discovery and style frames

Step 1 of the brief (Section 0): restate the experience, list every open question, and propose two visual directions as style frames. Nothing in the Playbook app gets built until a direction is approved.

This folder is confidential and is excluded from the existing public deployments by the root `.vercelignore`.

## What is here

- `pack/`: the discovery pack. 30 pages at 16:9, printed to `out/The-Flavor-Playbook-Discovery.pdf`.
  - Restatement, run of show, architecture, stack confirmation, the concept, both directions, the hybrid recommendation, motion tests, open questions and next steps.
- `frames/`: the style frame system.
  - `index.html?f=<scene>&d=<a|b>&s=<scale>` renders one 1920 x 1080 frame.
  - Scenes: `arrival`, `gap`, `map`, `cool`, `terr`, `room`, `pb`.
  - `d=a` is Direction A, Laboratory Light. `d=b` is Direction B, After Hours.
  - `light.js` is the WebGL2 light engine:
    - the clear drop with its light shaft, spectral cone and caustic
    - the two glasses for The Gap, with analytic glass and liquid refraction
    - the dichroic spectrum in the empty space
  - `motion.html?m=<arrival|gap>&d=<a|b>` steps a motion test frame by frame.
- `img/`: brand logos from the existing repo, plus generated look-target photography (Higgsfield, GPT Image 2.5).
- `fonts/`: Fraunces, Geist and Geist Mono (SIL OFL), self-hosted.
- `out/`: rendered frames, motion tests and the pack PDF.
- `scripts/`:
  - `shot.cjs`: screenshot one frame
  - `capture.cjs`: capture a motion test
  - `pack.cjs`: print the pack
  - `qr.cjs`: build the join QR code
  - `check-dashes.mjs`: the em and en dash gate from the brief

## Re-render

```
cd playbook/design
python3 -m http.server 8777 &
npm i playwright-core qrcode   # in any folder on NODE_PATH
node scripts/shot.cjs "http://127.0.0.1:8777/frames/index.html?f=gap&d=a&s=2" out/frame-gap-a.png
node scripts/pack.cjs "http://127.0.0.1:8777/pack/index.html" out/The-Flavor-Playbook-Discovery.pdf
node scripts/check-dashes.mjs
```

## Notes

- Positions on the Intensity x Character map are The Flavor Factory's perspective, labeled as illustrative.
- The cooling curves are also illustrative, and wording goes to Alex for confirmation.
- Inner Playbook pages show rehearsal data.
- The TheraBreath orange is a placeholder until it is sampled from official assets.
- The join QR code points to a placeholder URL.

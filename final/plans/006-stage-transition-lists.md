# 006 Presentation reveals: name the properties they animate

**Blocking status:** none. Not `REQUIRES-APPROVAL`, not `TOUCHES-DS`.

**When:** after November 9. The reveals look right today; this removes a latent hazard (any future change to these elements, such as a size or a font, would animate too). Do not do it in the week of the event: it touches rehearsed slides.

Provenance: detector rule G-4 (red, "transition applied to every property"), 5 of its 16 findings, confirmed by hand on the slides the live run shows. Of the other 11, 3 are the phone controls in `room.css` (plan 002) and 8 are on styles nothing in the live run renders: seven in `stage.css` (`.sd`, `.mol-q, .mol-a`, the vocabulary scene's `.vocab-glow`, `.vocab-mint`, `.vw`, `.vocab-line` and `.bd-spread`) and `.home-grid a` in `room.css`. Canon KR-13 and KR-16 (judgement, hard). Canon public-2026.10.11-1, bundled local copy (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## 1. Problem

`src/app/stage.css`, verbatim, with the slide each appears on (the number in `/host#N`, checked by rendering every scene at `921d71c`):

```css
/* :107, slide 7, the thesis */
.thesis > div { font: 300 118px/1.02 var(--serif); letter-spacing: -.03em; opacity: 0; transform: translateY(30px); filter: blur(10px); transition: all 1.4s var(--ease); }
/* :140, slide 10, the portfolio ("... of your ... flavors are mint") */
.pft { position: absolute; left: 0; top: 0; transition: all 1.2s var(--ease); max-width: 760px; }
/* :281, slide 24, the tasting (the sample names flip in) */
.hname span { font: 300 34px/1.1 var(--serif); opacity: 0; filter: blur(10px); transform: rotateX(90deg); transition: all 1s var(--ease); }
/* :563, slides 20 to 23, the four directions */
.terr-arc > div { width: 220px; padding: 16px 18px; border-radius: 18px; background: var(--panel); border: 1px solid var(--rule); display: flex; flex-direction: column; gap: 6px; transition: all .6s var(--ease); position: relative; overflow: hidden; }
/* :569, slides 20 to 23 */
.terr-compass { position: absolute; right: 90px; top: 120px; padding: 30px; border-radius: 30px; background: color-mix(in oklab, var(--bg) 70%, transparent); backdrop-filter: blur(16px); border: 1px solid var(--rule); transition: all 1s var(--ease); }
```

The states they serve (unchanged):

```css
.thesis > div.on { opacity: 1; transform: none; filter: none; }      /* :108 */
.thesis .tl1.on { color: var(--fg2); }                                /* :109 */
.pft.out { opacity: 0; transform: translateY(-30px); filter: blur(10px); }   /* :141 */
.hname.flip span { opacity: 1; filter: none; transform: none; }       /* :282 */
.terr-arc > div.on { background: var(--panel2); border-color: var(--c2); transform: translateY(-6px); box-shadow: 0 20px 40px -20px var(--c2); }  /* :564 */
.terr-compass.up { transform: translateY(-20px) scale(.82); transform-origin: top right; }  /* :570 */
```

No component sets an inline style on these elements that changes between builds (checked in `src/components/scenes/Opening.tsx:158`, `ActI.tsx:86` to `:87`, `Territories.tsx:102` to `:108` and `:135`, `show/ShowScenes.tsx:160`), so the property lists below are exactly what animates today.

## 2. Target

Each `transition: all` becomes a list of the properties its states change, with the same duration and curve.

## 3. Repo conventions

Elsewhere in the same file and in `show.css`, transitions already name their properties, for example `src/app/stage.css:651`:

```css
.territory:has(.terr-card.on) .terr-arc { opacity: 0; transform: translateY(-12px); transition: opacity .6s var(--ease), transform .6s var(--ease); }
```

## 4. Steps

In `src/app/stage.css`, replace only the `transition` declaration in each rule:

1. Line 107, `.thesis > div`: `transition: all 1.4s var(--ease);` becomes
   `transition: opacity 1.4s var(--ease), transform 1.4s var(--ease), filter 1.4s var(--ease), color 1.4s var(--ease);`
2. Line 140, `.pft`: `transition: all 1.2s var(--ease);` becomes
   `transition: opacity 1.2s var(--ease), transform 1.2s var(--ease), filter 1.2s var(--ease);`
3. Line 281, `.hname span`: `transition: all 1s var(--ease);` becomes
   `transition: opacity 1s var(--ease), transform 1s var(--ease), filter 1s var(--ease);`
4. Line 563, `.terr-arc > div`: `transition: all .6s var(--ease);` becomes
   `transition: background-color .6s var(--ease), border-color .6s var(--ease), transform .6s var(--ease), box-shadow .6s var(--ease);`
5. Line 569, `.terr-compass`: `transition: all 1s var(--ease);` becomes
   `transition: transform 1s var(--ease);`
6. `npm run build` in `final/`.

## 5. Scope bounds

- Only these five declarations. Leave the seven other `transition: all` rules in `stage.css` alone: they belong to scenes that are not in the run of show.
- Do not change durations, curves, states or any other declaration.

## 6. Verification

| Requirement | Evidence |
|---|---|
| End states identical | `node plans/tools/styles.mjs record` before and after (local server, rebuild and restart in between), then `compare`. The only differences allowed are `transition-property`, `transition-duration`, `transition-timing-function` and `transition-delay` on `.thesis > div` (slide 7), `.pft` (slide 10), `.terr-arc > div` and `.terr-compass` (slides 20 to 23) and `.hname span` (slide 24). Any other difference is a regression. |
| Motion identical | Local server, `/host?code=REHEARSE#6`, then the Right arrow through slide 7 and its build: the second line still rises, sharpens and fades in over 1.4 s, and the first line dims. Slide 10, Right: the first headline lifts, blurs and fades while the second arrives. Slides 20 to 23, Right: the compass shrinks to the top right; the arc cards light in turn. Slide 24, the build that reveals the names: each name flips in from 90 degrees with a blur. Compare against the same steps on production before the change, or record both with the browser's screen recorder. |
| Computed styles | DevTools on slide 7: `transition-property` on `.thesis > div` reads `opacity, transform, filter, color`. |
| Build | `npm run build` passes. |

The deck PDFs show end states only, so they need no re-export. Do not promote to production without the owner's approval.

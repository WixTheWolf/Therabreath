# 003 The gradient on the thesis line (owner decision)

**Blocking status:** `REQUIRES-APPROVAL`. Two legitimate routes; the owner picks one before Step 1. Route A also carries `TOUCHES-DS` (adds a token to `src/app/globals.css`).

**When:** either route can wait until after November 9. Route B changes a slide, so it also needs the deck PDFs re-exported.

Provenance: detector rule D-3 (orange, "text filled with a gradient") at `src/app/stage.css:110`, confirmed by hand; canon DEC-9 (judgement, hard, "decorative gradients and glow only from the design system"). Canon public-2026.10.11-1, bundled local copy (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## Decision required before Step 1

The thesis slide (scene `thesis`, `#7` in the presentation, second build) sets its punch line, "The next job is giving more people a reason to want it.", in a left-to-right gradient from glacier to white to peach to pink. Gradient-filled text is one of the most recognisable tells of generated interfaces; the canon allows it only when the gradient is a brand element fixed in the design system. Here it is a one-off instance value.

The owner asked for the Stage look to be restored (October 27), and this slide is part of it, so the look itself is a user decision. What is open is whether the gradient stays as a deliberate brand element or goes.

- **Route A, keep it as brand identity.** Move the gradient into the design system as one named token, `--spectrum` ("colour only ever comes from light", the line at the top of `globals.css`), and have the slide use the token. No visual change. The slide stays exactly as rehearsed; the gradient becomes a documented, reusable brand device instead of a stray value.
- **Route B, take it out.** Set the line in solid colour, italic, like the rest of the type system (`.it` plus `var(--accent)`). Removes the tell; the line still stands out from the first line, which is set in `var(--fg2)`. Changes a slide the team has rehearsed, and the deck PDFs must be re-exported.

Tradeoff: Route A costs nothing and changes nothing on screen; Route B is the cleaner design but changes a rehearsed slide six days before the event. Write the chosen route at the top of this file before executing.

## 1. Problem

`src/app/stage.css:110`, verbatim:

```css
.thesis .tl2 { background: linear-gradient(90deg, #BFE9F2, #fff 40%, #FFD9B0 70%, #F7B6D2); -webkit-background-clip: text; background-clip: text; color: transparent; }
```

Rendered by `src/components/scenes/Opening.tsx:160`:

```tsx
<div className={'tl2 it' + (step >= 1 ? ' on' : '')}>The next job is giving more people a reason to want it.</div>
```

## 2. Target

- Route A: `globals.css` defines `--spectrum: linear-gradient(90deg, #BFE9F2, #fff 40%, #FFD9B0 70%, #F7B6D2);` in `:root`, and `stage.css:110` uses `background: var(--spectrum);`. Pixel-identical slide.
- Route B: `stage.css:110` becomes `.thesis .tl2 { color: var(--accent); }`.

## 3. Repo conventions

Brand constants live in `:root` in `src/app/globals.css:7` to `:12` (palette, fonts, `--ease`). One token per line group, lowercase, hyphenated (`--teal-ink`, `--glacier-d`).

## 4. Steps

Route A:

1. In `src/app/globals.css`, inside the `:root { ... }` block (lines 7 to 12), after the line that defines `--ease` and `--ease-in`, add a new line:
   `  --spectrum: linear-gradient(90deg, #BFE9F2, #fff 40%, #FFD9B0 70%, #F7B6D2); /* the refracted-light gradient, used only on the thesis line */`
2. In `src/app/stage.css:110`, replace `background: linear-gradient(90deg, #BFE9F2, #fff 40%, #FFD9B0 70%, #F7B6D2);` with `background: var(--spectrum);`. Leave the clip and `color: transparent` declarations.
3. `npm run build`.

Route B:

1. In `src/app/stage.css:110`, replace the whole rule with `.thesis .tl2 { color: var(--accent); }`.
2. `npm run build`.
3. After the owner approves the production deploy, re-export the deck PDFs from production as the README's "PDFs" section describes (`node scripts/export-show.mjs https://<production-host> /t/<team key> public/files/The-Future-of-Freshness`), and commit them.

## 5. Scope bounds

- Only `.thesis .tl2`. Do not touch `.thesis .tl1`, the slide's layout, its copy or the other gradients on the stage (glows, orbs, photos), which are light effects, not text fills.
- Route A must not change any computed style.

## 6. Verification

| Requirement | Evidence |
|---|---|
| Route A identical | With a local server (`npm run build && STORE=memory PLAYBOOK_PASSWORD=room-test PLAYBOOK_HOST_PASSWORD=host-test npm start`), run `node plans/tools/styles.mjs record http://localhost:3000 /tmp/styles-before.json` before Step 1; after the steps, rebuild, restart the server and record `/tmp/styles-after.json`; `node plans/tools/styles.mjs compare /tmp/styles-before.json /tmp/styles-after.json` ends with "All pages identical." (the computed `background-image` of `.thesis .tl2` on slide 7 is the same gradient either way). Then look at `/host?code=REHEARSE#7.1` by eye: the line still shows the glacier to pink gradient. |
| Route B readable and on-brand | Same URL: the line is solid accent italic on the dark stage, contrast at least 3:1 against the background (large text); the first line still reads as the quieter of the two. |
| Deck PDFs (Route B only) | `The-Future-of-Freshness-Deck.pdf` and the presenter edition show the new line on the thesis page. |
| Build | `npm run build` passes. |

Do not promote to production without the owner's approval.

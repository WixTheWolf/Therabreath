# 004 Name the three working colours: amber, coral, green

**Blocking status:** `TOUCHES-DS` (adds three tokens to the palette in `src/app/globals.css`). Not `REQUIRES-APPROVAL`: the names follow the existing hue-named palette and nothing on screen changes.

**When:** after November 9. Pure maintenance; zero visual change.

Provenance: detector rule DS-2a (red, "hardcoded value in a file that already uses design tokens"), 32 of its findings, confirmed by hand; canon US-004 (judgement, hard, "fix systemic issues at the design-system source"). Canon public-2026.10.11-1, bundled local copy (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## 1. Problem

Three colours do real work across the presentation, the presenter window and the phones, but none of them is in the palette, so each file repeats the raw hex:

| Value | Uses | What it marks today (examples, `file:line`) |
|---|---|---|
| `#F4B860` amber | 15 | other people's star votes (`stage.css:146`), hot white-space cells (`stage.css:722`), the rehearsal banner (`show.css:219`), a stale presenter link (`show.css:345`), day bars (`show.css:305`) |
| `#F27A5E` coral | 11 | the timer when time is low (`stage.css:42`), an armed remove button (`show.css:164`), a bad network dot (`show.css:354`), the phone offline bar (`room.css:8`), the sign-in error (`room.css:105`) |
| `#5FD39A` green | 6 | the phone's online dot (`room.css:6`), the correct answer (`room.css:32`), a scored sample tab (`room.css:51`), a working presenter link (`show.css:344`) |

Counts by file at `921d71c`: amber in `stage.css` 4, `show.css` 7, `site.css` 3, `writeup.css` 1; coral in `stage.css` 1, `show.css` 6, `room.css` 4; green in `show.css` 1, `room.css` 5.

Example, `src/app/room.css:105`, verbatim:

```css
.gate-err { color: #F27A5E; font: 400 14px/1.4 var(--sans); }
```

The palette (`src/app/globals.css:8` and `:9`) has `--teal`, `--teal-ink`, `--glacier`, `--glacier-d` and `--orange`, but nothing for these three roles. The amber is used both as a warm highlight and as a warning, so the token is named for the hue, like the rest of the palette, not for one meaning.

## 2. Target

`globals.css` gains `--amber: #F4B860; --coral: #F27A5E; --green: #5FD39A;` and every exact use of those three values in the stylesheets reads `var(--amber)`, `var(--coral)` or `var(--green)`. Rendered colours are identical.

## 3. Repo conventions

Palette tokens are hue names in `:root`, defined on one line group in `src/app/globals.css:8` to `:9`:

```css
  --cloud: #F0EEE9; --paper: #F7F6F2; --ink: #0B1B2B; --glacier: #BFE9F2; --glacier-d: #6CC7DD; --teal: #2E8FA8; --teal-ink: #1F6C82;
  --orange: #F5821F; /* placeholder until sampled from official TheraBreath assets */
```

## 4. Steps

1. In `src/app/globals.css`, directly after line 9 (the `--orange` line), add this line inside `:root`:

```css
  --amber: #F4B860; --coral: #F27A5E; --green: #5FD39A; /* highlights and warnings, alerts, done and online */
```

2. From `final/src/app`, run exactly:

```sh
sed -i -E 's/#F4B860\b/var(--amber)/gI; s/#F27A5E\b/var(--coral)/gI; s/#5FD39A\b/var(--green)/gI' stage.css show.css room.css site.css writeup.css
```

   (GNU sed. On macOS use `gsed`, or `sed -i '' -E` with the same expressions minus the `I` flag after checking with step 3 that every value is written in one case.)
3. Check: `grep -ciE '#(F4B860|F27A5E|5FD39A)\b' stage.css show.css room.css site.css writeup.css` prints 0 for every file, and `grep -o 'var(--amber)\|var(--coral)\|var(--green)' stage.css show.css room.css site.css writeup.css | wc -l` prints 32.
4. `npm run build` in `final/`.

## 5. Scope bounds

- Do not edit `globals.css` beyond the one new line.
- Do not replace the nearby shades `#3FA77A` (4 uses) and `#E2A93B` (4 uses), or any other colour. Whether those become `--green-ink` and `--amber-ink` is a separate question for the owner; this plan does not answer it.
- Do not touch `.tsx` files (three components carry their own sample and chart colours as data).
- No other edits in the five stylesheets.

## 6. Verification

| Requirement | Evidence |
|---|---|
| Nothing on screen changes | Before step 1, with a local server running (`npm run build && STORE=memory PLAYBOOK_PASSWORD=room-test PLAYBOOK_HOST_PASSWORD=host-test npm start`), run `node plans/tools/styles.mjs record http://localhost:3000 /tmp/styles-before.json`. After the steps, rebuild, restart the server, and record `/tmp/styles-after.json` the same way. Then `node plans/tools/styles.mjs compare /tmp/styles-before.json /tmp/styles-after.json` must end with "All pages identical." It reads the computed colours, shadows, filters, type and transitions of every element on the sign-in, front door, team page, run sheet, scorecard, write-up, pre-brief, every presentation slide, and a phone and the presenter window on every slide. A `var()` that resolves to the same colour computes to the same value, so any difference it lists is a real change. |
| Tokens consumed, not copied | Step 3 counts. |
| Build | `npm run build` passes (includes the dash check). |

The PDFs do not need re-exporting: they render the same computed styles. Do not promote to production without the owner's approval.

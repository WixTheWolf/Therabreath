# 005 Use the palette tokens that already exist

**Blocking status:** none. Not `REQUIRES-APPROVAL`, not `TOUCHES-DS` (consumes existing tokens; `globals.css` is not edited).

**When:** after November 9. Pure maintenance; zero visual change. Run after plan 004 if both are done (either order works).

Provenance: detector rule DS-2a (red, "hardcoded value in a file that already uses design tokens"), 76 of its findings, confirmed by hand. The remaining DS-2a findings were discarded: the token definitions themselves in `globals.css`, colours with no token, spacing and sizes for which the system has no scale. Canon US-004 (judgement, hard). Canon public-2026.10.11-1, bundled local copy (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## 1. Problem

Six stylesheets write palette colours as raw hex even though `globals.css` defines them as tokens. If a palette value changes (the `--orange` line already says it is a placeholder until sampled from official TheraBreath assets), these copies will not follow.

| Hex | Token (`src/app/globals.css:8` to `:9`) | Uses |
|---|---|---|
| `#0B1B2B` | `--ink` | 37 (stage 6, show 4, room 3, site 6, writeup 7, simple 11) |
| `#F0EEE9` | `--cloud` | 15 (stage 1, show 4, room 4, site 2, writeup 4) |
| `#F7F6F2` | `--paper` | 5 (stage 3, show 1, site 1) |
| `#BFE9F2` | `--glacier` | 3 (stage 1, writeup 2) |
| `#6CC7DD` | `--glacier-d` | 1 (stage 1) |
| `#2E8FA8` | `--teal` | 3 (show 2, writeup 1) |
| `#1F6C82` | `--teal-ink` | 9 (show 2, site 1, writeup 1, simple 5) |
| `#F5821F` | `--orange` | 3 (stage 1, room 2) |

76 in all. Example, `src/app/room.css:139` to `:140`, verbatim:

```css
.bw-play { display: inline-flex; align-items: center; gap: 12px; padding: 12px 20px 12px 12px; border-radius: 99px; background: #F0EEE9; color: #0B1B2B; ...
.bw-play span { width: 30px; height: 30px; border-radius: 50%; background: #0B1B2B; position: relative; }
```

These tokens are constants in `:root`, the same in both themes, so `var(--ink)` always resolves to `#0B1B2B`. The theme tokens (`--bg`, `--fg`, `--accent`) are not touched: a raw `#8FE0F0` equals `--accent` only in the dark theme, so it stays.

## 2. Target

Every exact use of those eight values in the six stylesheets reads `var(--token)`. Rendered colours are identical.

## 3. Repo conventions

The constant palette tokens are already consumed this way elsewhere, for example `src/app/globals.css`: `::selection { background: var(--glacier); color: var(--ink); }`, and `src/app/room.css:56`: `.rm-scale button.on { background: var(--accent-ink); ... }`. Use `var(--name)` with no fallback, as the rest of the stylesheets do.

## 4. Steps

1. From `final/src/app`, run exactly:

```sh
sed -i -E 's/#0B1B2B\b/var(--ink)/gI; s/#F0EEE9\b/var(--cloud)/gI; s/#F7F6F2\b/var(--paper)/gI; s/#BFE9F2\b/var(--glacier)/gI; s/#6CC7DD\b/var(--glacier-d)/gI; s/#2E8FA8\b/var(--teal)/gI; s/#1F6C82\b/var(--teal-ink)/gI; s/#F5821F\b/var(--orange)/gI' stage.css show.css room.css site.css writeup.css simple.css
```

   (GNU sed. On macOS use `gsed`.) Do not include `globals.css`: it is where the tokens are defined.
2. Check: `grep -ciE '#(0B1B2B|F0EEE9|F7F6F2|BFE9F2|6CC7DD|2E8FA8|1F6C82|F5821F)\b' stage.css show.css room.css site.css writeup.css simple.css` prints 0 for every file. If plan 003 Route A ran first, `stage.css` had one fewer `#BFE9F2`; that is expected.
3. `npm run build` in `final/`.

## 5. Scope bounds

- Only the six stylesheets named, only these eight values.
- Leave `rgba(11,27,43,...)` and other alpha forms of the palette as they are.
- Leave `#fff`, `#000` and every colour without a token (see plan 004 for amber, coral and green).
- Do not touch `.tsx` files, including the QR code colours in `src/components/scenes/Opening.tsx` (the QR library needs literal values).

## 6. Verification

| Requirement | Evidence |
|---|---|
| Nothing on screen changes | Same as plan 004: `node plans/tools/styles.mjs record` before and after (rebuild and restart the local server in between), then `node plans/tools/styles.mjs compare /tmp/styles-before.json /tmp/styles-after.json` ends with "All pages identical." The run sheet (`simple.css`) and the write-up (`writeup.css`) are both in the recording. |
| Print still right | Print preview `/host/run` and `/host/writeup?code=REHEARSE` (Chrome, Save as PDF): colours unchanged; `var()` works in print. No `@page` block in these files contains a colour. |
| Tokens consumed | Step 2 prints 0 everywhere. |
| Build | `npm run build` passes. |

No PDF needs re-exporting. Do not promote to production without the owner's approval.

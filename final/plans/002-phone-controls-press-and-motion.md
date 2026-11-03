# 002 Phone controls: press feedback and explicit transitions

**Blocking status:** none. Not `REQUIRES-APPROVAL`, not `TOUCHES-DS` (uses the existing `--ease` token; changes only phone control rules).

**When:** before November 9 if there is a rehearsal slot to check it on a real phone; otherwise after. The phones work today; this makes taps feel answered.

Provenance: detector rule G-4 (red, "transition applied to every property") at `src/app/room.css:29`, `:39`, `:55`, confirmed by hand; canon KR-10 (judgement, hard, "press feedback scales to exactly 0.96") and KR-16 (judgement, hard, "duration follows the weight of the action"). Canon public-2026.10.11-1, bundled local copy (index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`), not verified through the canon helper. Detector unslop 1.0.3. Audited at commit `921d71c`.

## 1. Problem

The phone screen (`/j/[code]`, `src/components/RoomApp.tsx`, styles in `src/app/room.css`) is where people vote, score the four samples, place chips and dots. Current rules, verbatim:

```css
/* room.css:29 */ .rm-opt { display: flex; align-items: center; gap: 14px; text-align: left; padding: 16px 18px; border-radius: 16px; border: 1px solid var(--rule); background: var(--panel); font: 400 17px/1.3 var(--sans); transition: all .2s; }
/* room.css:39 */ .rm-chipsleft i { width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #F5821F); box-shadow: 0 4px 10px rgba(0,0,0,.2); transition: all .3s var(--ease); }
/* room.css:45 */ .rm-chip button { height: 44px; border-radius: 12px; border: 1px solid var(--rule); font-size: 22px; }
/* room.css:49 */ .rm-tabs button { padding: 14px 0; border-radius: 14px; border: 1px solid var(--rule); font: 300 28px/1 var(--serif); position: relative; }
/* room.css:55 */ .rm-scale button { padding: 14px 0; border-radius: 12px; border: 1px solid var(--rule); font: 400 18px/1 var(--sans); transition: all .15s; }
/* room.css:24 */ .rm-btn:active { transform: scale(.98); }
```

- `transition: all` on `.rm-opt`, `.rm-chipsleft i` and `.rm-scale button` animates every property that changes, today and after any future edit (a size, padding or font change would tween too); `.rm-opt` and `.rm-scale button` also use the browser's default `ease`, not the house curve `--ease`.
- Only `.rm-btn` has press feedback, at `scale(.98)`. The vote options (`.rm-opt`), the 1 to 5 score buttons (`.rm-scale button`), the sample tabs (`.rm-tabs button`) and the chip plus and minus buttons (`.rm-chip button`) give no press feedback until the selected state paints.

The state rules these transitions serve (unchanged by this plan):

```css
.rm-opt.on { border-color: var(--accent); background: var(--accent-soft); box-shadow: 0 0 0 2px var(--accent) inset; }
.rm-opt.right { border-color: #5FD39A; box-shadow: 0 0 0 2px #5FD39A inset; }
.rm-chipsleft i.used { opacity: .18; transform: scale(.7); }
.rm-tabs button.on { background: var(--fg); color: var(--bg); }
.rm-scale button.on { background: var(--accent-ink); border-color: var(--accent-ink); color: var(--bg); }
```

## 2. Target

Each control transitions only the properties its states change, on `var(--ease)`, and every tap control scales to exactly `0.96` while pressed.

## 3. Repo conventions

The existing button already lists its properties and has press feedback; follow it (`room.css:23` and `:24`):

```css
.rm-btn { ...; transition: opacity .2s, transform .1s; }
.rm-btn:active { transform: scale(.98); }
```

The house easing token is `--ease: cubic-bezier(.22, .8, .2, 1)` in `src/app/globals.css:11`. Do not add a new token.

## 4. Steps

All edits are in `src/app/room.css`. Replace only the `transition` declaration inside each rule; leave every other declaration as it is.

1. Line 24, `.rm-btn:active`: change `transform: scale(.98);` to `transform: scale(.96);`.
2. Line 29, `.rm-opt`: replace `transition: all .2s;` with
   `transition: border-color .2s var(--ease), background-color .2s var(--ease), box-shadow .2s var(--ease), transform .12s var(--ease);`
3. Line 39, `.rm-chipsleft i`: replace `transition: all .3s var(--ease);` with
   `transition: opacity .3s var(--ease), transform .3s var(--ease);`
4. Line 45, `.rm-chip button`: add before the closing brace
   `transition: transform .12s var(--ease);`
5. Line 49, `.rm-tabs button`: add before the closing brace
   `transition: background-color .15s var(--ease), color .15s var(--ease), transform .12s var(--ease);`
6. Line 55, `.rm-scale button`: replace `transition: all .15s;` with
   `transition: background-color .15s var(--ease), border-color .15s var(--ease), color .15s var(--ease), transform .12s var(--ease);`
7. Directly after line 56 (`.rm-scale button.on { ... }`), add one new rule:

```css
.rm-opt:active, .rm-scale button:active, .rm-tabs button:active, .rm-chip button:not(:disabled):active { transform: scale(.96); }
```

8. Run `npm run build` in `final/`.

## 5. Scope bounds

- Only `src/app/room.css`, only the seven lines named above plus the one new rule.
- Do not touch `.home-grid a` (line 88): no component renders it.
- Do not change colours, sizes, padding, radii or the `#5FD39A` and `#F5821F` values (plans 004 and 005 cover colours).
- Do not touch the pre-brief (`.bw-*`), the stage (`stage.css`, `show.css`) or the front door (`site.css`).

## 6. Verification

| Requirement | Evidence |
|---|---|
| Press feedback on every tap control | Local server (`npm run build && STORE=memory PLAYBOOK_PASSWORD=room-test PLAYBOOK_HOST_PASSWORD=host-test npm start`), open `/host?code=REHEARSE` on the laptop and the join link on a phone or Chrome device mode (iPhone 14, 390 px). On the trends vote, the tasting and the chips and dots slides, press and hold each control type: it shrinks to 96% and springs back on release. In DevTools, `:active` forced on `.rm-scale button` computes `transform: matrix(0.96, 0, 0, 0.96, 0, 0)`. |
| Selected states unchanged | Tap a score: the button fills with the accent ink exactly as before; tap a trend: the accent ring appears as before; spend a chip: the dot fades to 18% and shrinks as before. |
| No property animates that should not | DevTools computed `transition-property` on `.rm-opt` lists exactly `border-color, background-color, box-shadow, transform`. When the presentation moves between a light and a dark scene, the phone still fades between themes as before (that fade lives on `.room`, `room.css:2`, and is not touched). |
| Disabled chip buttons do not move | A disabled plus button (no chips left) does not shrink when pressed. |
| Real phone | iOS Safari and Android Chrome on the Vercel preview: the press is visible under a thumb. |
| Build | `npm run build` passes (includes the dash check). |

Uncovered: the pre-brief and the front door, which this plan does not touch. Deploy to a preview; do not promote to production without the owner's approval.

# unslop audit of `final/`, November 3

An audit of the Future of Freshness site for the tells of generated or careless UI: the front door, sign-in, pre-brief, team page, run sheet, scorecard, write-up, the presentation at `/host`, the presenter window and the phones. The audit changed no source code; these plans are the output. Each plan is self-contained and can be executed by a model or a person with no other context.

## Decisions for the owner (blocking)

| Plan | Decision |
|---|---|
| [003](003-thesis-gradient-text.md) | Keep the gradient on the thesis line as a named brand token (no visual change), or set the line in solid accent italic (removes a recognisable AI tell; changes a rehearsed slide and needs the deck PDFs re-exported). |

## Execution order and status

Design-system plans go before the plans that consume them. Plans 001 and 002 are the only ones worth doing before November 9; the rest are maintenance for after the event.

| # | Plan | Flags | When | Status | Commit |
|---|---|---|---|---|---|
| 001 | [Sign-in survives a dropped connection](001-signin-network-failure.md) | none | before Nov 9 | open | |
| 002 | [Phone controls: press feedback and explicit transitions](002-phone-controls-press-and-motion.md) | none | before Nov 9, if there is a rehearsal slot to check it on a phone | open | |
| 003 | [The gradient on the thesis line](003-thesis-gradient-text.md) | `REQUIRES-APPROVAL`; Route A also `TOUCHES-DS` | after Nov 9 | waiting on owner | |
| 004 | [Name the three working colours: amber, coral, green](004-palette-amber-coral-green.md) | `TOUCHES-DS` | after Nov 9 | open | |
| 005 | [Use the palette tokens that already exist](005-use-existing-palette-tokens.md) | none | after Nov 9 | open | |
| 006 | [Presentation reveals: name the properties they animate](006-stage-transition-lists.md) | none | after Nov 9 | open | |

`TOUCHES-DS` only records that the change belongs in `src/app/globals.css`; it does not block. Every plan ends on a Vercel preview; none goes to production without the owner's approval.

`tools/styles.mjs` records the computed colours, shadows, filters, type and transitions of every element on every page, every presentation slide, and a phone and the presenter window on every slide, from a local server, and compares two recordings. Plans 003 (Route A), 004, 005 and 006 use it to prove nothing on screen moved. It compares computed values rather than screenshots because the presentation's light is a full-screen WebGL canvas that never renders the same frame twice. Status on November 3: it records every page and every presentation slide, but the phone pass stops with "never reached scene 1"; fix that before relying on it for the phone surfaces in plans 004 to 006.

## Provenance and coverage

- **Canon:** public-2026.10.11-1, read from the copy bundled with the unslop plugin (49 rules; index checksum `9d6713e5b595a8aedf6dce9c51a020e3bd77d471d9723a8b3b8ca6ca7589cf68`). The unslop MCP server was not connected in this session (the plugin was installed mid-session) and the canon helper's dependencies were not installed, so the canon was **not fetched or verified through the helper**. Canon rules are cited as judgement. **No pass is issued for this run.**
- **Detector:** unslop 1.0.3, `node scripts/detect.mjs src --json`, on commit `921d71c`. No detector bindings exist for this canon snapshot, so detector results are reported as detector findings, not as canon checks.
- **For a verified run next time:** start a new Claude Code session (the plugin connects `https://oleg.design/unslop/mcp` at session start), allow the one-time install of the canon helper's dependencies when the skill asks, and run `unslop` again.

## What was found

The detector reported 490 findings across 19 rules. 40 were in two tools nothing links to any more (the old Console and the old Playbook page: `ConsoleApp`, `ConsolePanel`, `PlaybookDoc`, `console.css`, `playbook.css`, and the old `/stage` app), leaving 450 on live pages. Each was checked by hand against the code; 138 survived into the six plans above, together with one judgement finding (press feedback on the phones).

| Rule | Live findings | Kept | Plan | Why the rest were dropped |
|---|---|---|---|---|
| B-6a no error state | 4 | 1 | 001 | The team panel retries every 15 seconds; the film transcript already falls back to none. |
| G-4 `transition: all` | 16 | 8 | 002, 006 | 8 are on styles no live page renders. |
| D-3 gradient text | 1 | 1 | 003 | |
| DS-2a hardcoded value | 187 | 108 | 004, 005 | 3 are the token definitions themselves; the rest are colours with no token, or spacing and sizes for which the system has no scale, so there is nothing to bypass. Moving them into new one-use variables would not be a fix. |
| J-9 focus ring removed | 8 | 0 | | Every one of these inputs has its own `:focus` style (a border and a ring on the phones, pre-brief and sign-in; a border on the presenter-only fields). |
| B-8a click on a `div` | 9 | 0 | | Modal backdrops (Escape and a Close button also close them) and the presentation surface, which has a full keyboard map (arrows, Space, K, R, F, N, B, P). |
| B-1 raw hex in code | 8 | 0 | | Sample and chart colours held as content data, the QR code library's literal colours, the write-up's print header. |
| G-1 `ease-in` | 1 | 0 | | `--ease-in` is defined in `globals.css` and used nowhere; no motion eases in. |
| G-5 long durations, G-6 animating size | 111, 14 | 0 | | Presentation choreography on a fixed 1920 x 1080 canvas, and the cinematic entrances on the front door and pre-brief the owner asked to restore. Interface feedback on the phones runs at 100 to 200 ms. Bars that grow on the TV are a handful of elements. |
| J-5 small text | 30 | 0 | | Print documents in points (run sheet, scorecard, write-up, the pre-brief's print rules) and uppercase labels at 12 to 13 px. Body text on the phones is 16 to 17 px. |
| J-3a tight padding | 9 | 0 | | Underline-style inputs on the stage and print table cells. |
| E-8 ad-hoc shadow, E-3 border plus shadow, E-5 large radius | 29, 5, 47 | 0 | | The glows and glass panels are the house light effects on a presentation canvas; the few true layers (film player, notes panel, sticky button) are one each, so a shadow scale would add names with a single consumer. |
| C-6 tight tracking, J-7 loose tracking | 2, 5 | 0 | | Negative tracking only at display sizes (168 px and up), where it is optical correction; wide tracking only on uppercase labels, never running text. |
| J-6 heading levels jump | 1 | 0 | | The arrival slide, a presentation canvas nobody navigates by headings. |
| J-10 no type scale | 3 | confirmed, not planned | | The phone and stage stylesheets pick sizes per block. A type scale is a design decision that touches every surface; worth doing after the event, not in an audit plan. |

## Checked against the canon and found clean

- Touch targets on the phones (KR-3): score buttons 46 px, sample tabs 56 px, chip buttons 44 px.
- Optical centring of the play icon in the pre-brief's film button (KR-4).
- Balanced headlines and pretty paragraphs everywhere (KR-7), set once in `globals.css`.
- No service notes or placeholder text on live pages (US-009, XP-33). The only `[CONFIRM]` is in the unlinked Playbook page.
- No fabricated proof (DEC-5): the household figures cite Church & Dwight's Q3 2026 earnings call (updated November 3, after the audit).
- Tabular figures only in time columns and score cells, which are tabular data (TY-1).

## Noted, not filed

- **Monospace labels and kickers (KR-19, DEC-7).** The canon treats monospace labels and a kicker above headings as generated-UI defaults. Here they are the house label style of the Stage look, which the owner asked to restore on October 27, applied as one system (`.k` in `globals.css`). Recorded so the owner knows the canon disagrees; no plan.
- **Font smoothing (KR-8, soft).** `-webkit-font-smoothing: antialiased` is set once on the root for every face. Right for the dark stage; small text on the light pages renders slightly thinner. Low value; no plan.

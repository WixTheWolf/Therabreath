# The Flavor Factory × TheraBreath Capabilities Workshop Booklet

This repository contains a generated, print-ready 18-page US Letter portrait PDF booklet for **The Flavor Factory × Church & Dwight / TheraBreath Capabilities Workshop | July 2026**.

## Deliverable

- `dist/therabreath_capabilities_workshop_booklet.pdf` — final 18-page vector PDF booklet.

## Design System

- Page size: US Letter portrait, 8.5 × 11 inches.
- Palette: TheraBreath blue `#00A3E0`, mint green `#7ED321`, dark navy body text, and white/pale backgrounds.
- Typography intent: Montserrat-style bold headings and Open-Sans-style clean sans body text, implemented with dependency-free PDF core sans-serif fonts for reliable generation in restricted environments.
- Production details: consistent page numbers, thin blue/mint footer rule, confidential footer text, molecule/water-droplet accents, concept-card pages, scoring table, and QR-code placeholder.

## Regenerate

```bash
python3 build_booklet.py
```

The command writes the PDF to `dist/therabreath_capabilities_workshop_booklet.pdf`.

## Pre-read (send before the meeting)

- `brief/index.html` is the briefing page to send the TheraBreath team ahead of the November 9 session (10:00 AM – 12:00 PM ET, Darwin, lunch provided): the four objectives from Ross Conroy's invite, the 10:00–12:00 agenda, the four platforms, a first look at the six flavor directions (each with a who and a when), how to prepare for the tasting, four questions to think about, and the draft flavor playbook we will leave with. It includes a live countdown to the day and prints cleanly to PDF.
- Share the deployed URL ending in `/brief/`. It does not link to the workshop site or deck, so nothing from the session is given away early.

## Pre-read reel

`video/` is a Remotion project for the 15-second reel at the top of the pre-read (original synthesized music and sound effects, cuts on the beat). Rendered MP4 and WebM plus the poster are in `brief/media/`. See `video/README.md`.

## Concept names (working names, not trademark-screened)

Status is internal only: none of the pieces show lead/contender to TheraBreath, so the room isn't steered. Names are hidden in the pre-read and revealed after the blind tasting.

| Product name | Flavor | Status |
|---|---|---|
| Polar Light | Arctic Yuzu | Current lead |
| Glasshouse | Green Tea Cucumber | Current lead |
| Limelight | Ginger Lime | Current lead |
| Pink Hour | Grapefruit Rose Mint | Contender |
| Green Orchard | Pear Cardamom Mint | Contender |
| Lights Out | Chamomile Vanilla Mint | Open exploration |

Wildcards: Forest Bath (Hinoki Spearmint), Sun Shower (Watermelon Shiso), Salt Air (Makrut Lime & Sea Salt). Names live in `assets/playbook-core.js` and update the site, deck and pre-read together.

## Session brief and order

Aligned to Ross Conroy's invite (Sep 24, 2026): Monday, November 9, 2026, 10:00 AM – 12:00 PM ET, room Darwin, lunch provided. The objective is to define a flavor playbook for near-term product innovation and long-term franchise growth, through four objectives: **trends** (flavor, sensory, consumer), **territories** (new flavor territories and sensory experiences), **concepts** (new usage occasions, new consumer segments, portfolio expansion) and a **pipeline** (platforms, flavor directions and white space across the franchise).

Agenda: 10:00 Welcome → 10:10 Trends → 10:30 Territories → 10:50 Taste (blind) → 11:20 Create (small groups) → 11:40 Playbook (three checks, pipeline, owners) → 12:00 lunch. Session details, objectives, agenda, horizons and each concept's who/when live in `assets/playbook-core.js` (`SESSION`, `OBJECTIVES`, `AGENDA`, `HORIZONS`, `CREATE`) and feed the site, deck and pre-read. Taste blind before the reveal; don't open the reveal early.

## Still to add (marked in red dashed boxes on the pages)

- The Flavor Factory logo file (header lockups still use typed text)
- Team photo, plus names and roles of who is attending
- Flavorist sign-off on every formulation note in `assets/playbook-core.js`
- Decision on whether to show working names at all

## Workshop deck

- `deck/index.html` is the 27-slide presentation for the session (1920 × 1080, scales to any screen). It follows the four objectives: Welcome → Trends → Territories → Taste → Create → Playbook, with a slide for each of the six concepts (with who and when), a blind scorecard, a Create canvas, a decision board, the near-term → long-term pipeline and the draft playbook to fill in live.
- Keys: ← → / space to move, **G** slide overview, **N** speaker notes, **P** presenter view (current + next slide, notes and a timer, synced with the main window), **F** full screen, **B** blank screen. Slide numbers deep-link (`deck/#17`).
- `dist/TheraBreath_Flavor_Playbook_Deck.pdf` is the PDF export for offline presenting or sending after the session. Regenerate it with `node scripts/export-deck-pdf.js` (needs `playwright-core` and a local Chrome; see the script header).
- Fonts are self-hosted in `assets/fonts/` so the pages render the same offline or on a locked-down network.
- Concept copy, regions, frameworks, the bottle drawing and the concept artwork live in `assets/playbook-core.js`, shared by the deck and the web experience, so an edit there updates both.

## Workshop web experience

Highlights: headlines that rise word by word, bottle liquid that sloshes with scroll speed, a concept section where the bottle drains and refills with each flavor, and a **Flavor Lab** (the Create step) where the room picks a cue to keep, one thing to change, an occasion and a consumer, and sees whether it matches one of the six, with its platform and formulation watch-out.


- `index.html` is the interactive scroll experience for the **TheraBreath Flavor Playbook** workshop (Darwin, Church & Dwight HQ, Ewing, NJ, November 9, 2026, 10:00 AM). It is a single self-contained file: open it in a browser, or serve the repo root with any static host.
- Present with ← → (one screen per press), F for full screen, N for presenter notes. Tasting scores, decisions and owners are saved in the presenting browser only. "Copy the draft playbook" puts the outcome on the clipboard.
- `assets/` holds the official TheraBreath logo and product photo. The concept bottles are drawn in code to match the current rinse label (orange cap, "Powered by Oxygen" band, FRESH BREATH box, flavor band).

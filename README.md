# The Flavor Factory × TheraBreath Capabilities Workshop Booklet

This repository contains a generated, print-ready 18-page US Letter portrait PDF booklet for **The Flavor Factory × Church & Dwight / TheraBreath Capabilities Workshop | July 2026**.

## Deliverable

- `dist/therabreath_capabilities_workshop_booklet.pdf`: final 18-page vector PDF booklet.

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

## Worlds of Fresh: the November 9 workshop

The site, pre-read, deck and reel share one idea: every flavor is its own animated world. As you scroll (or advance a slide) the next world pours in over the last, and the TheraBreath bottle drains and refills with each flavor. The worlds, the six flavors, the sodium chlorite chemistry and the session details live in `assets/playbook-core.js`, so one edit updates every piece. `assets/worlds.js` and `assets/worlds.css` hold the scroll engine and styles shared by the site and the pre-read.

Session (from Ross Conroy's invite, Sep 24, 2026): Monday, November 9, 2026, 10:00 AM to 12:00 PM ET, room Darwin, Church & Dwight HQ, Ewing, NJ, lunch provided. Four objectives: trends, territories, concepts, pipeline. Agenda: 10:00 Welcome → 10:10 Trends → 10:30 Territories → 10:50 Taste (blind) → 11:20 Create → 11:40 Playbook → 12:00 lunch.

## The six flavors (working names, not trademark-screened)

Named the way TheraBreath names its own flavors (Invigorating Mint, Rainforest Mint, Chamomile Mint…). Each is built from molecules that give sodium chlorite nothing to oxidize. The chemistry is our bench read: every flavor still needs accelerated stability in the real base and flavorist sign-off.

| Name | Flavor | Key molecules | Why it survives sodium chlorite |
|---|---|---|---|
| Frost Mint | Staged cooling | Menthol, WS-3, WS-23, menthyl lactate | All saturated coolants, no aldehydes |
| Coastal Mint | Sea salt & marine air | Calone, sea salt, menthol | Marine note is a ketone; salt is at home in a sodium base |
| Cardamom Mint | Green cardamom | 1,8-cineole, terpinyl acetate, menthol | Cineole is one of the most oxidation-stable flavor molecules |
| Coconut Mint | Coconut water | γ-nonalactone, δ-decalactone, menthol | Saturated lactones (confirm at the rinse's pH) |
| Rosewater Mint | Rosewater | Phenylethyl alcohol, menthone, menthol | Stable alcohol instead of fragile rose terpenes |
| Orchard Mint | Crisp green apple | Hexyl acetate, ethyl 2-methylbutyrate, menthol | Saturated esters, no green-apple aldehydes |

Nine wildcards, each from a real trend and culture (bench difficulty in brackets): Sage Mint (easy), Dragon Fruit Mint, Vietnam/Central America (medium), Cedar Mint (medium), Matcha Mint, Japan (medium), Hibiscus Mint, Senegal/Mexico/Caribbean (medium), Lychee Mint, Guangdong/Southeast Asia (medium), Pistachio Mint, Middle East/Sicily (stretch), Birch Mint, Nordics (easy), Mango Chili Mint, Mexico (stretch).

## Trend research

`TREND_DEEP` in `assets/playbook-core.js` holds twelve trends across three lenses (flavor, sensory, consumer), each with a maturity stage (mainstream, rising, emerging), where we see it, what it means for TheraBreath and a question for the room. `FUTURE` holds six 2027 to 2030 shifts. Stages are our judgment, not measured data. The site and pre-read show them on an interactive trend radar; the deck gives each lens its own slide.

What the base breaks down, and why we avoided it: citral (lemon, lime), cinnamaldehyde, vanillin, eugenol (clove), nonadienal (cucumber, melon).

## Pre-read (send before the meeting)

- `brief/index.html`: the scrolling pre-read. Hero with the session facts and a countdown, the 30-second reel, who we are, what TheraBreath asked for (the ask, each objective mapped to what you leave with, and what we bring), the four objectives with an agenda dial, the trends (a pinned horizontal track), the sodium chlorite scene (molecules survive or fade as an oxygen front sweeps across), the six flavor worlds with the pinned refilling bottle, tasting prep, four questions, and the playbook we'll leave with: an interactive six-chapter book and a proposed 30/60/90 plan.
- The six names are shown, but not which coded cup is which, so the tasting stays blind.
- Share the deployed URL ending in `/brief/`. It does not link to the workshop site or deck.

## Pre-read reel

`video/` is a Remotion project for the 32-second cinematic reel: the ask, twelve trends on the beat, six flavor worlds, nine passport-stamped wildcards and the playbook reveal, with original synthesized music and sound effects. It uses twelve unbranded Higgsfield clips when they have been fetched (`node scripts/fetch-clips.mjs`) and falls back to the animated canvas worlds otherwise. Rendered MP4, WebM and poster are in `brief/media/`. See `video/README.md`.

## 3D flavor world and Higgsfield visuals

- `lab3d/src/lab3d.js` (three.js) builds to `assets/lab3d.js` (`cd lab3d && npm i && npm run build`). It renders a glass TheraBreath-style bottle whose liquid drains and refills per flavor, the five spheres from The Flavor Factory logo, six floating flavor islands and fresh mint. One WebGL canvas per page moves to whichever `[data-lab]` host is on screen (hero, six worlds, lineup, stage). Pages fall back to the 2D bottle when WebGL is unavailable. `?no3d` turns it off; `?lowgl` renders at low resolution for testing.
- `assets/models/`: the six islands and the mint sprig, made with Higgsfield (image, then Tripo image-to-3D) and compressed with gltf-transform (WebP textures, meshopt), about 3.8 MB in total.
- `assets/visuals/`: Higgsfield key visuals (hero archipelago, trends, territories, concepts, pipeline, playbook, Norco lab, oxygen), island renders and nine wildcard photos. All are AI-generated illustrations and are labeled as such on the pages.
- `assets/brand/`: The Flavor Factory logo (color and reversed), from the supplied PDF.
- Site and pre-read: 3D hero and six-worlds, 3D lineup and finale, full-bleed "vista" sections between chapters, photo passport stamps.
- Deck: 3D title, six worlds and close slides, key-visual section openers, the pop-up playbook cover. `node scripts/export-deck-pdf.js` serves the deck locally, captures the 3D slides, and prints the PDF; `python3 scripts/compress-pdf.py` then shrinks it (about 9 MB).

## Still to add (red dashed boxes on the pages)

- Team photo, plus names and roles of who is attending
- Flavorist sign-off on the six formulations and the who/when hypotheses
- Decision on whether to keep the working names

## Workshop deck

- `deck/index.html`: 34 slides (3D on the title, six worlds and close slides), 1920 × 1080, built as a workshop around Ross's four objectives. It opens with what TheraBreath asked for (Ross's ask and the four things he asked us to bring). Each objective has an opener with its question, the content, and a "Let's discuss" slide with prompts. Trends: radar, a slide per lens, 2027 to 2030, discussion and a dot vote. Territories: one rule from the bench, the white-space map, six new worlds, nine wildcards, four platforms, a short taste break, discussion. Concepts: a day of occasions, six consumer segments, the Create exercise. Pipeline: three checks, now/next/later, where flavor could travel across the franchise, discussion, draft playbook, the ultimate playbook (six chapters, each tied to an objective), a proposed 30/60/90 plan, close.
- Keys: ← → / space to move, **G** overview, **N** speaker notes, **P** presenter view (current and next slide, notes, timer, synced), **F** full screen, **B** blank. Slide numbers deep-link (`deck/#12`).
- `dist/TheraBreath_Flavor_Playbook_Deck.pdf` is the PDF export. Regenerate with `node scripts/export-deck-pdf.js` (needs `playwright-core` and a local Chrome; see the script header).
- Fonts are self-hosted in `assets/fonts/` (Bricolage Grotesque, Figtree, JetBrains Mono, Archivo).

## Workshop web experience

- `index.html`: the in-room tool and leave-behind. Scroll through the worlds; tools along the way: what TheraBreath asked for, an interactive trend radar (filter by lens, tap a trend), 2027 to 2030 future trends, a flavor passport of nine wildcard stamps that flip over, a spin-the-wheel warm-up game, the blind scorecard (seven cups), the concept builder (pick a world, a moment and a person), the pipeline (tap a bottle to move it between near-term, next and long-term), the six-chapter playbook book (tap a chapter tab) with the proposed 30/60/90 plan, and the draft playbook (trends, two territories, the three checks, owners). "Copy the draft playbook" puts it all on the clipboard. Everything is saved in the presenting browser only.
- `assets/` holds the official TheraBreath logo and product photo. The concept bottles are drawn in code to match the current rinse label and read "Concept mockup · not a product".

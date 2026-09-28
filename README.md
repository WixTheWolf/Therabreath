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

## Worlds of Fresh: the November 9 workshop

The site, pre-read, deck and reel share one idea: every flavor is its own animated world. As you scroll (or advance a slide) the next world pours in over the last, and the TheraBreath bottle drains and refills with each flavor. The worlds, the six flavors, the sodium chlorite chemistry and the session details live in `assets/playbook-core.js`, so one edit updates every piece. `assets/worlds.js` and `assets/worlds.css` hold the scroll engine and styles shared by the site and the pre-read.

Session (from Ross Conroy's invite, Sep 24, 2026): Monday, November 9, 2026, 10:00 AM – 12:00 PM ET, room Darwin, Church & Dwight HQ, Ewing, NJ, lunch provided. Four objectives: trends, territories, concepts, pipeline. Agenda: 10:00 Welcome → 10:10 Trends → 10:30 Territories → 10:50 Taste (blind) → 11:20 Create → 11:40 Playbook → 12:00 lunch.

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

Wildcards: Sage Mint, Watermelon Mint, Cedar Mint. What the base breaks down, and why we avoided it: citral (lemon, lime), cinnamaldehyde, vanillin, eugenol (clove), nonadienal (cucumber, melon).

## Pre-read (send before the meeting)

- `brief/index.html`: the scrolling pre-read. Hero with the session facts and a countdown, the 15-second reel, who we are, the four objectives with an agenda dial, the trends (a pinned horizontal track), the sodium chlorite scene (molecules survive or fade as an oxygen front sweeps across), the six flavor worlds with the pinned refilling bottle, tasting prep, four questions, and the draft playbook we'll leave with.
- The six names are shown, but not which coded cup is which, so the tasting stays blind.
- Share the deployed URL ending in `/brief/`. It does not link to the workshop site or deck.

## Pre-read reel

`video/` is a Remotion project for the 15-second reel (original synthesized music and sound effects, cuts on the beat). The bottle scene pours each flavor world in behind the bottle on the beat, using the same world renderers as the pages. Rendered MP4, WebM and poster are in `brief/media/`. See `video/README.md`.

## Still to add (red dashed boxes on the pages)

- The Flavor Factory logo file (header lockups still use typed text)
- Team photo, plus names and roles of who is attending
- Flavorist sign-off on the six formulations and the who/when hypotheses
- Decision on whether to keep the working names

## Workshop deck

- `deck/index.html`: 23 slides, 1920 × 1080, each in its own animated world. Welcome → Trends → the base (sodium chlorite) → Territory map → Tasting and scorecard → Reveal → one slide per flavor world → Wildcards → Create → Three checks → Decision board → Pipeline → Draft playbook → Close.
- Keys: ← → / space to move, **G** overview, **N** speaker notes, **P** presenter view (current and next slide, notes, timer, synced), **F** full screen, **B** blank. Slide numbers deep-link (`deck/#12`).
- `dist/TheraBreath_Flavor_Playbook_Deck.pdf` is the PDF export. Regenerate with `node scripts/export-deck-pdf.js` (needs `playwright-core` and a local Chrome; see the script header).
- Fonts are self-hosted in `assets/fonts/` (Bricolage Grotesque, Figtree, JetBrains Mono, Archivo).

## Workshop web experience

- `index.html`: the in-room tool and leave-behind. Scroll through the worlds; tools along the way: the blind scorecard (seven cups), the concept builder (pick a world, a moment and a person), the pipeline (tap a bottle to move it between near-term, next and long-term), and the draft playbook (trends, two territories, the three checks, owners). "Copy the draft playbook" puts it all on the clipboard. Everything is saved in the presenting browser only.
- `assets/` holds the official TheraBreath logo and product photo. The concept bottles are drawn in code to match the current rinse label and read "Concept mockup · not a product".

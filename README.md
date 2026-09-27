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

## Workshop deck

- `deck/index.html` is the 30-slide presentation for the session (1920 × 1080, scales to any screen). It follows the workshop arc: Frame → Taste → Choose → Assign, with a slide for each of the six concepts, a blind scorecard and a decision board to fill in live.
- Keys: ← → / space to move, **G** slide overview, **N** speaker notes, **P** presenter view (current + next slide, notes and a timer, synced with the main window), **F** full screen, **B** blank screen. Slide numbers deep-link (`deck/#17`).
- `dist/TheraBreath_Flavor_Playbook_Deck.pdf` is the PDF export for offline presenting or sending after the session. Regenerate it with `node scripts/export-deck-pdf.js` (needs `playwright-core` and a local Chrome; see the script header).
- Concept copy, regions, frameworks, the bottle drawing and the concept artwork live in `assets/playbook-core.js`, shared by the deck and the web experience, so an edit there updates both.

## Workshop web experience

- `index.html` is the interactive scroll experience for the **TheraBreath Flavor Playbook** workshop (Princeton, NJ, November 9, 2026). It is a single self-contained file: open it in a browser, or serve the repo root with any static host.
- Present with ← → (one screen per press), F for full screen, N for presenter notes. Tasting scores, decisions and owners are saved in the presenting browser only. "Copy the short list" puts the outcome on the clipboard.
- `assets/` holds the official TheraBreath logo and product photo. The concept bottles are drawn in code to match the current rinse label (orange cap, "Powered by Oxygen" band, FRESH BREATH box, flavor band).

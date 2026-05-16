# The Flavor Factory × TheraBreath Capabilities Workshop Booklet

This repository contains a generated, print-ready 18-page US Letter portrait PDF booklet for **The Flavor Factory × Church & Dwight / TheraBreath Capabilities Workshop | July 2026**.

## Deliverable

- `dist/therabreath_capabilities_workshop_booklet.pdf` — final 18-page vector PDF booklet.

## Design System

- Page size: US Letter portrait, 8.5 × 11 inches.
- Palette: TheraBreath blue `#00A3E0`, mint green `#7ED321`, dark navy body text, and white/pale backgrounds.
- Typography intent: Montserrat-style bold headings and Open-Sans-style clean sans body text, implemented with dependency-free PDF core sans-serif fonts for reliable generation in restricted environments.
- Production details: consistent page numbers, thin blue/mint footer rule, confidential footer text, molecule/water-droplet accents, concept-card pages, scoring table, and QR-code placeholder.

## Vercel Deployment

This repository is deployable as a static Vercel site. The root `index.html` provides a landing page with links to the generated PDF, and `vercel.json` adds PDF headers plus a `/booklet` rewrite to the booklet file.

Expected public routes after deployment:

- `/` — landing page.
- `/dist/therabreath_capabilities_workshop_booklet.pdf` — direct PDF URL.
- `/booklet` — short PDF URL.

## Regenerate

```bash
python3 build_booklet.py
```

The command writes the PDF to `dist/therabreath_capabilities_workshop_booklet.pdf`.

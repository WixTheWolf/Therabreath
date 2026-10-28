# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences carry equal weight. Neither wins by default, so each conflict between them is weighed on its own.

- **Church & Dwight's Oral Care R&D leadership team**, invited by Ross Conroy. Before the day they read the front door and a personal pre-brief and answer four quick questions. On November 9 they watch the presentation on the room's TV, taste four blind samples, and vote on their own phones (a signed link from a QR code, first name only).
- **The Flavor Factory team running the morning**: Dan Wixted (President), Alex Wixted (Business Operations), Ryan Wixted (QC/QA Manager) and Matt Wixted (Production Manager). They rehearse, then run the morning from the presenting laptop with the talking points, the run sheet, the team page and the paper scorecard.

## Product Purpose

Everything for one workshop and nothing else: **The Future of Freshness**, Monday, November 9, 2026, 10:00 AM to 12:00 PM ET, Darwin room, Church & Dwight, 469 N Harrison St, Princeton, NJ 08540. It is built for this event and the write-up after it, and nothing is generalized for other clients.

It answers Ross Conroy's invitation (September 18, 2026): four objectives and one goal, quoted word for word.

- 01: Identifying emerging flavor, sensory, and consumer trends that could influence the future of oral care.
- 02: Exploring new flavor territories and sensory experiences that can differentiate TheraBreath from competitors and create memorable consumer experiences.
- 03: Developing innovative flavor concepts that unlock new usage occasions, address new consumer segments, and create opportunities for portfolio expansion.
- 04: Generating a pipeline of innovation platforms, flavor directions, and white-space opportunities that have the potential to drive incremental growth across the portfolio.
- Goal: "Our goal, as R&D, is to drive incremental growth through flavor innovation by identifying and developing new flavor experiences that both strengthen our appeal with existing loyal users and create opportunities to attract new consumers to the franchise."

The name on the door is The Future of Freshness; what the room builds is **The Flavor Playbook**. Success is leaving at noon with up to three directions, each with a TFF owner, a C&D reviewer, the base and the next sample step, written up and sent to everyone in the room within 8 business days.

## Positioning

The Flavor Factory is a wholesale flavor manufacturer making liquid and powder flavors for just about anything: food and beverage, bakery, dairy, syrups, confectionery, pharmaceutical, nutraceutical, personal care, oral care and even animal food, with a focus on naturally derived flavors and much of the work custom and proprietary to the client. That range is what it brings to TheraBreath. The morning is a working discussion, not a pitch: four samples made in the unflavored Fresh Breath and Kids bases Church & Dwight sent, tasted blind and scored live, with the room's votes assembling the Playbook in front of them.

## Operating Context

- **Before the day:** the front door (`/`) opens with Church & Dwight's password. Each attendee gets a personal pre-brief link (`/survey/FOF1109?k=…&n=Name`), sent November 3; it prints to a 4-page Letter PDF, and its answers open the morning.
- **On the day:** the presentation (`/host`) runs on a fixed 1920 x 1080 canvas from the presenting laptop, mirrored to the TV in a lit conference room and read from across the table. 35 scenes, or 36 once pre-brief answers exist, in four parts, one per objective. Phones join by QR code and vote four times: three trends, the tasting scores, five chips on what gets a next round, and three dots on the ideas to develop. Anyone without a phone votes by hand on screen or on the paper scorecard.
- **The team's tools:** the team link (`/t/KEY`) opens the presentation, the run sheet (two Letter pages), the team page, the scorecard and THE FLAVOR RACE, the film that closes the morning before lunch. Church & Dwight's password alone opens none of them, and only the team can move the slides, open votes or type on the board.
- **Sessions:** `FOF1109` is the live session; any other code (for example `REHEARSE`) is a clean rehearsal that never touches it. `?still=1` renders without writing to the session.
- **Running late:** `S` skips the optional slides, `]` and `[` jump between parts, and the talking points show how far over the current part is.

## Capabilities and Constraints

- One source for the morning: `RUN` in `src/lib/content.ts` holds the blocks, times, objectives and scenes; `OBJECTIVES` and `ROSS_GOAL` hold Ross's words; `src/lib/scenes.ts` holds the run of show and talking points.
- The blind flight: A Blossom Mint and B Grove Mint in the Fresh Breath base, C Berry Blast and D the Mystery Flavor in the Kids base. Names stay sealed on every surface until the room's reveal.
- **Confidentiality (binding):** password protected, noindex, no third-party analytics. No TheraBreath or The Flavor Factory formula details, codes or usage levels anywhere. The samples and concepts are development work made for this session, not finished products or claims.
- **Copy rules (binding):** no em dashes or en dashes anywhere in the repo (`scripts/check-dashes.mjs` enforces it); curly quotes; no invented data, so every number carries its source; Ross's four objectives and his goal quoted word for word; nobody is named as presenting any part.
- Open before November 9 (see the README's [CONFIRM] list): the bases and the Mystery Flavor's fruits with Ryan, the Flavor School and OXYD-8 wording, attendee names for the personal links, the Q3 earnings refresh after October 30, next-step dates (including a January 2027 review), the official TheraBreath orange and logo, and the Darwin room's TV, laptop and Wi-Fi.

## Brand Commitments

- Names: The Future of Freshness (the event), The Flavor Playbook (the outcome), and the lockup TheraBreath × The Flavor Factory.
- **Voice (binding):** warm and conversational, professional but approachable, like a knowledgeable person explaining it. Contractions, varied sentence length, natural transitions; no slogans, fragments or stiff colon lists.

## Evidence on Hand

- Church & Dwight Q2 2026 earnings call (July 31, 2026): TheraBreath had 25.3% of US mouthwash in Q2 2026, up 4.5 points, number 2 in the category; 14% of US households buy TheraBreath against 65% for mouthwash, which leaves 86 of every 100 who don't buy it yet.
- Kenvue press release (June 2, 2026): 54% of Americans want a milder-tasting mouthwash.
- Ross Conroy's invitation (September 18, 2026), quoted above.
- Seven trends, each with two public sources, and competitor launches from public coverage, all in `src/lib/content.ts`.
- Assets: The Flavor Factory logo (`public/img/tff-logo.webp`, `tff-logo-white.webp`), the TheraBreath logo (`public/img/therabreath-logo.png`), photography in `public/img`, the opening film and THE FLAVOR RACE in `public/media`.
- Absences future work must not fill in: no consumer research, testimonials or measured sensory data for the directions. The tasting scores are this group's first reactions, and the white-space map is our read of public product listings, labeled as such.

## Product Principles

1. Ross's brief is the spine. Every part answers one of his four objectives, in his words.
2. A discussion, not a pitch. The room decides, and nobody is named as presenting.
3. Leave with decisions. Every direction picked by noon has an owner and a next step.
4. True by construction. Sourced numbers only, development samples framed as development, nothing confidential on screen.
5. Serve both sides of the table. The room reads it from across a bright room and on their phones; the team runs it live under time pressure.

## Accessibility & Inclusion

- The site was brought to WCAG 2.2 AA on October 28 (contrast, visible focus, one h1 per page, 44px phone targets, reduced motion respected); keep that floor.
- Slides must read from across a lit room on a TV.
- Nobody needs a phone to take part: hand votes on screen and the paper scorecard cover it.

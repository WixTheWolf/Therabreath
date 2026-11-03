# THE MASTER BRIEF
## The Future of Freshness × The Flavor Playbook
### One experience: the site, the stage deck and the pre-brief, for TheraBreath and The Flavor Factory

Monday, November 9, 2026 · 10:00 to 12:00 ET · Darwin room, Church & Dwight

---

## 0. How to use this brief

This is a build brief for a single designer-engineer (human or AI) who will build the final experience. It merges two versions that already exist in this repo:

* **The Future of Freshness** (`index.html`, `site/`, `brief/`, `freshness/`, `deck/`, `video/`). It is cinematic and sensory: the opening film, macro photography, six named flavor territories, the Freshness Compass, the flavor clock, the world flavor atlas, the "Your turn" sliders and the tasting-card pre-brief.
* **The Flavor Playbook** (`playbook/`). It is live and evidence-led: every number sourced, Ross's four objectives word for word, a WebGL light engine, phones in every hand, a Console, Flavor School, real-time votes, and a Playbook document that assembles itself with the room's names on the cover.

The goal is one experience with the soul of the first and the spine of the second. Read the whole brief before you build anything. Where this brief and the code disagree, this brief wins. Where this brief and a [CONFIRM] item disagree, ask Matt.

---

## 1. The one idea

**TheraBreath took away the burn. Now let's add the want.**

TheraBreath is number 2 in US mouthwash, at 25.3% share in Q2 2026. But 86 of every 100 US households have not met it yet. Flavor is how a brand introduces itself to people who have never picked it up. For two hours we are not presenting to TheraBreath. We are building its flavor future with them, and they walk out holding it.

The name on the door is **The Future of Freshness**. The thing the room builds is **The Flavor Playbook**. Use both, in that relationship, everywhere.

---

## 2. Who is in the room, and what makes them lean in

The audience is 10 to 12 people from Church & Dwight and TheraBreath: R&D, brand, procurement and innovation [CONFIRM the attendee list, names and roles with Matt]. They have seen a hundred trend decks. They visited Norco in July. They are experts in their own product and busy.

They get excited when they:

1. **See their own fingerprints.** Their pre-work answers open the session. Their names rise into the drop as they join. Their votes move the screen in real time. Their words end up in a document with their names on the cover.
2. **Taste something real.** Blind samples, a reveal, and the moment they find out whether their guess was right.
3. **Feel the engineering.** Flavor is not decoration here; it has to survive an oxidizing system. Show them the tradeoffs plainly: what is proven, what needs engineering, what must be screened first. Experts respect candor more than enthusiasm.
4. **Get a stake in the outcome.** The top three concepts become real prototypes in real TheraBreath bases [CONFIRM commitment and date]. Tell them this at the start, so every vote counts.
5. **Get a little competition.** Three mixed teams, a timer, pitches and a dot vote, all light and never silly.
6. **Get surprises.** A smell they cannot place. A glass that fills with light. A number they did not know. A flavor they did not expect to like.
7. **Never sit still for long.** No stretch without a hands-on moment ever runs longer than 7 minutes. The rhythm is Teach, Show, Taste, Decide.

Test every scene against these seven points. If a scene does none of them, cut it.

---

## 3. Non-negotiables (carried from both briefs)

* **No em dashes or en dashes, anywhere.** That covers copy, code comments, alt text, metadata and file names. The existing `check-dashes` gate must keep failing the build if one appears.
* **Do not invent data.** Every number carries a source key. Anything unconfirmed is marked **[CONFIRM]** on screen in the Console, and never on the Stage.
* **Confidential and private.** Password protected, noindex on everything, no third-party analytics, no public listing. Keep the existing password gate; the password is held by Matt and never written into the repo.
* **No TheraBreath or TFF formula details.** No codes, usage levels or formulations anywhere. Engineering is explained with public chemistry and plain principles only.
* **Competitors are factual and neutral.** Names and dated public launches only. No logos, no mockery.
* **Client brand assets are used with care and never altered.** The TheraBreath orange is a placeholder until it is sampled from official assets [CONFIRM].
* **Typography:** Newsreader (serif, with optical sizes) and Geist / Geist Mono. Never Fraunces; its lowercase f was rejected.
* **Tone:** matter of fact about the business, the pillars, the trends, the flavor choices and the engineering. Save the poetry for the visuals and the transitions.

---

## 4. The four pillars (Ross's brief, word for word)

These are the spine. Every scene belongs to one pillar, and the progress bar on the Stage always shows which one.

| # | Ross's objective (verbatim) | Pillar | What the room produces |
|---|---|---|---|
| 01 | Identify emerging flavor, sensory and consumer trends shaping the future of oral care. | **The Signals** | Top 3 signals, voted and locked |
| 02 | Explore new flavor territories and differentiated sensory experiences. | **The Territories** | A ranked territory list, backed by blind-tasting scores |
| 03 | Generate concepts that create new occasions, engage new consumers and expand the portfolio. | **The Moments** (concepts) | 3 team concepts plus the backed seed cards |
| 04 | Develop a pipeline of platforms, flavor directions and white space for incremental growth. | **The Playbook** (pipeline) | Now / Next / Future board by portfolio role, and a 2027 drop calendar |

Plus one closing chapter, **The Flavor Code**: seven guardrails every TheraBreath flavor keeps.

The Future of Freshness asked four questions: What's changing? What could freshness become? Where can flavor create growth? What do we do with all of this? Use them as the headline of each pillar, with Ross's objective in small type beneath.

---

## 5. What to keep from each version

### Keep from The Future of Freshness
* **The 30-second opening film** (`freshness/media/opening.mp4`, H.264 first so it plays in Edge). It opens the Stage and is the hero of the site and the pre-brief.
* **The freshness vocabulary prologue.** "Mint" at the centre, and 16 words (Brightness, Cooling, Tingle, Duration, Ritual, Mood, Occasion...) orbiting out of it. This is the most elegant way to say "freshness is bigger than mint."
* **The six shifts:** Hygiene to Wellness, Generic mint to Composed flavor experiences, Maximum burn to Personalized intensity, Functional rinse to Enjoyable ritual, Domestic to Global flavor vocabulary, Single cue to Multidimensional sensory experience.
* **Named hero flavors with macro photography and a sensory arc** (first impression, heart, finish), plus a question for the room on every territory.
* **The Freshness Compass:** a radar of 9 sensory dimensions at three moments in time (first impression, mid-palate, finish), compared with today's core mint. Label it "conceptual, not panel data."
* **The flavor clock:** Wake, Confidence, Reset, Post meal, Restore. The same person wants a different freshness at 7 AM and at 10 PM.
* **The world flavor atlas:** how ingredients travel from origin cuisine to specialist menus, to café culture, to mainstream food and drink, to personal care. Label it "The Flavor Factory's read, not measured data."
* **"Idea to experience to formula":** a flavor isn't innovation until it works in the product.
* **The tasting-card pre-brief** and the freshness-profile homework.

### Keep from The Flavor Playbook
* **The sourced business story:** the climb (5.6% before Swishy Time [CONFIRM label], 15.6%, just under 22% at the end of 2025, 25.3% in Q2 2026), the gap (65% category versus 14% TheraBreath household penetration), the portfolio today (25 variants, nearly all mint, named for benefits), and the market moving (Listerine Watermelon Mint July 2025, Listerine Citrus Mint March 2026, TheraBreath Eucalyptus Mint March 2026, the Listerine intensity range June 2026 citing that 54% want milder, and Hismile collaborations [CONFIRM per item]).
* **Seven sourced signals, each with two proofs and a "so what."**
* **Flavor School with Alex:** what flavor really is (taste, aroma, feel), how cool works (illustrative curves), flavor in an oxidizing world, the anatomy of a TheraBreath flavor, and the molecule flight.
* **The live system:** Stage, Console, Room phones, Survey and Playbook; the event log, Supabase and Realtime; Simulate 12; and the offline outbox.
* **The WebGL light engine:** the clear drop and the two glasses. Colour only ever comes from light.
* **Co-creation:** mission briefing, 14 seed cards, the Concept Canvas with the draining glass timer, auto-generated posters, dot rain, the pipeline board, the 2027 calendar and the Flavor Code.
* **The Playbook assembling itself at the close,** with every participant's name on the cover.

---

## 6. The flavor story, reconciled (matter of fact)

### 6.1 Signals: seven, each sourced
Merge the five Freshness signals into the seven sourced Playbook signals. Never show a signal without its proof line and source.

1. **Mild is the new mainstream.** 54% of Americans want a milder-tasting mouthwash (Kenvue, June 2, 2026). The Freshness "Sensory personalization" signal folds in here. *So what:* own intensity as a choice, not a compromise.
2. **Warmth meets freshness.** Frosted Star Anise is the 2026 Flavor of the Year; two-thirds of consumers recognize star anise, but only 34% have tasted it (dsm-firmenich, Dec 2025). Swicy keeps growing (Kerry 2026). *So what:* a new adult flavor family that still finishes cool.
3. **Fruit grows up.** Black Currant is McCormick's 2026 Flavor of the Year; dragon fruit is breaking out, and hibiscus and orange blossom are future flavors (Kerry 2026). *So what:* fruit-forward mints for adults, not candy.
4. **Botanicals and rituals.** Eucalyptus Mint and Overnight Chamomile Mint already exist, and Swishy Time reframed oral care as self-care. Pantone's Cloud Dancer signals calm. The Freshness "Botanical wellness" and "Ritualization" signals fold in here. *So what:* flavor that marks a moment in the day.
5. **Edible allure.** Dessert-inspired oral care is rising, and Gen Z treats flavor as identity (VML Future 100, 2026). *So what:* indulgent openings, but only if the finish is unmistakably clean.
6. **Sensation is the new proof of efficacy.** Tingling, warming, salivating and fizzing signal that a product is working (Perfumer & Flavorist, Apr 29, 2026). Next-generation coolers promise fast onset and long linger (Symrise, Feb 13, 2025). *So what:* design how TheraBreath feels, not just how it tastes.
7. **New mouths, new needs.** 1 in 8 US adults currently take a GLP-1; users commonly report dry mouth, bad breath and taste changes, though studies have not established that the drugs cause them (CareQuest, Aug 2026). More than 25 million Americans live with dry mouth. *So what:* flavor built for altered taste and comfort is a platform, not a niche.

The Freshness "Global citrus" and "Global discovery" signals have no hard source yet. They appear only inside the Passport and Bright Global Freshness territories, marked [CONFIRM source], until one is found.

### 6.2 Territories: seven worlds, each with one hero flavor
Each territory gets:
* a full-bleed world (photography plus light), its palette, and a hero flavor name;
* a sensory arc (first, heart, finish) and a Compass profile;
* a moment on the flavor clock and who it is for;
* an honest **readiness badge:** Proven today · Needs engineering · Screen first · Varies;
* a single question for the room.

| # | Territory | Hero flavor | Family (on the card) | Moment | Readiness |
|---|---|---|---|---|---|
| 1 | **Mint, Mastered** | Glacier Spearmint, Extra Mild to Arctic | Wintergreen Frost, Double Peppermint Arctic, single-origin peppermint | Every day | Proven today |
| 2 | **Bright Global Freshness** | Arctic Yuzu | Calamansi Mint, Bergamot Mint, Hierbabuena Lima, Yuzu Green Tea Mint | Wake, pre-social | Needs engineering (citrus aldehydes) |
| 3 | **Garden Clean** | Green Tea Cucumber ("Spring Garden") | Eucalyptus Mint extensions, Basil Lime Mint, Grapefruit Rose Mint | Midday reset | Proven today (eucalyptus, chamomile); green notes need engineering |
| 4 | **Warm Meets Cool** | Frosted Star Anise Mint | Ginger Lime, Cinnamon Frost, Clove Wintergreen, Chai Spice Mint | Post-meal, holiday season | Needs engineering |
| 5 | **Fruit, Grown Up** | Black Currant Frost | Dragon Fruit Mint, White Peach Mint, Pear Cardamom Mint, Hibiscus Berry Mint | Every day, discovery drops | Needs engineering |
| 6 | **Soft Freshness · Night Ritual** | Chamomile Vanilla Mint | Lavender Chamomile Mint, Honey Chamomile, Toasted Coconut Mint, Cacao Mint | Wind-down, treat moments | Screen first (vanilla-type and sweet notes) |
| 7 | **The Mint Ladder** | Sour Apple Chill (tween bridge) | Strawberry Splash, Wacky Watermelon, Bubblegum Blast, Blue Raspberry Frost | Kids to tweens, the braces years | Proven today (kids); tween flavors need engineering |

Passport (regional editions) becomes the "travel" lens on Territory 2 and a Future-horizon platform, so the flight stays at seven worlds.

### 6.3 The blind tasting: four samples
A · Frosted Star Anise Mint · B · Black Currant Frost · C · Spring Garden (cucumber, spearmint, green tea) · D · Glacier Spearmint Extra Mild.

[CONFIRM with Alex which four can be made in a representative base by the date, and the dispensing plan: cups, order and palate cleansers.]

Each phone scores:
* Appeal, "Feels like TheraBreath" and Newness, on a 1 to 5 scale;
* Who it's for (chips);
* One word.

The Stage fills a heat map as scores arrive. The names flip in only on the reveal.

### 6.4 The Flavor Code: seven guardrails
Fresh first · Never the burn · Clean by design · Built for OXYD-8 · Built to last · A name you can taste · Dentist credible.

Phones react to each rule (keep, edit or add). The edits go straight into Chapter 5.

---

## 7. The engineering interactive: "The Bench"

This is the new centrepiece. It replaces the old "Your turn" sliders and deepens the Concept Canvas, and it is what makes an R&D audience lean forward. The tone is an engineering review, not a toy.

**What it is:** a live formulation-design console, played on the Stage and driven from the teams' phones, that turns a flavor idea into an engineering brief.

**How it works:**

1. **Pick a hero.** Choose any territory's hero flavor, or a team concept, as the starting point.
2. **Tune the sensory architecture.** Six dials, each from 1 to 5: cooling onset, cooling linger, sweetness, warmth, botanical or aromatic lift, and tingle. Phones in a team move the dials together; the Stage shows the average and the spread, so disagreement becomes visible and becomes the conversation.
3. **See the experience.**
   * The Freshness Compass redraws live.
   * A sensory curve over time (first impression, heart, finish, linger) animates.
   * An illustrative cooling curve is drawn against "classic menthol."
4. **See the consequences, matter of fact.** A panel of plain readouts updates with every change:
   * **Stability risk** in an oxidizing base: Low, Medium or High. It is driven only by public chemistry rules of thumb (citrus aldehydes and some sweet notes are vulnerable; terpenes, cineole, wintergreen and nootkatone are sturdier). No formulas, no levels.
   * **Readiness:** Proven today, Needs engineering or Screen first, matching the territory badges.
   * **Format fit:** rinse, toothpaste, sachet, strip, spray, lozenge, gum, kids rinse.
   * **Horizon:** Now (2027), Next (2028), Future (2029 to 2030).
   * **Claims note:** "Benefit language set by C&D clinical and regulatory." This appears whenever a dry-mouth or GLP-1 comfort concept is selected.
   * **Flavor Code check:** seven lights that turn amber when a rule is at risk. For example, sweetness above 4 flags "Fresh first."
5. **Lock it.** The tuned profile becomes the concept's "sensory signature" on its poster and in Chapter 3 of the Playbook.

**The honesty rule:** every readout shows its basis in one line ("Rule of thumb from public literature. The TFF lab confirms on the bench"). Alex can override any readout from the Console, with a note, live. That override moment ("Actually, we solved that one last year") is the most credible thing in the whole session.

**Where it sits:** Act IV, after the Concept Canvas and before the pitches. It is 8 minutes, and each team tunes its own concept.

---

## 8. Run of show (120 minutes)

The rhythm throughout is Teach, Show, Taste, Decide. ▶ marks a phone moment; ◆ marks a tasting or smelling moment.

| Time | Scene group | What happens | Mode |
|---|---|---|---|
| 09:15 | **Arrival loop** | The drop, the QR code, names rising in as people join ▶ | After Hours |
| 10:00 | **The film** | The 30 s opening film, full screen, sound on | Cinema |
| 10:01 | **Welcome** | Dan welcomes everyone. July to today: Resiliency, Innovation, Operations, Partnership, then *Growth* lights up | Light |
| 10:04 | **Your brief, our agenda** | Ross's four objectives build as four tiles and become the progress bar | Light |
| 10:06 | **The room already spoke** | Pre-work reveal: top consumer, missing moment, the veto cloud ▶ | Light |
| 10:08 | **Freshness is evolving** | "Mint" at the centre, 16 words orbit out. The thesis: took away the burn, now add the want | After Hours |
| 10:10 | **Pillar 1 · The Signals** | The climb, the gap (glasses fill with light), the portfolio constellation, the market moving, the six shifts, seven signals | Light |
| 10:27 | **Live vote** | Pick 3 signals; glass bars fill; the top 3 lock into Chapter 1 ▶ | Light |
| 10:30 | **Flavor School** (Alex) | Taste, aroma and feel · how cool works · flavor in an oxidizing world · anatomy of a TheraBreath flavor | After Hours |
| 10:38 | **Molecule flight** | 7 blotters; phones guess the source; reveal with the room's score ◆▶ | After Hours |
| 10:44 | **Pillar 2 · The Territories** | The map (intensity × character, where the 86% live), then seven worlds of about 90 s each: photo, light, hero, arc, Compass, readiness, one question | Mixed |
| 10:56 | **Blind tasting** | Samples A to D, scored on phones; heat map fills; names flip; "who guessed right" ◆▶ | After Hours |
| 11:04 | **Territory chips** | 5 chips each; the orbs grow; ranking locks into Chapter 2 ▶ | Light |
| 11:07 | **Pillar 3 · The Moments** | The flavor clock (Wake, Confidence, Reset, Post meal, Restore). Three missions, 14 seed cards ▶ | Light |
| 11:12 | **Concept Canvas** | 12-minute draining glass; one captain per team types, the others suggest ▶ | Light |
| 11:24 | **The Bench** | Each team tunes its concept's sensory signature; engineering readouts; Alex's live overrides ▶ | Light |
| 11:32 | **Pitches** | Auto-posters, 2 minutes per team | Light |
| 11:38 | **Dot vote** | 3 dots each; dots rain onto the posters; the top concepts lock into Chapter 3 ▶ | Light |
| 11:41 | **Pillar 4 · The Playbook** | Pipeline board (Now/Next/Future × Core, Expanders, Explorers, Specialists), placed from the Console; phones agree or challenge ▶ | Light |
| 11:47 | **2027 drop calendar** | Four seasonal windows fill | Light |
| 11:50 | **The Flavor Code** | Seven rules; phones keep or edit each ▶ | Light |
| 11:54 | **The Playbook you just built** | Five pages fly in and close into the cover with their names; the QR code opens the live PDF | After Hours |
| 11:57 | **What happens next** | Playbook v1.0 in 8 business days · top 3 prototypes · a January 2027 session [CONFIRM dates] | After Hours |
| 12:00 | **Lunch loop** | An aurora in the colours of the territories they chose | After Hours |

**Executive mode** (Console toggle) cuts the run to 45 minutes: thesis, gap, signals vote, tasting, chips, dot vote, Playbook, next steps.

---

## 9. The three deliverables

### 9.1 The pre-brief (sent 10 days before, web and PDF)
Its job is to create anticipation and make everyone arrive already invested.

* **Format:**
  * A personal link per attendee (their first name greets them). The PDF version has no site links.
  * A premium envelope in the room [CONFIRM print].
* **Contents, in order:**
  1. The film (web) or its key frame (PDF).
  2. A short letter from The Flavor Factory: we heard your four objectives, and here is how we will spend two hours on them.
  3. The four pillars, as four questions.
  4. The agenda, on one line per act.
  5. **Seven sealed territory cards:** name, palette and one line each. No hero flavors; those are revealed in the room.
  6. **Two-minute homework**, which feeds the live survey (the same session data):
     * Which consumer should TheraBreath win next?
     * Which moment of the day is it missing?
     * Name one flavor you would never approve, and why.
     * Your freshness profile: 5 sliders (familiar to adventurous, cooling to soft, classic to botanical, functional to experiential, everyday to occasion). Saving it renders their personal "freshness orb" as an image, and their answers open the session.
  7. Three things to think about. Logistics: time, room, "come curious and hungry for something other than mint."
* **Promise line:** "You will leave with a Playbook that has your name on it."

### 9.2 The site (the front door, behind the password)
Build it as the scroll-driven Future of Freshness site, upgraded:
* the film hero;
* the vocabulary scrub;
* the two worlds meeting ("Freshness, designed");
* the six shifts on a horizontal track;
* the seven territories, with photography and a morphing Compass;
* the atlas;
* the flavor clock;
* idea to formula;
* the close.

Add a **"Live" state**: during and after the session, the site links to that session's Playbook, and the territory cards show the room's ranking.

### 9.3 The deck (the Stage)
The deck *is* the Stage: 1920 × 1080, scaled to the LED, driven by arrow keys or the Console.

* **LED rules:**
  * no text smaller than 18 px at 1080p;
  * nothing important in the outer 60 px;
  * test true black and orange clipping on the LED [CONFIRM the LED model and resolution].
* **Leave-behind:** a 16:9 PDF export of every scene at its final build step, with the room's results filled in. Generated from the same scenes, so it can never go out of date.
* **Presenter view:** the Console, which shows notes, timers, next scene and room health.

---

## 10. Visual direction: clarity, refracted

* **Two modes.**
  * *Laboratory Light* (Cloud #F0EEE9 and Ink #0B1B2B) for thinking and deciding.
  * *After Hours* (Ink ground) for film, Flavor School, tasting, reveals and the close.
  * Mode changes are moments, with a veil of light, never a hard cut.
* **Light is the only colour source.** The clear drop, the two glasses and the spectral caustics come from the WebGL engine. Territories bring their own palettes, but only through light, photography and liquid.
* **Photography:** keep the macro images (yuzu, cucumber, ginger lime, grapefruit, pear, night, star anise frost, black currant). Every territory world is photo plus light plus slow drifting particles in its palette, with a Ken Burns move over 20 seconds.
* **Motion vocabulary:**
  * things **fill** (glasses, bars, timers);
  * things **rise** (names, bubbles);
  * things **refract** (reveals);
  * things **rain** (dots);
  * things **assemble** (the Playbook).
  * Nothing bounces for fun.
  * 900 ms for scene changes, 110 ms staggers, reduced motion respected.
* **Typography:** Newsreader Light for headlines, italic for the turn of a thought; Geist for body; Geist Mono for labels and sources.
* **Sources:** always on screen, small, in mono, bottom left. Credibility is a design element.
* **Awe moments (at least one per act):**
  * names rising into the drop;
  * the 86% glass glowing;
  * the vocabulary exploding out of "Mint";
  * frost crystallising along the cooling curve;
  * the molecule orb;
  * the Warm Meets Cool world;
  * dot rain;
  * the Playbook closing into its cover.

---

## 11. Architecture (reuse, do not rebuild)

* **Base:** the `playbook/` Next.js app (Stage, Console, Room, Survey, Playbook), with its event-sourced log, Supabase Postgres and Realtime, offline outbox, password gate, signed join links and dash check.
* **Port in from Future of Freshness:**
  * the film and its poster;
  * the photography;
  * the vocabulary data;
  * the Compass radar;
  * the atlas map;
  * the flavor clock;
  * the six shifts;
  * the pre-brief layout.
  * Keep `freshness/js/data.js` as the content source until it is merged into `playbook/src/lib/content.ts`; there must be one content file in the end.
* **New:**
  * the Bench (Stage scene, phone mode, Console override);
  * the vocabulary prologue scene;
  * the shifts scene;
  * the flavor clock scene;
  * the Compass on each territory;
  * the site "Live" state;
  * personal pre-brief links;
  * the deck PDF export.
* **Hosting:** one Vercel project, Root Directory `playbook`, promoted to Production.
* **Performance:** 60 fps on the presenting laptop at 1080p; the WebGL resolution adapts. Every WebGL scene has a still fallback.

---

## 12. Acceptance checklist (rehearse before shipping)

- [ ] A full 120-minute run with Simulate 12, then a real run with at least 6 phones on venue Wi-Fi.
- [ ] Phones keep working with Wi-Fi off for 60 s (outbox), then sync.
- [ ] Every number on the Stage has a visible source; no [CONFIRM] ever shows on the Stage.
- [ ] No formula details anywhere; Alex has signed off Flavor School and the Bench rules.
- [ ] The dash check passes; `npm test` passes.
- [ ] The LED check covers:
  - [ ] the film plays with sound;
  - [ ] the smallest text is readable from the back row;
  - [ ] orange and true black do not clip.
- [ ] The Playbook PDF prints on Letter and A4; the deck PDF exports.
- [ ] The pre-brief:
  - [ ] PDF has no site links;
  - [ ] personal links work;
  - [ ] homework lands in the TB1109 session.
- [ ] Executive mode runs in 45 minutes.
- [ ] Wipe TB1109 the night before.

---

## 13. Open items [CONFIRM]

1. Attendee list, names and roles (the pre-brief greetings and the cover names).
2. The four blind samples and the dispensing plan (Alex).
3. The molecule flight set and the Flavor School wording (Alex).
4. The prototype commitment and all next-step dates.
5. The LED model and resolution; sound in the room.
6. TheraBreath orange sampled from official assets; logo usage approval.
7. The "Before Swishy Time" label; Hismile items; the portfolio listings access date.
8. A source for the global citrus and discovery signals, or keep them as FF's read.
9. A take-home kit (printed Playbook, sample minis) and budget.

---

*The one test for every decision: will this make 12 busy experts put their phones down to look at the screen, or pick them up because the room needs them? If neither, cut it.*

# FINAL Future of Freshness

**TheraBreath × The Flavor Factory | Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET**
**Darwin room, Church & Dwight, 469 N Harrison St, Princeton, NJ 08540**

The final build of the November 9 workshop: one app that holds the site, the pre-brief and the live workshop (the deck), deployed as its own Vercel project, `final-future-of-freshness`, with Root Directory `final`.

The name on the door is **The Future of Freshness**. The thing the room builds is **The Flavor Playbook**.

## What Church & Dwight asked for, and how the build answers it

Ross Conroy's invitation (September 18, 2026) set the brief for the Oral Care R&D leadership team:

- Four objectives, word for word: trends, territories and sensory experiences, concepts for new occasions and consumers, and a pipeline for incremental growth. Each becomes one chapter of the Playbook, and the progress line on the Stage shows which chapter is being written.
- One goal: new flavor experiences that both **strengthen appeal with existing loyal users** and **attract new consumers to the franchise**. The tasting scores feed a growth matrix built on exactly those two axes.
- A pre-read so the team comes "prepared to discuss, not just listen."
- Unflavored Fresh Breath and Kids bases sent to The Flavor Factory. The blind tasting is built in them.

## The presentation and the front door (October 27)

Back to the Stage's look (the glass drop, the light, the signal colors, the platform worlds), with the morning as a discussion around Ross's four objectives: no phones, no votes, nobody named as presenting any part.

- `/host` (password): the presentation, 32 scenes on a fixed 1920 x 1080 canvas (33 once pre-brief answers exist), run from the presenting laptop with no live session (`src/components/ShowApp.tsx`, scenes in `src/components/show/ShowScenes.tsx` and `src/components/scenes/`). Welcome: the title, who we are (names and titles, the science and imagination lists, Ross's "creativity, technical expertise, and innovation capabilities"), July to today, the four objectives word for word with their times, "You told us" (only with pre-brief answers), the thesis. Then one chapter per objective, each opening on one screen in Ross's words and closing on a discussion. Objective 01: the gap, the portfolio, the flavor shelf, seven signals, then the room picks three. Objective 02: Flavor School (taste, aroma and feel; cooling; OXYD-8; anatomy), the four platforms on the map and one at a time, the blind tasting and the reveal, then the directions for a next round. Objective 03: up to three concept cards typed in live. Objective 04: the white space (click a cell to mark where a concept lands) and Now, Next, Later typed in live. Close: the Playbook assembled from what the room marked and typed, what happens next, THE FLAVOR RACE, lunch. Right arrow, space or a click goes on; left goes back; F is full screen; N shows the talking points; B blanks the screen. What the room marks and types is saved in the browser on the presenting laptop; `/host?results=1` is a printable page of it; `/host?reset=1` clears it after rehearsal.
- `/`: the front door, back in its cinematic form: the film, Ross's brief word for word with the time that answers each objective, the growth math, the four platforms, the sealed tasting flight, who you will meet, the morning with objective tags, the pre-brief link, and the optional exploration drawer. The bar opens THE FLAVOR RACE, the presentation, the run sheet and the team page.
- `/team` (password, or the team link): everything built for The Flavor Factory team in the front door's look, with a practice copy of the pre-brief (session `PREVIEW`, so answers never reach the live session) and the morning.
- `/host/run` (password): the run sheet for The Flavor Factory team, two Letter pages: 9:30 setup, the run of show with its scenes and what happens, what to do after the film, and what is still to confirm.
- `/scorecard` (password): the tasting scorecard, one Letter page per person (appeal, feels like TheraBreath, newness, who it is for, advance or not, one word, and the fruits for the Mystery Flavor, Sample D).
- Signing in: one password opens everything; there is no separate host step. The host password still works in the same box, and still guards the old live-workshop Console.
- One source for the morning: `RUN` in `src/lib/content.ts` holds the blocks, times, objectives and scenes; `TOPICS` holds the talking points and the discussion questions for each objective; `OBJECTIVES` holds Ross's four key areas of focus word for word.

The live-workshop surfaces below (the session-driven Stage, Console, phones, the session Playbook) are still in the code and still work at their addresses, but nothing links to them any more.

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Attendees and facilitators (password) | The site: the film, Ross's brief and goal, the growth math, four platforms, the sealed tasting flight, who you will meet, the morning and the pre-brief, and optional exploration tools. |
| `/survey/FOF1109?k=KEY&n=Name` | Each attendee (signed link) | The pre-brief: a personal letter, the thesis and growth math, seven signals, four questions, four sealed platforms, the agenda and two minutes of homework that opens the session. Prints to a 4-page Letter PDF without links. |
| `/stage/FOF1109` | Not linked (password) | The old session-driven Stage, driven by the Console or the arrow keys. |
| `/console/FOF1109` | Matt, with Alex as backup (password) | Scenes, timed notes, votes, timers, teams, Bench overrides, pipeline and commitments, personal pre-brief links, export and wipe. |
| `/j/FOF1109?k=KEY` | Phones (signed link from the QR) | Voting, the tasting scorecard, the Concept Canvas, the Bench dials, dots and reactions. |
| `/playbook/FOF1109` | Everyone after the session | The Playbook, assembled from the room's decisions, with a print PDF. |
| `/host` | The room TV (password) | The presentation: 32 scenes run from the presenting laptop, no phones. |

`FOF1109` is the live session and is set once, in `src/lib/content.ts` (`EVENT.code`). Any other code is a clean rehearsal session.

## The run of show (`src/lib/scenes.ts`)

| Time | Scenes | Who |
| --- | --- | --- |
| 9:30 | Arrival loop: names rise into the drop as phones join | Matt |
| 10:00 | Welcome, July to today, Ross's brief and goal, the pre-work reveal, the thesis | Dan |
| 10:10 | Chapter 1, The Signals: the climb, the gap, the portfolio, the market, seven signals, vote three | Alex |
| 10:27 | Flavor School: what flavor is, how cool works, flavor in an oxidizing world, anatomy | Ryan |
| 10:35 | Chapter 2, The Territories: the map, four opportunity platforms | Matt |
| 10:44 | Blind tasting A to D in the TheraBreath bases, with Mystery Flavor guesses | Ryan |
| 11:00 | Loyal users and new consumers: where each sample lands | Matt |
| 11:03 | Platform vote | |
| 11:06 | Chapter 3, The Concepts: two missions, the Concept Canvas, the Bench, pitches, dots | Ryan on the Bench |
| 11:36 | Chapter 4, The Pipeline: Now, Next, Future, with owners and dates; the Flavor Code | Matt |
| 11:50 | The Playbook assembles; what happens next | Dan |
| 12:00 | Lunch loop | |

Executive mode (Console) cuts the run to the gap, the signal vote, the tasting, the matrix, the votes, the pipeline and next steps.

## Data

Every interaction is an event in one log, folded into session state (`src/lib/state.ts`).

- **Store:** the `flavor-playbook` Supabase project (`fof_events`), reached through the key-checked database functions `fof_list` and `fof_append`. The table has RLS on with no policies, so the public key alone cannot read or write it. A wipe is a `wipe` event, not a deletion. A `POSTGRES_URL` takes precedence if one is set; `STORE=memory` forces the in-memory store for local tests.
- **Realtime:** polling always runs; Supabase Realtime (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) makes cross-screen updates faster when it is configured.
- **Offline:** phone taps queue locally and send when the connection returns.
- **Password:** the built-in password hash is the same as the Playbook's; `PLAYBOOK_PASSWORD` overrides it. THE FLAVOR RACE film and its poster sit behind the password, since the film premieres in the room.

## Run it

```bash
npm install
npm run build
npm test                    # password gate and join link security tests
node verify-workshop.cjs    # the FINAL run of show, the lineup and the session fold
npm start                   # PLAYBOOK_PASSWORD=... to rehearse with your own password
```

Offline at the venue: `npm run offline` serves the full app on the presenter laptop at `http://localhost:3000`.

Rehearse: open `/console/ANYCODE`, press **Simulate 12** on each scene, and step through. Wipe `FOF1109` the night before.

## PDFs (`deliverables/`, not deployed)

- `The-Future-of-Freshness-Pre-brief.pdf`: the 4-page pre-read for Ross to send on November 3 (regenerated October 27: names and titles in the letter, Ross's objectives word for word, objective tags on the agenda).
- `The-Future-of-Freshness-Presenter-Deck.pdf`: the final to send the team, landscape Letter: a cover with the run of show, then every scene as the room sees it at its last build, with its number, time, objective and talking points, and a page marking where "You told us" appears once the pre-brief answers are in.
- `The-Future-of-Freshness-Deck.pdf`: the 32 scenes, blank, one 16:9 page each: the offline fallback. Save a copy to the presenting laptop with the film file.
- `The-Future-of-Freshness-Run-Sheet.pdf`: the hosts' run sheet, two Letter pages; one each for Dan, Alex, Ryan and Matt.
- `The-Future-of-Freshness-Tasting-Scorecard.pdf`: the paper scorecard, one Letter page; print one per person.

Both are exported from the running site with a fresh browser, so the room's inputs are blank and nothing touches the live session:

```bash
node scripts/export-show.mjs https://<production-host> <password> deliverables/The-Future-of-Freshness
```

After the session, open `/host?results=1` on the presenting laptop and print it to PDF: the signals, directions, concepts, white-space marks and Now, Next, Later as the room left them.

## Before November 9 [CONFIRM]

1. Who presents which part is not decided; the deck names nobody (October 27). The lineup, confirmed by Matt on October 27: A Blossom Mint (Grapefruit, Lavender, Rose, Spearmint, Wintergreen) and B Grove Mint (Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus) in the Fresh Breath base; C Berry Blast (Blueberry, Blackberry, Raspberry) and D the Mystery Flavor in the Kids base. Still to confirm with Ryan: the bases for each, and the Mystery Flavor's fruits for the reveal (the deck keeps Apple, Grape, Cherry, Strawberry, Lemon).
2. Flavor School wording and the OXYD-8 scene, with Ryan.
3. Attendee names and roles for the personal pre-brief links.
4. The Q3 earnings call on October 30: refresh the share and penetration scenes once the numbers are approved.
5. Next-step commitments and dates (Playbook v1.0 in 8 business days, new samples, a January 2027 review).
6. The official TheraBreath orange and logo, and a brand check of the generated Church & Dwight sign in THE FLAVOR RACE.
7. Darwin room: TV inputs, our laptop or theirs in Edge, guest Wi-Fi, and whether anyone joins remotely.

The dash check rejects em dashes and en dashes anywhere in the repo.

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

The Stage's look (the glass drop, the light, the signal colors, the photography) with the morning as a discussion around Ross's four objectives, phone voting back in, and nobody named as presenting any part. The copy is written plainly, in our own voice.

- `/host` (password): the presentation, 35 scenes on a fixed 1920 x 1080 canvas (36 once pre-brief answers exist), run from the presenting laptop and driving the live session, so phones follow it (`src/components/ShowApp.tsx`, scenes in `src/components/show/ShowScenes.tsx` and `src/components/scenes/`, run of show in `src/lib/scenes.ts`). Welcome: arrival with the QR code and the count of phones joined, the title, who we are, July to today, the four objectives word for word with their times, the pre-brief answers (only if any came in), why we are here. Then four parts, one per objective, each opened by a full-bleed photo in Ross's words. Part 1: the household gap, the portfolio, competitor launches, seven trends, then a phone vote for the three that matter most. Part 2: Flavor School (taste, smell and feel; cooling; OXYD-8; how a flavor is built), the four directions on a map and one at a time, the blind tasting scored on phones (or paper), where each sample landed, then five chips each on what gets a next round. Part 3: up to three concepts typed in live, then three dots each on the ideas to develop. Part 4: white space as a day, morning to night, with where TheraBreath is today, the moment the pre-briefs say is missing, and a row per concept to mark where it could fit; then Now, Next, Later typed in live. Close: what we decided (the Playbook pages fill in from the votes and the board), what happens next, THE FLAVOR RACE, lunch. Anyone without a phone can vote by hand: click a bar or a direction to add a vote. Right arrow, space or a click goes on; left goes back; F is full screen; N shows the talking points; B blanks the screen. A reload picks up where the session is.
- Who can open what: Church & Dwight's password opens the front door, the pre-brief and the Playbook. The team link (`/t/KEY`, or the host password) also opens the presentation, the run sheet, the team page, the scorecard and THE FLAVOR RACE, and only it can move the slides, open votes or type on the board (`teamOnly` in `src/lib/auth.ts`, enforced in `src/proxy.ts` and the events route). Phones vote with their signed join link.
- Running late: `S` skips the five slides marked optional (cooling, OXYD-8, how a flavor is built, and the two directions not in the tasting), `]` and `[` jump between parts, and the talking points show how far over the current part is.
- Rehearse on `/host?code=REHEARSE` (any code other than `FOF1109` is a clean rehearsal session that never touches the live one). `/host?results=1` is a printable page of what was decided. `?still=1` is the export mode: it never writes to the session.
- `/`: the front door: the film, Ross's brief word for word with the time that answers each objective, the growth math, the four directions with photography, the blind tasting, who you will meet, the morning with objective tags, the pre-brief link, and the optional exploration drawer. The bar opens THE FLAVOR RACE, the presentation, the run sheet and the team page.
- `/team` (password, or the team link): everything built for The Flavor Factory team, starting with the rehearsal copy of the presentation, a practice copy of the pre-brief (session `PREVIEW`) and the morning.
- `/host/run` (password): the run sheet for The Flavor Factory team, two Letter pages: 9:30 setup, the run of show with its scenes and what happens, what to do after the film, and what is still to confirm.
- `/scorecard` (password): the paper tasting scorecard, the backup for anyone not scoring on a phone.
- Signing in: one password opens everything; there is no separate host step. The host password still works in the same box, and still guards the Console and the wipe.
- One source for the morning: `RUN` in `src/lib/content.ts` holds the blocks, times, objectives and scenes; `TOPICS` holds the talking points and questions for each part; `OBJECTIVES` holds Ross's four key areas of focus word for word.

The older surfaces (the session-driven Stage and Console, the session Playbook) still work at their addresses, but nothing links to them.

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Attendees and facilitators (password) | The site: the film, Ross's brief and goal, the growth math, four platforms, the sealed tasting flight, who you will meet, the morning and the pre-brief, and optional exploration tools. |
| `/survey/FOF1109?k=KEY&n=Name` | Each attendee (signed link) | The pre-brief: a personal letter, why we are here, seven trends, Ross's four objectives, the four directions, the morning and four quick questions whose answers open the session. Prints to a Letter PDF without links. |
| `/stage/FOF1109` | Not linked (password) | The old session-driven Stage, driven by the Console or the arrow keys. |
| `/console/FOF1109` | Matt, with Alex as backup (password) | Scenes, timed notes, votes, timers, teams, Bench overrides, pipeline and commitments, personal pre-brief links, export and wipe. |
| `/j/FOF1109?k=KEY` | Phones (signed link from the QR) | Follows the presentation: the trend vote, the tasting scores, the next-round chips and the dots. |
| `/playbook/FOF1109` | Everyone after the session | The Playbook, assembled from the room's decisions, with a print PDF. |
| `/host` | The TV (password) | The presentation: 35 scenes run from the presenting laptop; phones follow it. |

`FOF1109` is the live session and is set once, in `src/lib/content.ts` (`EVENT.code`). Any other code is a clean rehearsal session.

## The run of show (`RUN` in `src/lib/content.ts`, scenes in `src/lib/scenes.ts`)

| Time | Part | Phones |
| --- | --- | --- |
| 9:30 | Setup; arrival screen with the QR code | Join |
| 10:00 | Welcome, who we are, and your four objectives | |
| 10:10 | What's changing: the portfolio, the market and seven trends | Vote for three trends |
| 10:25 | Flavor School and four directions | |
| 10:40 | A blind tasting in your bases | Score each sample; five chips on the next round |
| 11:00 | From samples to concepts | Three dots on the ideas to develop |
| 11:20 | White space, then Now, Next, Later | |
| 11:40 | What we decided, next steps, THE FLAVOR RACE, lunch | |

Nobody is named as presenting any part. The executive cut (`EXECUTIVE` in `src/lib/scenes.ts`) keeps the title, the brief, the gap, the votes, the tasting, the matrix, the concepts, the board, the Playbook and next steps.

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
node verify-workshop.cjs    # the run of show, the phone votes, the lineup and the session fold
npm start                   # PLAYBOOK_PASSWORD=... to rehearse with your own password
```

Offline at the venue: `npm run offline` serves the full app on the presenter laptop at `http://localhost:3000`.

Rehearse: open `/host?code=REHEARSE` and join a phone or two from the QR code. Votes there never reach `FOF1109`. Wipe `FOF1109` from the Console the night before.

## PDFs (`deliverables/`, not deployed)

- `The-Future-of-Freshness-Pre-brief.pdf`: the 4-page pre-read for Ross to send on November 3 (regenerated October 28: every line of copy on the site, the presentation, the phones and the pre-brief rewritten to sound warmer and more conversational, with the meaning, numbers and sources unchanged).
- `The-Future-of-Freshness-Presenter-Deck.pdf`: the final to send the team, landscape Letter: a cover with the run of show, then every scene as it looks on the TV at its last build, with its number, time, objective and talking points, and a page marking where the pre-brief answers appear once they are in.
- `The-Future-of-Freshness-Deck.pdf`: the 35 scenes, blank, one 16:9 page each: the offline fallback. Save a copy to the presenting laptop with the film file.
- `The-Future-of-Freshness-Run-Sheet.pdf`: the hosts' run sheet, two Letter pages; one each for Dan, Alex, Ryan and Matt.
- `The-Future-of-Freshness-Tasting-Scorecard.pdf`: the paper scorecard, one Letter page; print one per person.

The decks are exported from the running site in export mode (`?still=1`), which never writes to the session:

```bash
node scripts/export-show.mjs https://<production-host> /t/<team key> deliverables/The-Future-of-Freshness
```

After the session, open `/host?results=1` on the presenting laptop and print it to PDF: the tasting scores, the votes, the concepts, the white-space marks and Now, Next, Later as we left them.

## Before November 9 [CONFIRM]

1. Who presents which part is not decided; the deck names nobody (October 27). The lineup, confirmed by Matt on October 27: A Blossom Mint (Grapefruit, Lavender, Rose, Spearmint, Wintergreen) and B Grove Mint (Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus) in the Fresh Breath base; C Berry Blast (Blueberry, Blackberry, Raspberry) and D the Mystery Flavor in the Kids base. Still to confirm with Ryan: the bases for each, and the Mystery Flavor's fruits for the reveal (the deck keeps Apple, Grape, Cherry, Strawberry, Lemon).
2. Flavor School wording and the OXYD-8 scene, with Ryan.
3. Attendee names and roles for the personal pre-brief links.
4. The Q3 earnings call on October 30: refresh the share and penetration scenes once the numbers are approved.
5. Next-step commitments and dates (Playbook v1.0 in 8 business days, new samples, a January 2027 review).
6. The official TheraBreath orange and logo, and a brand check of the generated Church & Dwight sign in THE FLAVOR RACE.
7. Darwin room: TV inputs, our laptop or theirs in Edge, guest Wi-Fi, and whether anyone joins remotely.

The dash check rejects em dashes and en dashes anywhere in the repo.

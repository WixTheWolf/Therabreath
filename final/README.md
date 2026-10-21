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

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Attendees and facilitators (password) | The site: the film, Ross's brief and goal, the growth math, four platforms, the sealed tasting flight (cards flip once the room reveals them), the morning, and optional exploration tools. |
| `/survey/FOF1109?k=KEY&n=Name` | Each attendee (signed link) | The pre-brief: a personal letter, the thesis and growth math, seven signals, four questions, four sealed platforms, the agenda and two minutes of homework that opens the session. Prints to a 3-page Letter PDF without links. |
| `/stage/FOF1109` | The room TV (password) | The deck: 41 scenes on a fixed 1920 x 1080 canvas, driven by the Console or the arrow keys. |
| `/console/FOF1109` | Matt, with Alex as backup (password) | Scenes, timed notes, votes, timers, teams, Bench overrides, pipeline and commitments, personal pre-brief links, export and wipe. |
| `/j/FOF1109?k=KEY` | Phones (signed link from the QR) | Voting, the tasting scorecard, the Concept Canvas, the Bench dials, dots and reactions. |
| `/playbook/FOF1109` | Everyone after the session | The Playbook, assembled from the room's decisions, with a print PDF. |
| `/host` | Facilitators | Open any surface for any code. |

`FOF1109` is the live session and is set once, in `src/lib/content.ts` (`EVENT.code`). Any other code is a clean rehearsal session.

## The run of show (`src/lib/scenes.ts`)

| Time | Scenes | Who |
| --- | --- | --- |
| 9:30 | Arrival loop: names rise into the drop as phones join | Matt |
| 10:00 | THE FLAVOR RACE premieres (V15, 3:04, 2560 x 1440) | |
| 10:03 | Welcome, July to today, Ross's brief and goal, the pre-work reveal, the thesis | Dan |
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
- **Password:** the built-in password hash is the same as the Playbook's; `PLAYBOOK_PASSWORD` overrides it. THE FLAVOR RACE film and its poster sit behind the password, since the film premieres in the room. The film (`public/media/flavor-race.mp4`) is the polished V15 at 2560 x 1440 (H.264, AAC), sized under GitHub's 100 MB file limit; how it is made is in `video/docs/session/HANDOFF.md`.

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

- `The-Future-of-Freshness-Pre-brief.pdf`: the 3-page pre-read for Ross to send on November 3.
- `The-Future-of-Freshness-Stage-Deck.pdf`: all 41 scenes at their final build step, the offline fallback.

After the session, export the leave-behind with the room's results (never during a session, because it moves the Stage):

```bash
node scripts/export-deck.mjs https://<production-host> FOF1109 <password> deliverables/Playbook-Session-Deck.pdf
```

## Before November 9 [CONFIRM]

1. Ryan's final samples, codes and base for each (October 22). Sample D, the second kids rinse, is still to be chosen.
2. Flavor School wording and the OXYD-8 scene, with Ryan.
3. Attendee names and roles for the personal pre-brief links.
4. The Q3 earnings call on October 30: refresh the share and penetration scenes once the numbers are approved.
5. Next-step commitments and dates (Playbook v1.0 in 8 business days, new samples, a January 2027 review).
6. The official TheraBreath orange and logo. In THE FLAVOR RACE the Church & Dwight monument now carries the real seal; the small seal on the building behind it is still the generated one.
7. Darwin room: TV inputs, our laptop or theirs in Edge, guest Wi-Fi, and whether anyone joins remotely.

The dash check rejects em dashes and en dashes anywhere in the repo.

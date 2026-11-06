# The Future of Freshness

**TheraBreath × The Flavor Factory | Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET**
**Darwin room, Church & Dwight, 469 N Harrison St, Princeton, NJ 08540**

One Next.js app for the whole workshop: the front door, the pre-brief, the presentation on the room's TV, the phones in the room and the team's own pages. It deploys as the Vercel project `final-future-of-freshness` with Root Directory `final`.

The name on the door is **The Future of Freshness**. What the room builds is **The Flavor Playbook**, written up and sent to everyone within 8 business days.

The morning answers Ross Conroy's invitation of September 18, 2026: his four objectives, quoted word for word, are the four parts of the morning, and his goal (new flavor experiences that both strengthen appeal with existing loyal users and attract new consumers to the franchise) stays in view throughout. Nobody is named as presenting any part.

## Pages

| Address | Who opens it | What it is |
| --- | --- | --- |
| `/` | Church & Dwight (password) | The front door: the opening film, why we're meeting, the morning in Ross's words, the four directions, the blind tasting (names sealed), who you'll meet and the pre-brief link. |
| `/survey/FOF1109?k=KEY&n=Name` | Each attendee (signed link) | The pre-brief: a personal letter and four quick questions, then optional reading. Prints to three Letter pages. |
| `/host` | The team | The presentation, run from the presenting laptop. The phones follow it. |
| `/host/presenter` | The team | The presenter window for the laptop's own screen. P in the presentation opens it. |
| `/j/FOF1109?k=KEY` | Phones (QR code on slide 1) | Follows the presentation: the trend vote, the tasting scores and the chips. |
| `/team` | The team | Everything for The Flavor Factory team on one page: the rehearsal, a practice pre-brief, the run sheet, the PDFs and both films. |
| `/host/run` | The team | The run sheet. |
| `/scorecard` | The team | The paper tasting scorecard, one Letter page per person. |
| `/host/cards` | The team | After the morning: the paper scorecards typed in. |
| `/host/writeup` | The team | The Flavor Playbook write-up, filled in from the session and saved as a PDF. |
| `/host?results=1` | The team | A printable page of what the room decided. |
| `/answers` | Matt only (owner link `/o/KEY`) | The pre-brief answers with names. A plain 404 for anyone else. |
| `/login`, `/t/KEY` | | Sign in with a password, or with the team link that signs a teammate straight in. |

Three older pages still work but nothing links to them: `/stage/FOF1109` (the session Stage the presentation replaced, team only), `/console/FOF1109` (the old Console, host password) and `/playbook/FOF1109` (the session Playbook, which shows sample names only after the room's reveal).

## Who can open what

- **Church & Dwight's password** opens the front door, the pre-brief and the session Playbook.
- **The team link** (`/t/KEY`, or the host password) opens everything else: the presentation, the presenter window, the run sheet, the team page, the scorecard, the PDFs and THE FLAVOR RACE. Only it can move the slides, open votes or change the board (`teamOnly` in `src/lib/auth.ts`, enforced in `src/proxy.ts` and the events route).
- **Phones** vote with the signed join link in the QR code. **The pre-brief** opens with its own signed link, which also reaches the opening film and its captions.
- **The pre-brief answers with names** are for the owner only (see below).

Every page is noindex, and there are no analytics.

## The presentation

22 slides on a fixed 1920 × 1080 canvas. Slide 5 only appears once at least one pre-brief answer is in, so the deck runs 21 slides until then.

| # | Slide | Builds |
| --- | --- | --- |
| 1 | The Future of Freshness: the title and the QR code; first names appear as phones join | 0 |
| 2 | Who we are, since July (the July row is optional) | 1 |
| 3 | Our flavors in your range: 14 TheraBreath rinses with our flavors, as bottle photos | 0 |
| 4 | Your four objectives: all four, then Ross's goal | 1 |
| 5 | Your pre-brief answers | 2 |
| 6 | Part 1: What's changing | 0 |
| 7 | Out of every 100 households | 3 |
| 8 | The shelf | 2 |
| 9 | Seven trends: vote, then discuss (phone vote) | 3 |
| 10 | Part 2: Where flavor could go | 0 |
| 11 | Flavor School: flavor and sodium chlorite | 2 |
| 12 | Four directions (the two not in the tasting get a short card each, since they're on the chips) | 4 |
| 13 | THE FLAVOR RACE, right before the tasting | 0 |
| 14 | The blind tasting (scores on phones; the names flip at build 2) | 2 |
| 15 | What deserves the next round: where each sample landed, then five chips each | 2 |
| 16 | Part 3: What we could make | 0 |
| 17 | Where TheraBreath fits in a day | 3 |
| 18 | Concepts | 0 |
| 19 | Part 4: What to do first | 0 |
| 20 | Now, Next, Later | 0 |
| 21 | What we decided and what happens next | 7 |
| 22 | Thank you | 0 |

- **Keys:** right arrow, space or a click goes on; left goes back; `]` and `[` jump between parts; `S` is the short version (it skips the optional builds); `F` is full screen; `N` shows the talking points on the TV; `P` opens the presenter window; `B` blanks the TV; on the trends slide, `1` to `7` open that trend for more discussion (the same key again, `0` or `Esc` goes back).
- **The presenter window** shows the talking points, the next slide and the clock against the run of show, and its buttons move the presentation. Hand votes for anyone without a phone, the paper scorecard count, the concept cards and Now, Next, Later all go in there by tapping. Nothing is typed on the day. Both windows must be open in the same browser (`src/lib/showLink.ts`).
- **The tasting stays blind:** sample names are sealed on every attendee screen until the room flips them at build 2 of slide 14. The scores stay hidden until everyone has finished, and scoring closes when they go up.
- **Rehearse** on `/host?code=REHEARSE`. Any code other than `FOF1109` is a separate practice session that never touches the live one. A rehearsal with no pre-brief answers of its own shows the live answers on slide 5 (read only, without names). "Refresh the rehearsal" on the team page clears it for the next run.
- **One window drives:** only the presentation window on the session's latest move acts on its own (the vote locks, the reveal and hiding the names again in a rehearsal, the starter concept cards). Another window left open on a different slide stays passive. On the day, still open the presentation on the presenting laptop only, because any window that moves the slides moves everyone's phones.
- **Where it lives:** `src/components/ShowApp.tsx` runs the slides (in `src/components/show/` and `src/components/scenes/`), `src/components/PresenterApp.tsx` is the presenter window and `src/lib/scenes.ts` holds the run of show. The talking points (`src/lib/sceneNotes.ts`) and the run sheet's notes (`src/lib/runNotes.ts`) are imported only by team pages, so attendee pages never load them.

## The run of show

`RUN` in `src/lib/content.ts` is the one source for the blocks and times on the front door, the pre-brief, the presentation and the run sheet.

| Time | Block | Phones |
| --- | --- | --- |
| 9:30 | Setup; the arrival screen with the QR code | Join |
| 10:00 | Welcome, who we are and your four objectives | |
| 10:10 | What's changing: your portfolio, the market and seven trends (objective 01) | Vote for three trends |
| 10:25 | Flavor School, then four directions; THE FLAVOR RACE at 10:37 (objective 02) | |
| 10:40 | A blind tasting in your bases (objective 02) | Score each sample; five chips |
| 11:00 | From samples to concepts (objective 03) | |
| 11:20 | White space, then Now, Next, Later (objective 04) | |
| 11:40 | What we decided and what happens next | |

The tasting, in order: A Berry Blast and B the Mystery Flavor in the Kids base, then C Blossom Mint and D Grove Mint in the Fresh Breath base. `SAMPLES` in `src/lib/content.ts` holds only the codes and bases; the names are kept apart and only reach screens at the reveal.

## The pre-brief answers

- **Names: only the owner.** `/answers` opens after the owner link, `/o/KEY`, where `KEY` is `PLAYBOOK_OWNER_KEY` (at least 20 characters), set on the Vercel project and nowhere else. Without it the page doesn't exist.
- **The team and the TV get the answers without names** (`src/lib/server/redact.ts`), under a stand-in that can't be matched to anyone's phone.
- **Everyone else gets nothing:** the pre-brief pages and the phones only see that an answer arrived.
- **A wipe keeps them.** Clearing a session (`src/app/api/s/[code]/wipe/route.ts`) removes joins, votes, scores and the board, then puts each person's latest pre-brief answer back.
- The repository is public, so real answers never go into a file here, including the PDFs.

## Data

Every interaction is an event in one log per session, folded into the session's state (`src/lib/state.ts`).

- **Store** (`src/lib/server/store.ts`): in production, the `pb_events` table in the `flavor-playbook` Supabase project, through the Postgres URL that Vercel's Supabase integration provides. The table has row-level security on and no grants for the public roles, so only the site's server can read or write it. Without a Postgres URL the app falls back to the key-checked database functions `fof_list` and `fof_append`; `STORE=memory` keeps everything in memory for local tests.
- **Updates:** screens poll the event log, and Supabase Realtime (`NEXT_PUBLIC_SUPABASE_URL` and the public key) makes them faster when it's configured. Phone taps queue on the phone and resend after a dropped connection.
- **Passwords and keys:** two built-in password hashes in `src/lib/auth.ts`, overridden by `PLAYBOOK_PASSWORD` (Church & Dwight) and `PLAYBOOK_HOST_PASSWORD` (the team). `PLAYBOOK_TEAM_KEY` replaces the team link's key, and `PLAYBOOK_OWNER_KEY` turns on the answers page. Cookies and signed links use `PLAYBOOK_SECRET`, or on Vercel a key derived from the database connection string, never the hashes in this repository.

## The films

- **The opening film** (1:22) plays on the front door and the pre-brief, never in the room. There are two cuts with their own endings and English captions: `public/media/opening.*` for the front door and `public/media/opening.brief.*` for the pre-brief (`FILM` in `src/lib/content.ts`). Its source and the commands that build it are in `video/docs/fof/V5.md`.
- **THE FLAVOR RACE** (`public/media/flavor-race.mp4`, 2:24) plays at 10:37, right before the tasting, and only the team link can open it before then. Keep a copy on the presenting laptop.

Neither film is recut without the team's go-ahead.

## PDFs

Served to the team at `/files/<name>` from `public/files/` and linked from the team page. The room password can't open them, because the decks show the sample names.

| File | Pages | What it is |
| --- | --- | --- |
| `The-Future-of-Freshness-Presenter-Deck.pdf` | 34 | A cover with the run of show, then every slide with its time and talking points |
| `The-Future-of-Freshness-Deck.pdf` | 31 | Every slide as the TV shows it, 16:9: the offline backup, with a blind tasting page before the reveal |
| `The-Future-of-Freshness-Run-Sheet.pdf` | 7 | The run sheet, one for each of the four hosts |
| `The-Future-of-Freshness-Pre-brief.pdf` | 3 | The pre-read |
| `The-Future-of-Freshness-Tasting-Scorecard.pdf` | 1 | The paper scorecard, one per person |

The decks come from the running site in export mode (`?still=1`), which never writes to a session. Export from a local build with no real answers in it, so slide 5 stays a placeholder page:

```bash
STORE=memory PLAYBOOK_HOST_PASSWORD=<team password> npm start
node scripts/export-show.mjs http://localhost:3000 <team password> public/files/The-Future-of-Freshness
```

The run sheet, the scorecard and the pre-brief are printed from their pages (`/host/run`, `/scorecard` and the pre-brief) with the browser's print to PDF.

## Run it

```bash
npm install
npm run build             # runs the dash check first
npm test                  # password gate, join links and sealed sample names (18 tests)
node verify-workshop.cjs  # the run of show, the slides, the phone votes, the lineup and the session fold
npm start                 # STORE=memory to keep everything local
```

`npm run offline` serves the full app on the presenting laptop at `http://localhost:3000` if the venue's network fails.

Other scripts: `scripts/check-dashes.mjs` (no em or en dashes anywhere; it runs before every build) and `scripts/bottle-cutout.cjs` (how the bottle photos on slide 3 were cut out).

## House rules

- No em dashes or en dashes anywhere: copy, code, comments or commit messages.
- Ross's objectives and goal are quoted word for word. Every number carries its source.
- No formula details (usage levels, flavor codes) on any slide, page, PDF or talking point.
- Sample names stay sealed on every attendee surface until the reveal.
- Leave the live session `FOF1109` alone: it holds the pre-brief answers. Test on `REHEARSE`.
- `PRODUCT.md` is the product record behind the design. `plans/` holds the open fix plans from the November 3 design audit (two are worth doing before the day).

## Still to confirm before November 9

The run sheet carries most of this list too (`CONFIRM` in `src/app/host/run/page.tsx`).

1. Ryan to review the Flavor School slide (slide 11) and its talking points.
2. Slide 3: the bottles and flavor names against our portfolio record, and the claim that our flavors are in 14 TheraBreath rinses on shelf today against our current customer records.
3. Slide 2's July themes (Resiliency, Innovation, Operations, Partnership) against the team's record of the Norco visit.
4. The drafted concept cards and option lists in `src/lib/conceptLibrary.ts`. Every starter card is marked DRAFT, and the room sees them as proposals.
5. Ryan to confirm each sample's name, its base and what's in it as the phones show it after the reveal, and that the samples were made in the unflavored bases Church & Dwight sent.
6. Whether to tell the room what's in the Mystery Flavor once the names go up.
7. The commitments on slide 21: the write-up within 8 business days and the next samples in January 2027 (kept for now).
8. A video call with Ross before the day.
9. On the presenting laptop: download the current PDFs and THE FLAVOR RACE, and run the presentation once on the actual TV.
10. Slide 8's range is as listed on therabreath.com and three retailer listings on November 4, so the US range. Check it's still current.
11. Shelf life, stability and sensory performance: only what Ryan can back with data, on screen or out loud.
12. Owners: which of us takes each kind of direction forward. The C&D reviewers are confirmed in the room, by name.
13. The room, with Ross: numbers and seating for the tasting, who pours and serves, how many phones join at once, the mobile signal in the Darwin room, whether the TV reads from the back row, and the speaker volume for THE FLAVOR RACE.

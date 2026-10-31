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

- `/host` (password): the presentation, 35 scenes on a fixed 1920 x 1080 canvas (36 once pre-brief answers exist), run from the presenting laptop and driving the live session, so phones follow it (`src/components/ShowApp.tsx`, scenes in `src/components/show/ShowScenes.tsx` and `src/components/scenes/`, run of show in `src/lib/scenes.ts`). Welcome: arrival with the QR code and the count of phones joined, the title, who we are, July to today, the four objectives word for word with their times, the pre-brief answers (only if any came in), why we are here. Then four parts, one per objective, each opened by a full-bleed photo in Ross's words. Part 1: the household gap, the portfolio, competitor launches, seven trends, then a phone vote for the three that matter most. Part 2: Flavor School (taste, smell and feel; cooling; OXYD-8; how a flavor is built), the four directions on a map and one at a time, the blind tasting scored on phones (or paper), where each sample landed, then five chips each on what gets a next round. Part 3: up to three concepts typed in live, then three dots each on the ideas to develop. Part 4: white space as a day, morning to night, with where TheraBreath is today, the moment the pre-briefs say is missing, and a row per concept to mark where it could fit; then Now, Next, Later typed in live, one row per direction with its TFF owner, C&D reviewer, base and next sample (`plan` events; `src/components/show/Plan.tsx`). Close: what we decided (the Playbook fans out, then opens one chapter per build at reading size: the trends, the directions with the tasting, the concepts and the plan with its owners, then closes into the cover), what happens next (the plan's first rows), THE FLAVOR RACE at about 11:48 (it starts when the presenter moves onto it; Space or K pauses and plays it, R starts it again, and its closing card stays up when it ends), and lunch with the Now rows still on screen. End goes straight to lunch, so the film can be skipped without losing anything. On the phones and in the PDF deck the film's slide is neutral ("Before lunch", and the closing card on paper), so nothing outside the team's pages names it. Right arrow, space or a click goes on (a click never moves on where there are boxes to type in); left goes back; F is full screen; N shows the talking points on the TV itself; P opens the presenter view; B blanks the screen. A reload picks up where the session is.
- `/host/presenter` (team link): the presenter view, for the laptop's own screen with the TV as an extended display; P in the presentation opens it (`src/components/PresenterApp.tsx`, linked over a BroadcastChannel by `src/lib/showLink.ts`, so both windows must be in the same browser). It shows the talking points, the build, the next slide, Eastern time against the run of show with how far over the part is, and whether the short version is on; its buttons and the same keys move the presentation. It is where hand votes go in for anyone without a phone (a button per option to add one and to take the latest back), where paper scorecards are typed in on the tasting (a card can be removed), and where Now, Next, Later can be typed instead of on the TV. On THE FLAVOR RACE it shows the film's clock and has Play or Pause, Start again, Skip to Lunch and Back to What happens next (and Sound on, if the browser started it muted); on What happens next, a button skips the film altogether. Nothing on it shows on the TV.
- Who can open what: Church & Dwight's password opens the front door, the pre-brief and the Playbook. The team link (`/t/KEY`, or the host password) also opens the presentation, the run sheet, the team page, the scorecard and THE FLAVOR RACE, and only it can move the slides, open votes or type on the board (`teamOnly` in `src/lib/auth.ts`, enforced in `src/proxy.ts` and the events route). Phones vote with their signed join link.
- Running late: `S` skips the five slides marked optional (cooling, OXYD-8, how a flavor is built, and the two directions not in the tasting), `]` and `[` jump between parts, and the presenter view shows how far over the current part is. Every clock reads Eastern time, wherever the laptop's clock is set.
- Rehearse on `/host?code=REHEARSE` (any code other than `FOF1109` is a clean rehearsal session that never touches the live one). `/host?results=1` is a printable page of what was decided. `?still=1` is the export mode: it never writes to the session.
- `/`: the front door: the film (with Answer the pre-brief beside it, for anyone who would rather skip it), Ross's brief word for word with the time that answers each objective, the growth math (a source under each number, and source notes with the survey behind the 54%), the four directions with photography, the blind tasting (A and B in the Fresh Breath base, C and D in the Kids base, names sealed until everyone has scored, and how each one is scored), From sample to next step (`src/components/Decisions.tsx`: taste, score, reveal, discuss, vote, assign, and the six things every direction leaves with), who you will meet, the morning with objective tags, the pre-brief link, and the optional exploration drawer. For the team only, the bar opens THE FLAVOR RACE, the presentation, the run sheet and the team page (`src/components/HostBar.tsx` and `RaceModal.tsx`, loaded only when the team link is in, so the front door's code never names the film).
- `/team` (password, or the team link): everything built for The Flavor Factory team, starting with the rehearsal copy of the presentation, a practice copy of the pre-brief (session `PREVIEW`) and the morning.
- `/host/run` (password): the run sheet for The Flavor Factory team, three Letter pages: 9:30 setup (including the film backup on the laptop), an at-a-glance run of show with each block's owner (still "To assign"), technology and materials, expected output and the transition after the tasting, the tasting-table checklist, the full run of show with its scenes and what happens, what to do after the morning, and what is still to confirm.
- `/scorecard` (password): the paper tasting scorecard, the backup for anyone not scoring on a phone, with the same questions the phones ask. Cards are typed into the presenter view on the tasting slide, and the TV counts them apart from the phones.
- Signing in: one password opens everything; there is no separate host step. The host password still works in the same box, and still guards the Console and the wipe.
- One source for the morning: `RUN` in `src/lib/content.ts` holds the blocks, times, objectives and scenes; `TOPICS` holds the talking points and questions for each part; `OBJECTIVES` holds Ross's four key areas of focus word for word. What only the team reads lives apart, so attendee pages never load it: each scene's talking points and team title in `src/lib/sceneNotes.ts`, and each block's slides, steps, kit and output for the run sheet in `src/lib/runNotes.ts`. Import those only from team pages.

The older surfaces (the session-driven Stage and Console, the session Playbook) still work at their addresses, but nothing links to them.

## Accessibility and polish (October 28)

A pass over every page with automated checks (axe-core for WCAG 2.2 AA, Lighthouse, and a script for tap targets, focus rings, phone overflow and reduced motion), plus design and copy reviews of the screenshots.

- Contrast: secondary and tertiary text in both themes, and every small teal label, now pass WCAG AA (4.5:1). The bright teal (`--teal`, `--accent`) stays for large type, rules and fills; small text uses `--teal-ink` / `--accent-ink` (`#1F6C82`), which the pre-brief and the run sheet also print in. The slides keep their look, with labels that read better on a TV in a bright room.
- Keyboard and touch: a visible focus ring everywhere, rings on the password and name fields, chapter links of at least 24px, and 44px buttons on the phone voting screens.
- Structure: one h1 on every page and phone screen, and tab titles that say which page is which (`Run sheet | The Future of Freshness`).
- Phones: the front door keeps both names in the lockup and darkens the bottom of the hero so the copy reads over the splash. The hero loop has a portrait cut for phones (`public/media/loop-portrait.mp4`, 3 MB instead of 8.5 MB).
- Small fixes: one name for the film button ("Watch the film"), a sign-in error that says what to do, a tab and home-screen icon (`src/app/icon.svg`, `apple-icon.png`, `favicon.ico`), fonts preloaded, logos sized, and the "next round" slide no longer greys out every option before anyone has voted.
- A second pass with Impeccable (`PRODUCT.md` holds its product record): its anti-pattern detector run on the source and on every rendered surface (front door, pre-brief, team page, run sheet, scorecard, phone screens and the slides). Fixed: nothing readable below 12px on screen, the envelope questions as sentences that fit at 360px, dark lettering on the wax seals, Ross's goal and the pre-brief letter at a readable measure, input placeholders at AA, the Flavor School circles and the white-space "Open" tags at AA, label shadows over the opener photos, the caret, link underlines and a matching scrollbar on the light pages, a reconnecting notice on phones (votes already queue on the phone and resend), and the setup checklist in two columns. What the detector still lists is the chosen look (the italic title, the small labels above headings, Cloud Dancer, the colored top edges, Geist) and print sizes on paper.
- Lighthouse on a phone, front door: performance 77 to 82, accessibility 96 to 100, best practices 96 to 100, first paint 3.5s to 2.4s, page weight 5.8 MB to 3.6 MB. (SEO stays low on purpose: every page is noindex.)

## The opening film

`FILM` in `src/lib/content.ts` names the file for each cut and how long it runs: the site's (`public/media/opening.*`) and the pre-brief's (`public/media/opening.brief.*`). Each plays with English captions from the `.vtt` beside it (the player's CC button), and the pre-brief and its signed link reach the captions the same way they reach the film. When the film ends on the pre-brief, the page goes straight to the four questions, with the first one ready to answer; on the front door, an end card covers the last frame with Open the pre-brief (focused), Watch again and Back to the page. Both pages offer a way past the film: Skip to the four questions on the pre-brief, Answer the pre-brief on the front door. The opening film is for before the day only: the morning opens with our own welcome, and no slide plays it. The pre-brief letter quotes Ross's goal from `ROSS_GOAL` instead of paraphrasing it.

The player (`src/components/FilmModal.tsx`) has a visible Close button and closes on Escape or a click outside; focus stays inside it while it's open and returns to the button that opened it. Its Transcript button shows the words as text, read from the same caption file, so the transcript is gated like the film and always matches what she says. With reduced motion on, the pre-brief and the front door show the poster instead of the hero loop. For the room, the run sheet says to keep THE FLAVOR RACE on the laptop as a file the day before (the team page links it), and to check its sound and picture on the rehearsal session before anyone arrives.

Both cuts are V5, the pre-brief intro (1:22): `video/docs/fof/V5.md` has the script, the beats and the one command that turns a take into both cuts, their captions and the poster. The site's cut asks for "the four quick questions in your pre-brief"; the pre-brief's for the ones "on this page".

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Attendees and facilitators (password) | The site: the film, Ross's brief and goal, the growth math, four platforms, the sealed tasting flight, who you will meet, the morning and the pre-brief, and optional exploration tools. |
| `/survey/FOF1109?k=KEY&n=Name` | Each attendee (signed link) | The pre-brief: a personal letter, why we are here in three sourced numbers, then the four quick questions whose answers open the session ("Answer these four questions first. The rest is optional pre-reading."). Below them, marked optional: how the morning decides (From sample to next step), seven trends, Ross's four objectives, the four directions and the morning. The questions say what's missing when Next is pressed too early, and once sent they say whether the answers went or are waiting on the device to resend. Prints to four Letter pages without links. |
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

Rehearse: open `/host?code=REHEARSE` and join a phone or two from the QR code. Votes there never reach `FOF1109`. Leave `FOF1109` alone the night before: it holds the pre-brief answers. A wipe from the Console clears the joins, votes, scores and board and keeps the pre-brief answers (`src/app/api/s/[code]/wipe/route.ts`).

## PDFs (`public/files/`, team only)

The site serves these to the team link (or the host password) at `/files/<name>`, and the team page links each one. The room password alone can't open them: the decks show the sample names.

- `The-Future-of-Freshness-Pre-brief.pdf`: the 4-page pre-read for Ross to send on November 3 (regenerated October 28: every line of copy on the site, the presentation, the phones and the pre-brief rewritten to sound warmer and more conversational, with the meaning, numbers and sources unchanged).
- `The-Future-of-Freshness-Presenter-Deck.pdf`: the final to send the team, landscape Letter: a cover with the run of show, then every scene as it looks on the TV at its last build, with its number, time, objective and talking points, and a page marking where the pre-brief answers appear once they are in.
- `The-Future-of-Freshness-Deck.pdf`: the 35 scenes, blank, one 16:9 page each: the offline fallback. Save a copy to the presenting laptop with the film file.
- `The-Future-of-Freshness-Run-Sheet.pdf`: the hosts' run sheet, three Letter pages; one each for Dan, Alex, Ryan and Matt.
- `The-Future-of-Freshness-Tasting-Scorecard.pdf`: the paper scorecard, one Letter page; print one per person.

The decks are exported from the running site in export mode (`?still=1`), which never writes to the session:

```bash
node scripts/export-show.mjs https://<production-host> /t/<team key> public/files/The-Future-of-Freshness
```

After the session, open `/host?results=1` on the presenting laptop and print it to PDF: the tasting scores, the votes, the concepts, the white-space marks and Now, Next, Later as we left them.

The write-up we promise within 8 business days is `/host/writeup` (team only): the Flavor Playbook as a designed Letter or A4 document that fills in from the live session (pre-brief answers, trend vote, tasting, chips, concepts, dot vote, white-space marks, Now, Next, Later) with boxes for our summary and a note on each objective, saved to the session as `note` events. Its bar shows the send-by date and what's still missing; Save as PDF prints it. `?code=REHEARSE` is a practice copy, marked as one on every page. Sample names appear only once the presentation has revealed them.

## Before November 9 [CONFIRM]

1. Who presents which part is not decided; the deck names nobody (October 27). The lineup, confirmed by Matt on October 27: A Blossom Mint (Grapefruit, Lavender, Rose, Spearmint, Wintergreen) and B Grove Mint (Spearmint, Peppermint, Wintergreen, Rosemary, Ylang Ylang, Eucalyptus) in the Fresh Breath base; C Berry Blast (Blueberry, Blackberry, Raspberry) and D the Mystery Flavor in the Kids base. Still to confirm with Ryan: the bases for each, and the Mystery Flavor's fruits for the reveal (the deck keeps Apple, Grape, Cherry, Strawberry, Lemon).
2. Flavor School wording and the OXYD-8 scene, with Ryan.
3. Attendee names and roles for the personal pre-brief links.
4. The Q3 earnings call on October 30: refresh the share and penetration scenes once the numbers are approved.
5. Next-step commitments and dates (Playbook v1.0 in 8 business days, new samples, a January 2027 review).
6. The official TheraBreath orange and logo, and a brand check of the generated Church & Dwight sign in THE FLAVOR RACE.
7. Darwin room: TV inputs, our laptop or theirs in Edge, guest Wi-Fi, and whether anyone joins remotely.

The dash check rejects em dashes and en dashes anywhere in the repo.

# The Flavor Playbook (live workshop app)

TheraBreath × The Flavor Factory, November 9, 2026, 10:00 to 12:00, Darwin room.
An alternate to The Future of Freshness. Confidential: password protected, noindex, no analytics.

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Facilitators | Pick a session code and open a surface. `TB1109` is the live session; any other code is a clean rehearsal. |
| `/stage/CODE` | The LED or projector | 44 scenes on a fixed 1920 x 1080 canvas, scaled to any screen. Arrows or space step, B blanks, F full screen. Add `?console=1` for Stage and Console side by side. |
| `/console/CODE` | Matt and Ryan | Scenes, builds, notes, votes (open, lock, reveal, reset), timers, missions, pipeline and calendar placement, paper mode, executive run, Simulate 12, JSON and CSV export, wipe. |
| `/j/CODE?k=KEY` | Every phone | Joined from the QR on the Arrival scene. The key is signed, so phones never need the password. |
| `/survey/CODE?k=KEY` | Pre-work | The three-question survey. The link is shown at the bottom of Console. |
| `/playbook/CODE` | Everyone after | The document the room built, live. Save as PDF in Letter or A4. |

## Data

Every tap is an event in an append-only log; every surface folds the same log into the same state (`src/lib/state.ts`).

* **Store.** Postgres when `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` or `DATABASE_URL` is set (the table creates itself). Without one the store is in memory, which is fine locally but **not on Vercel**, where each function instance has its own memory. Connect Supabase (or Neon) to the Vercel project before rehearsing there.
* **Realtime.** Polling always runs. With `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, Supabase Realtime broadcast nudges every screen instantly.
* **Offline.** Taps are queued in a local outbox and sent when the network comes back.

## Settings

* `PLAYBOOK_PASSWORD` overrides the built-in password (only its SHA-256 is in the code).
* `PLAYBOOK_SECRET` optionally signs cookies and join links with a separate secret.

## Build

```
npm install
npm run build   # fails if an em or en dash appears anywhere in the repo
npm start
```

`design/` holds the discovery pack (style frames, motion tests, PDF) and is not deployed.

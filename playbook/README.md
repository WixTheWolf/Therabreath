# The Flavor Playbook - live workshop app

**Future of Freshness | TheraBreath x The Flavor Factory**  
**Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET | Darwin room | Church & Dwight, New Jersey**

This is the live, interactive layer of the Future of Freshness workshop. It turns the presentation into a working session where the room can react, taste, vote, build concepts, prioritize a pipeline, and leave with a playbook created from the session.

It is not a separate or competing workshop concept. It is the **participatory system inside the November 9 Future of Freshness experience**.

## Surfaces

| Route | Who | What |
| --- | --- | --- |
| `/` | Facilitators | Choose a session code and open a workshop surface. `TB1109` is the live session; other codes are for rehearsal. |
| `/stage/CODE` | Projector / room display | Main workshop scenes on a fixed 1920 x 1080 canvas. |
| `/console/CODE` | Facilitators | Scenes, notes, votes, timers, teams, Bench controls, pipeline, export, and reset tools. |
| `/j/CODE?k=KEY` | Participants | Signed phone link for voting and workshop interaction. |
| `/survey/CODE?k=KEY` | Pre-work | Participant pre-brief / survey. |
| `/playbook/CODE` | Team after the session | The working document assembled from the room's decisions. |

## Workshop framework

The app is built around the four November objectives:

1. Trends
2. Territories
3. Concepts
4. Pipeline

The broader Future of Freshness experience features six headline flavor directions: Arctic Yuzu, Green Tea Cucumber, Ginger Lime, Grapefruit Rose Mint, Pear Cardamom Mint, and Chamomile Vanilla Mint. The live app can also explore additional territory ideas and provocations; those should be treated as workshop exploration, not as a replacement for the six headline directions.

## Data

Every interaction is stored as an event and folded into shared session state.

- **Store:** use Postgres / Supabase or another supported database for a real hosted session. In-memory storage is only appropriate for local testing.
- **Realtime:** polling always runs; Supabase Realtime can provide faster cross-screen updates when configured.
- **Offline:** participant taps can queue locally and send when the connection returns.

## Settings

- `PLAYBOOK_PASSWORD` overrides the built-in password hash behavior.
- `PLAYBOOK_SECRET` can sign cookies and participant join links with a separate secret.

## Build

```bash
npm install
npm run build
npm test
npm start
```

The repo check intentionally rejects em dashes and en dashes. Keep workshop copy in plain hyphen style so CI stays clean.

## Before November 9

Rehearse the entire room flow on the actual presentation hardware and network. Clear rehearsal data before the live session. Anything marked `[CONFIRM]` in workshop content should be approved or intentionally removed before the final run.

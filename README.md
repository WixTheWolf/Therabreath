# The Future of Freshness

**TheraBreath × The Flavor Factory | Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET**
**Darwin room, Church & Dwight, 469 N Harrison St, Princeton, NJ 08540**

A two-hour workshop for Church & Dwight's Oral Care R&D leadership team, built around Ross Conroy's four objectives (emerging trends; new flavor territories and sensory experiences; concepts for new occasions and consumers; a pipeline for incremental growth). The room tastes four blind samples made in TheraBreath's own bases, picks what deserves a next round and leaves with The Flavor Playbook.

## Where the current work is

**[`final/`](final/README.md)** is the workshop: the front door, the pre-brief, the presentation on the room's TV, the phones and the team's pages, in one Next.js app. It deploys as the Vercel project `final-future-of-freshness` (Root Directory `final`). Start with [`final/README.md`](final/README.md).

Work happens on the branch `claude/fof-17-slides` (draft PR #8), and production for `final-future-of-freshness` is deployed from it.

## The rest of the repository

Nothing below is used by `final/` except the film sources in `video/`. The other folders still back their own Vercel projects, so they stay until those projects are retired.

| Path | What it is | Vercel project | Status |
| --- | --- | --- | --- |
| `video/` | Remotion sources, scripts and notes for the opening film and THE FLAVOR RACE. The rendered films the site plays are in `final/public/media/`. | none | Source for the films |
| `simple/` | A simplified copy of `final/` from November 3 | `simple-future-of-freshness` | Not in use |
| `playbook/` | The earlier live workshop app (Stage, Console and phones) that `final/` grew out of | `therabreath-flavor-innovation-workshop-experience-d2` | Superseded |
| `freshness/` | The earlier static narrative with six headline directions (Arctic Yuzu and others) | none | Superseded: the directions and the tasting now live in `final/src/lib/content.ts` |
| `index.html`, `classic.html`, `assets/`, `site/`, `brief/`, `deck/`, `lab3d/`, `scripts/` | The first static prototype of the site, deck and pre-brief, with its PDF helpers | `therabreath`, `future-of-freshness` (both build from the repository root) | Superseded |
| `build_booklet.py`, `dist/` | The July 2026 capabilities workshop booklet and an early deck PDF | none | Legacy |
| `.github/workflows/dash-check.yml` | CI on every push: the dash check across the repository and the `playbook/` sign-in tests | | Active |

## Rules for everything here

- **The repository is public.** The sites are password protected and noindex, but anything committed here can be read by anyone. Never commit pre-brief answers, passwords, keys or team links.
- No TheraBreath or The Flavor Factory formula details (usage levels, flavor codes) anywhere.
- Sample names stay sealed on every attendee surface until the room's reveal.
- No em dashes or en dashes anywhere: copy, code, comments or commit messages. The dash check enforces it.

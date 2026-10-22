# The Future of Freshness: opening film

V1, superseded on October 22, 2026 by V2 (`V2.md`, `src/FutureOfFreshnessV2.tsx`). Kept for reference.

The film on the pre-brief and the site (`final/public/media/opening.mp4`). 1:18, 1920 x 1080, 30 fps, -16 LUFS.
Composition: `src/FutureOfFreshness.tsx` (`FutureOfFreshness`, and `FutureOfFreshnessLoop` for the hero background).
Mix: `scripts/fof_mix.py`. The room premiere on November 9 is still THE FLAVOR RACE (`flavor-race.mp4`); this film is the pre-read.

## Look
"Clarity, refracted." TheraBreath is clear and dye-free, so color only ever comes from light: drops, glass, prisms.
Cloud Dancer white for most shots, deep ink for Flavor School. Type matches the site and the deck: Newsreader for
display, Geist Mono for labels. Real TheraBreath and The Flavor Factory logos, unaltered, on a white field at the end.
No faces, no bottles, no packs, no product claims.

## Rules this film keeps
- Blind tasting stays blind: no sample names, no sample ingredients. Only the four platform names, which the pre-brief already shows.
- No formula details. OXYD-8 is named only as the public name of TheraBreath's system.
- No next-step dates (still to confirm). No number without its source on screen.
- No em dashes or en dashes.

## Script

| Time | Picture | Voice | On screen | Source |
|---|---|---|---|---|
| 0:00 | A clear drop forms on a pipette and falls | | TheraBreath × The Flavor Factory | |
| 0:01 | The drop lands in a crown of clear liquid | TheraBreath took away the burn. | TheraBreath took away the burn. | Workshop thesis (Stage scene "thesis") |
| 0:05 | Clear liquid swirls; light splits into color | Now, let's add the want. | Now let's add the *want.* | Workshop thesis |
| 0:11 | Two glasses fill to exactly 65% and 14% | Mouthwash is in 65 of every 100 American homes. TheraBreath is in 14. | 65% Mouthwash category, 14% TheraBreath, household penetration, source line | Church & Dwight Q2 2026 earnings call, July 31, 2026 |
| 0:19 | A field of droplets; one catches the light | That leaves 86 to meet. And flavor is how we introduce ourselves. | 86 of every 100 US households have not met TheraBreath yet. / Flavor is how we introduce ourselves. | Brief 2.4 (100 minus 14) |
| 0:25 | Morning light on a flavor lab bench | In July, you came to Norco to see who we are. | July 2026 · Norco, California / You came to see who we are. | Brief 2.3; Ross, September 18 ("our visit to The Flavor Factory") |
| 0:29 | A mint sprig in a cube of clear water | Now you've asked for more: | Your brief / Now you've asked for more. | |
| 0:32 | Ross's words on a field of soft light | new flavor experiences that strengthen your appeal with loyal users, and attract new consumers to the franchise. | "strengthen our appeal with existing loyal users and create opportunities to attract new consumers to the franchise." Ross Conroy, Church & Dwight Oral Care R&D, workshop invitation, September 18, 2026 | Ross's invitation, verbatim |
| 0:38 | White light through a prism | So on November 9th, we bring seven signals shaping oral care. | Monday, November 9 · Chapter 1 · Signals / Seven signals shaping oral care. / You pick three. | Agenda 10:10 |
| 0:43 | Frost grows on dark glass | Flavor School: how cooling works, | Flavor School / How cooling works. | Agenda 10:27 |
| 0:45 | Oxygen bubbles rise in a beaker | and how flavor survives OXYD-8. | How flavor survives OXYD-8. | Agenda 10:27 |
| 0:48 | Herbs and frost; citrus in sun; cucumber and tea; playful color | Four platforms. | Chapter 2 · Territories / 01 Plant-Powered Freshness, 02 Global Brightness, 03 Modern Clean, 04 Next-Generation Kids | Platforms on the pre-brief |
| 0:53 | Four clear tasting cups | And a blind tasting, made in your own bases. | Blind tasting · Samples A to D / Made in your Fresh Breath and Kids bases. | Agenda 10:35; Ross, October 5 (the bases) |
| 0:56 | Hands add a drop to a beaker | Two teams build concepts, and tune them on The Bench. | Chapter 3 · Concepts / Two teams build. Tune on The Bench. Pitch. Vote. | Agenda 11:06 |
| 1:00 | Three glasses recede down a long table | Then a pipeline: now, next and future, with owners and dates. | Chapter 4 · Pipeline / Now, Next, Future / With owners and dates. | Agenda 11:36 |
| 1:06 | A blank book; then the Playbook cover | And by noon, a Flavor Playbook, with your names on the cover. | By noon / A Flavor Playbook with your names on the cover. Cover: The TheraBreath Flavor Playbook v0.1, Co-authored November 9, 2026, Princeton, New Jersey, blank co-author lines | Agenda 11:50; close scene |
| 1:11 | A floating sphere of clear liquid | The future of freshness. Let's build it together. | The Future of Freshness / Let's build it together. / Monday, November 9, 2026 \| 10:00 AM to 12:00 PM ET · Princeton, New Jersey / logos | EVENT strings |

## Making it
- Stills: GPT Image 2.5 (Higgsfield), 2K, one art direction across all frames. Motion: Kling 3.0 Pro, image to video, silent.
  The glasses are not generated motion: an empty and a filled still are masked in Remotion so the levels are exact.
- Voice: ElevenLabs v4, "Elizabeth Anne". Score: ElevenLabs Music v2.5, lengthened by four bars at 122.3 BPM.
  Effects: the ElevenLabs library in `sound/wav` plus pour, fizz, swirl, cups and swell cues.
- Clips and audio sources live in `public/fof/` (not committed; regenerate from the job IDs in `docs/fof/jobs.md`).

```bash
npx remotion render src/index.ts FutureOfFreshness out/fof/pic.mp4 --muted --concurrency=4 --crf=16
python3 scripts/fof_mix.py out/fof/mix_raw.wav   # then volume + alimiter to -16 LUFS, -1 dBTP
npx remotion render src/index.ts FutureOfFreshnessLoop out/fof/loop.mp4 --muted --crf=24
```

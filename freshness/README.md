# The Future of Freshness

An interactive workshop experience for The Flavor Factory × TheraBreath / Church & Dwight, built as the digital centerpiece of the two-hour session on November 9, 2026. It is a static site with no build step: open `index.html` from any web server.

## The story

- **Prologue:** freshness is evolving, science × imagination, and Ross Conroy's four questions.
- **01 The Signals: what's changing?**
  - Six shifts.
  - Five signals, each followed signal → human need → oral-care implication → TheraBreath opportunity.
  - A flavor atlas showing where each ingredient sits on its path from origin cuisine to personal care.
- **02 The Territories: what could freshness become?**
  - The Freshness Universe: six axes you can switch live.
  - Six territories, each with its world, an insight and a tasting screen:
    - Arctic Yuzu: one concept, a whole platform.
    - Green Tea Cucumber: permission TheraBreath already has, expanded.
    - Ginger Lime: contrast creates freshness.
    - Grapefruit Rose Mint: restraint.
    - Pear Cardamom Mint: adjacency vs. white space.
    - Chamomile Vanilla Mint: the flavor clock.
  - The Freshness Compass and ingredient → liquid → sensation → bottle.
- **Your turn:** the room votes on five tensions, and a live form and sentence show the sensory direction. Then dot voting on territories.
- **03 The Moments: where can flavor create growth?** Wake, Reset, Connect, Restore, Escape, and the Flavor Passport.
- **04 The Playbook: what do we do with all of this?** Idea → experience → formula, three horizons, next actions, the assembled playbook, then "Built together."

## Running the room

- **Present / Workshop** (P / W):
  - Presenter mode is clean and advances with arrows, Space or a clicker.
  - Workshop mode adds the dock, room notes, undo, drag-between-horizons and vote removal (right-click).
- **Tasting mode** (T): only the six tasting screens.
- **Presenter console:** ⋯ menu → Open presenter console. It shows speaker notes, what's next, a timer, room notes and the tools below.
  - Keep the console on your laptop and drag the display window to the projector.
  - Both windows stay in sync, and so do votes.
- **Shortcuts:**
  - Y: Your turn. 1–4: chapters. G: all screens.
  - N: notes. Z: undo. B: blank. F: full screen.
- **Rehearsal data** loads a believable set of votes. **Reset workshop** clears everything before the real session.
- **Export answers** downloads everything as JSON. **Print the playbook** prints the final screen as a 16:9 page (save as PDF).

Answers are stored in the browser (localStorage) on the presenting machine, so run the session from one laptop.

## Notes

- The compass profiles and adoption paths are The Flavor Factory's conceptual read, labeled on screen as such. They are not panel or market data.
- Concept bottles are labeled "Concept exploration" and are not proposed packaging.
- Photography was generated with Higgsfield (GPT Image 2.5).
- Fonts are self-hosted: Inter Tight, Figtree, JetBrains Mono and Archivo (SIL OFL).
- The map is a dot rendering of Natural Earth land data.

## The opening film
- `media/opening.mp4` (and `.webm`) is the 30-second opening film with its score. It is the first screen of the presentation: press → to play.
- `media/loop.mp4` is a silent version without text, used behind the site and pre-brief heroes.
- The source is the `Opening` composition in `video/src/Opening.tsx`, built from nine Higgsfield Seedance clips with an ElevenLabs Music score.

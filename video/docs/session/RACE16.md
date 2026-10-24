# THE FLAVOR RACE V16 (V16.1: lettering fix): the full-length film, re-cut from V15.1

V15.1 (the director's final cut with the 21 October polish) had the story and the shots. The notes on it were: the
sound effects did not line up with the picture (the drop of flavor in the montage), the audio and the music could
be better, the giant generated lettering looked like a movie poster, and the story did not flow. V16 keeps the
director's structure and every beat that worked, and rebuilds the rest.

## What the research said, and what we took from it
- Murch's rule of six: cut for emotion first, story second, rhythm third. Every trim below was made on that order.
- Randy Thom: starve the eye to bring the ear; establish a sound's source once, then let it work alone; leave a pause
  after the action. So: real silences before the count, at the edge of space and on the Moon, and one sound per cut in
  the montage, on its frame.
- Guinness Surfer and Honda Cog: a patient build to one payoff, with the sound carrying attention. The opening
  withholds for nine seconds, the lamp is the first hit.
- Trailer craft (Derek Lieu): cuts land on the beat at the turning points, not on every beat; each new section of
  the film gets a new section of music, so the stakes rise; sound effects enhance, they never show off.
- Comedy: establish, reinforce, surprise. The rival is cheeky, never evil ("Nice bottle. See you at the moon."), and
  the button is the rival arriving late to a planted flag ("Well, that's not ideal.").
- Pixar's story spine, as the spine of this cut: every category has a race (once upon a time); two rockets, same fuel
  (every day); TheraBreath is being out-run on the same fuel (but one day); The Flavor Factory finds the flavor
  (because of that); the transfer, the relight, the pass (because of that); the Moon and the flag (until finally);
  home to Church & Dwight, the tasting (ever since); the rival, late (the button).

## The cut (2:40, 24 fps, 3,847 frames): `src/FlavorRaceV16.tsx`
| Time | Act | Beats |
|---|---|---|
| 0:00 | I The surprise | black; condensation on white; droplets on the orange stripe; the cap in steam with EVERY CATEGORY HAS A RACE set over it in the film's own type, holding on black; the dark pad, the lamps; both rockets against the full Moon (new: the finish line); COMPETITOR; TheraBreath; Mission Control at The Flavor Factory ("TheraBreath One, you are go for flavor."); the cap in the cold; three, two, one; the burner, WHUMP |
| 0:30 | II Launch | both pads erupt; the fans; both clear the pad; the long lens ("Look at her go!"); the look back; the hull; the pitch-over into silence |
| 0:45 | III The race | side by side; the rival slides in ("Nice bottle. See you at the moon."); neck and neck; both from below; the rival commits and pulls away; from TheraBreath's shoulder the rival is a dot by the Moon ("Norco, I'm running out of road here. The same fuel won't get me there first."); the warning light; the engines go quiet |
| 1:04 | IV Discovery | SEARCHING at The Flavor Factory ("TB-1, hang on. We're bringing it to you."); the montage on the score's beats: tea, cucumber, the coconut pops and splashes, the melon bursts, one drop lands on the orange, mint, the yuzu is the one; the lab: the pipette drop lands, light through the vial (new), the vial locks, FLAVOR TRANSFER READY, the signal crosses the night side; the transfer ("Oh, that's new."); TheraBreath comes alive; the relight on the score's return; both at full thrust over Earth; TheraBreath passes the rival (new); Mission Control erupts (new; "That's the future, TB-1. Go get it!"); it streaks for the Moon |
| 1:38 | V The Moon | the descent in silence; the dust; the footpad ("Norco, the flavor has landed."); standing on the Moon; the pole; and only then the flag; the Earthrise |
| 1:57 | VI Home | THERABREATH ONE on the monitors; lift-off for home ("TheraBreath One. Bring it home."); homeward; re-entry; the clouds; New Jersey from the air; the Church & Dwight sign with the real seal; the contrail over headquarters; the landing on the lawn; the robot and the six samples; the tasting in silence; black; THE FUTURE OF FRESHNESS; LET'S TASTE WHAT'S NEXT. |
| 2:34 | VII The stinger | back on the Moon, the rival finally lands beside the flag ("Well, that's not ideal.") |

### Out, and why
- The two 1960s control rooms (the Apollo room watching the race, the red beacon): the film has one Mission Control,
  The Flavor Factory. The alarm beat is TheraBreath's own warning light.
- The review proxy of TheraBreath passing (soft), and most of the second proxy.
- The lime beside a ginger root, the chamomile, both fruit-in-orbit shots with lemon and grapefruit: the blind
  flight's ingredients stay off screen. The orbit shot is kept where it shows only the signal's trails.
- Nine seconds of ferns, sage, trees and a flagpole between the clouds and the Church & Dwight sign.
- The cucumber with a plink and no drop. The drop is now a drop (the orange, then the pipette), and the plink lands
  on the splash.
- Trims: the condensation macro, the lights, the long lens, the hull, the descent, the standing shot, the flag wide,
  the Earthrise, the plasma, the clouds, the lawn landing. V15.1 ran 3:03; V16 runs 2:40 with more story in it.

### The lettering
EVERY CATEGORY HAS A RACE is set in the end card's condensed metal (Archivo 800, 66% width) over the same shot before
its baked-in letters appear (b92b53de 0.0 to 1.75 s), so the film has one type system from the first card to the last.
FOLLOW? OR LEAD? is out altogether (V16.1): the clean two-rocket shot (5d17c937 2.0 to 5.3 s) carries the beat on its
own, with the thrust bed and the pass. SEARCHING, FLAVOR TRANSFER READY and THERABREATH ONE stay: they are objects in
the scene. GINGER on the background monitors in Mission Control stays as shot.

## Voice: eleven radio lines from the V4 sessions (same four voices: FLIGHT, NORCO, TB-ONE, COMPETITOR)
NORCO and FLIGHT are heard in the room; TB-ONE and the COMPETITOR are heard over the air (band-limited, a Quindar tone
before and after). Each line is placed against the shot it belongs to and every effect ducks under it. V15 carried only
the count and the landing line; the nine new lines carry the story's turns and the jokes, and the ending stays
wordless from the lawn to the card.

## Music: a new score (ElevenLabs Music v2.5, five cues in D at 152.02 BPM, bar 1.5787 s, instrumental)
The V12 score was a trailer. V16's is a space-race score with a wink: brass fanfares with swing in the snare, a racing
string ostinato, a pizzicato and celesta caper for the discovery, a tender horn for the Moon, a joyful homecoming, one
grand cadence. The cues (`public/race/audio/v16_open.mp3` 40 s, `v16_launch` 60 s, `v16_discovery` 50 s, `v16_finale`
72 s, `v16_long` 206 s) were measured bar by bar (`scratch/grid.py`: beat grid, downbeats, level per bar in the full,
low and high bands) and are placed by `sound/music16.py` on their own clocks (film = file + S), nothing stretched:
- A. the opening cue from file 11.08: a quiet swell under the condensation, silence under the title, its bloom
  (file 20.79) on the first lamp, hits as the Moon clears the clouds and on the cap in the cold, gone by the burner;
- B1. the launch cue's first downbeat on the ignition, to the edge of space, where the mix cuts it;
- B2. the same cue's bar 25 (file 39.47) on the chase, so its last bars thin out and sag over the warning light and
  the engines going quiet (file 53.68 lands at 60.67);
- C. the discovery cue with bar 3 on SEARCHING, bar 5 on the first montage cut (the montage is cut on its beats),
  bar 11 (bass and percussion in) on the pipette, and bar 19 (file 31.57) on the relight to the frame; cut on the descent;
- D1. the finale's horn (file 0.80) from the footpad; D2. its rise (file 13.43) from the flag wide through the Earthrise;
  D3. its homecoming theme (file 48.17) from the lift-off off the Moon, cadencing on the landing at Church & Dwight and
  dying away by the robot, so the tasting is silent; D4. the long cue's final chord (file 192.62) under the card.
The mix (`sound/events16.py`) carves the silences: before the count's WHUMP, at the edge of space (a throw into
nothing, the race re-entering side by side), on the Moon until the footpad, under the tasting; and dips the score
under every radio line, the touchdowns and the press.

## Sound: `sound/cues16.py`, every cue on its frame
The V15 design (identities, spaces, the baton) stays; every cue is re-anchored to V16's segments and the picture events
measured per frame off the source clips. The fixes the notes asked for: the pipette drop lands at +1.20 (V15 played it
at +0.90), the melon bursts at +0.15 (V15: +0.05), the coconut pops on the cut and splashes at +0.40, the button goes
at +0.60, the relight at +0.27, the footpad at +0.55, the pole at +0.55, the rival lands at +1.25. New cues: the Moon
behind the pad (wind, a far-off tower), the pass (a clean thrust sweep left to right), Mission Control erupting (the
room, a cheer, a chair), light through the vial (a sung glass tone), the orange drop (the plink on the splash), the
radio lines' Quindar tones.

## Commands (from `video/`)
```bash
npx remotion render src/index.ts FlavorRaceV16 out/race16/pic.mp4 --muted --concurrency=3 --crf=14
cd sound && python3 music16.py ../out/race16_music.wav && python3 cues16.py ../out/race16_sfx.wav && python3 vo16.py ../out/race16_vo.wav
CUT=16 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race16/pic.mp4 ../out/race16_music.wav ../out/race16_sfx.wav ../out/race16_vo.wav ../out/race16/final.mp4
```

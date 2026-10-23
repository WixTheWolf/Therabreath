# THE FLAVOR RACE V18: the notes pass on V17

V18 is V17 (docs/session/RACE17.md: the rules, the research) with the notes on V17 worked through cut by cut. Picture in
src/FlavorRaceV18.tsx, sound in sound/cues18.py, vo18.py, music18.py, events18.py (mix2.py with CUT=18). 2:46.

## The notes, and what was done

**"Between 0:44 and 0:45 there is a frame that flashes."** Found: the generated pitch-over shot (v12/g10_pitch) has a sun
flare in its top right corner that flickers on and off from frame to frame between src 1.5 and 2.95 (the strips in
scratch: frames 1042 to 1057 of the V17 render). Not a stray frame in the edit; the footage itself. V18 plays the shot
from src 2.96, where the flare is gone for good, motion-interpolated to two thirds speed (ffmpeg minterpolate, mci, 40 fps
to 24: public/race/clips/v18/g10_pitch_slow.mp4, 1.58 s) so the quiet beat at the edge of space keeps its length. A
whole-film scan for short regional luminance bumps (frame against the mean of its neighbours two to five frames away,
on a six by twelve grid) found no other flicker away from cuts; every other hit was a cut or a flame.

**"Accidental frames."** A second scan, on the source clips this time: every V18 clip region decoded at 24 fps and
checked for a frame-to-frame change far above the region's own median (a hard cut hidden inside generated footage).
Three real ones, all in V17 as well, all fixed by moving a cut to the clip's own frame:
- the shot of both rockets at full thrust (v15/5d17c937) began on src frame 42, which is the last frame of the
  clip's previous shot (the hull in cloud): one wrong frame at 0:45.2 in V17, the brightest single frame in that
  second. It begins on frame 43 now.
- the regolith shot before the footpad (k/n14_dust) has a hard cut at src 1.958 (regolith to the landing leg) that
  V17 played through as if it were one take: the dissolve into the regolith now ends on the frame before that cut and
  the leg's shot begins on it; the touchdown stays on its frame.
- the cloud shot over New Jersey (v11/47b35301) cuts to a second aerial at src frame 151; V17 ran five frames past
  it (a jump at 2:08.6). It ends on frame 150 now.
Every other spike was a cut in the edit, a flame or the ignition whiteout. Then a frame-by-frame look at every cut
on the proof (scratch cut sheets: the last frame out beside the first frame in). The four dissolves that remain are
the fade up from black, the regolith, the Earthrise and the fade to black before the card.

**"I don't like the dissolving transitions at the beginning of the bottle reveal."** The three macros are hard cuts.
The condensation macro runs until the orange stripe is in the bottom of its frame (src 5.0) and cuts to the stripe
filling the frame (a graphic match, stripe to stripe); the stripe cuts to the cap in steam. One unbroken bed (the far
machine, the cold venting) runs under all three, so the sound never marks a cut. The fade up from black stays.

**"At 2:04 the egg shaped clip needs to get out."** The plasma tunnel (v15/e9498b9a) is gone. The re-entry runs to its
last clean frame and punches straight into the whiteout of the cloud behind a white flash (two frames up, six down,
centred on the cut), with a low thump. Its 1.17 s went to the homeward shot and to the approach onto the lawn so the
finale cue's last chord still lands 0.84 s after the touchdown (the cue is placed on its own clock from the lift-off
off the Moon; take a second out of the home stretch and the cadence lands late).

**"The launch scene starting 28 sec can't be edited better."** Read as "can be": only the long lens is shorter
(3.0 to 2.17 s) now that nobody speaks over it; the rest of the launch (ignition, the fans, the whiteout, the
lift-off, the look back, the hull, the edge of space) is V17.

**"Most of the VOs can be cut; 'Look at her go' doesn't need to be in there."** Eleven lines are five: the count,
"Nice bottle. See you at the moon.", "Norco, I'm running out of road here", "Oh, that's new." (as the beam arrives),
"Well, that's not ideal." Gone: "you are go for flavor", "Look at her go!", "hang on, we're bringing it to you",
"That's the future, TB-1, go get it!", "the flavor has landed", "Bring it home". The music dips that made room for
them are gone too (events18.py), so the long lens, the room before the count, the pass and the Earthrise play full.

**"The montage needs more flavor, faster and more action packed cuts, juicy flavors that will work in a mouthwash."**
Eight shots in six bars on the discovery cue's beats (3, 4, 2, 2, 2, 2, 2, 7 at 152 BPM), every cut on an impact:
tea leaves in the air; one drop on the orange and its crown (four beats: the droplets dance); lime and cucumber
tumbling; the coconut pops on the cut and splashes; the watermelon bursts; the frosted mint leaf, its drop glinting;
cucumber and tea in water; the yuzu split (the one, seven beats). One sound per cut on its frame (cues18.py). The
montage is the same six bars as V17 so bar 5 still lands on the first cut, bar 11 on the pipette and bar 19 on the
relight.

The note also asks for the montage to lean toward the flavors introduced at the workshop. The film plays before the
tasting and the tasting is blind, so the flight's own flavors (and every ingredient in them) stay out of the film:
nothing here is lemon, ginger, grapefruit, lavender, a blossom, a berry or a frozen pop. If the blind is lifted, the
flight's flavors can go in with the same rhythm (the library has clips for most of them; the rest is one generation
each) and a re-render.

**"I miss the CU of the white button, FLAVOR TRANSFER READY."** Back: v15/7e9b6135 src 12.29, one bar (38 frames),
the press at +0.60, after the vial locks into the cell and before the signal crosses the night side. The press has
its click, the panel's chime and a rising sparkle into the orbit. It adds a bar inside the lab run, which the prism
(1.5 to 1.125 s), the glove (2.04 to 1.63 s) and the transfer (3.0 to 2.21 s, from src 1.4 so the beam arrives at
+1.6 under "Oh, that's new") give back, so the bass still arrives on the pipette and the brass on the relight.

**"The edit and sfx from 1:30, after TB-1 gets the flavor and takes off: two clips of the flavor passing the
competitor; make it make sense; more intense at the pass around 1:37; uncertainty and anticipation; fun."** The
second "pass" was the streak for the Moon (v15/7e9b6135 src 20.2), which opens on a bright hull in the corner that
reads as something being passed. The last lap is rebuilt as a lap:

| at | shot | why |
|---|---|---|
| 1:28.5 | relight (dark bells, the engines catch at +0.67 on the brass return) | V17 |
| 1:30.3 | the competitor, still far ahead, streaking on (v15/5d17c937 src 15.25, 1.25 s) | uncertainty: she is back, but |
| 1:31.5 | TheraBreath alone from behind, the Moon ahead, climbing (7e9b6135 src 18.33, 1.5 s) | the chase is on; the riser begins |
| 1:33.0 | she charges the lens; the cap fills it (v15/px27 src 1.75, 1.58 s) | the occlusion hides the cut; the thump |
| 1:34.6 | from behind: level at +0.6, past at +0.85, the rival falls behind in the green (v12/g6_pass src 0.75, 3.0 s) | the one pass; +0.85 is the cue's bar 23 |
| 1:37.6 | Mission Control erupts | V17 |
| 1:39.1 | she streaks for the Moon, nobody else in frame (7e9b6135 src 20.65, 1.125 s) | out before the clip's own jump at 21.83 |

Sound (cues18.py): the thrust bed drops to let the rival's grind be heard far off and to the left; the turbine
climbs under the hero shot with a 3.6 s riser that ends as the cap fills the lens (a sub thump); the pass gets its
sub, an ignition crack, the sparkle and a crystal edge on the bar line, with the rival's grind falling 16 dB away
behind; the room's cheer; the streak's whoosh and sub. The discovery cue plays full through the pass (no dip),
only the cheer dips it 4 dB.

## Checks
- Cut sheet of every cut on the proof (out and in frames), the strips of every new clip region.
- Bar alignment printed by music18.py: bar 5 within 13 ms of the first montage cut, bar 11 on the pipette, bar 23
  within 5 ms of the pass, the finale's last chord at the lawn touchdown + 0.84 s.
- Dialogue clearance per line (dialog.py), loudness of the master (ebur128).

## Commands
```
npx remotion render src/index.ts FlavorRaceV18 out/race18/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music18.py ../out/race18_music.wav && python3 vo18.py ../out/race18_vo.wav && python3 cues18.py ../out/race18_sfx.wav
CUT=18 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race18/pic.mp4 ../out/race18_music.wav ../out/race18_sfx.wav ../out/race18_vo.wav ../out/race18/final.mp4
```

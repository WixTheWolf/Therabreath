# THE FLAVOR RACE V19: the continuity pass on V18

V19 is V18 (docs/session/RACE18.md) watched again for anything that does not work or make sense: geography,
direction of travel, what is in the sky, what is on the tray. Picture in src/FlavorRaceV19.tsx, sound in
sound/cues19.py, vo19.py, music19.py, events19.py (mix2.py with CUT=19). 2:46, the same length to the frame, so
every anchor of the score (bar 5 on the first montage cut, bar 11 on the pipette, bar 19 on the relight, bar 23 on
the pass, the rise from the flag wide, the finale's last chord 0.84 s after the lawn touchdown) is where it was.

## The brief

"Rewatch this film and look at anything that doesn't work or make sense, like the moon being behind the earth when
it's headed back. Do extensive research, create new clips if you don't have it and make the best next version
possible."

## What the rewatch found

Whole-film strips at two frames a second (scratch: w1, w2, w3), then every suspect region at eight, then the
source clips of every shot in the Moon and home stretch frame by frame.

| at | shot | what is wrong | V19 |
|---|---|---|---|
| 2:02 | homeward (h/c11_homeward) | a second Moon hangs beside the Earth as TheraBreath flies home from the Moon; the Moon is behind her | the body is tracked per frame and filled; the shot starts after the landing leg has cleared it |
| 1:40 | the Moon descent (v11/617c18bf) | a thin crescent Earth in the top right corner, lit from the sun's far side while the Moon below is lit from ours; the next shots have the Earth full and huge | filled the same way (the sky and its stars cloned from beside it) |
| 1:56 | the Earthrise (v15/fbfbe7c8 src 2.9) | the Earth climbs out from behind the horizon while the camera stands on the regolith. Seen from the Moon's surface the Earth does not rise; and the flag wide just before it already had the Earth high in the sky | the look home is the same clip's tail: the Earth already up, the camera booming up off the regolith (a move, not a rise), slowed with motion interpolation to the length the score needs |
| 2:04 to 2:06 | re-entry (v15/1bba799d) straight into the cloud | the plasma shot is right (engines first, the blunt end leading) but she went from the fire into the cloud in one cut, with nothing between the heat and the weather | the plasma, then the entry burn over the cloud deck (w/x_reentrypov src 12.3, engines down, the flame ahead of her), then the punch into the cloud |
| 2:06 | the cloud over New Jersey (v11/47b35301) | grey overcast between a golden re-entry and a golden-hour Church & Dwight | warmed toward the golden hour (a grade on the shot) |
| 2:23 | the robot (v12/g7_robot) | the hatch opens on a bottle standing by a harbor at dusk; she landed on the lawn at Ewing. Six glasses on the tray; the flight is four samples | a new shot generated from the landing's own last frame: the hatch, the arm and a tray of four on the lawn (public/race/clips/v19/robot_lawn.mp4) |
| 2:28 | the tasting (v13/t1_tasting) | a gloved hand sets a fifth glass down beside four | reframed on four glasses and played in reverse, so the hand lifts one to taste (v19/tasting4.mp4); the film ends on that |
| 1:07 to 1:16 | the montage | tea, cucumber, coconut: none of them in the flight. V18 kept the flight's flavors out so the tasting stayed blind; the film now plays at 11:48, after the tasting and the reveal | the flight's own flavors where the library has them: ginger and lime, the drop on the orange, the lemon squeezed into the beaker (the lab's own shot; a second split would double the yuzu), strawberries and cherries into water (new: v19/berries.mp4), the frozen watermelon, the frosted mint, chamomile in a lavender haze, the yuzu. Same eight beats, every cut on an impact |

Looked at and left: the race itself (both rockets fly Earth to Moon with the Moon ahead and the Earth behind in every
shot that shows either; the one pass is from behind with the rival on the right, as before); the lift-off off the
Moon (the Earth large in the sky, consistent with the flag wide and the stinger); the stinger (the rival lands beside
the flag with the Earth where the flag wide had it); the Church & Dwight sign and the TheraBreath flag (real logos,
unaltered); the opening (night on the pad into a dawn launch reads as the count running down to first light).

## The research behind the fixes

- **The Earth from the Moon.** The Moon is tidally locked, so from any one place on the near side the Earth hangs in
  nearly the same spot in the sky, drifting only a few degrees with libration; it shows phases, and it is about two
  degrees across, close to four times the Moon's apparent size from Earth. An Earthrise is something an orbiting
  observer sees: Apollo 8's photograph (Bill Anders, 24 December 1968) was taken from lunar orbit as the spacecraft
  came round the limb. Sources read: NASA's "Earth as seen from the Moon" problem set (angular size), Kiri Wagstaff's
  "Does the Earth rise, seen from the Moon?", UNLV Physics' note on Earthrise and libration.
- **Which end first.** Capsules and boosters come back blunt end first: the blunt body work of H. Julian Allen and
  A. J. Eggers (NACA, 1951) showed a blunt shape pushes the shock away from the skin and sheds most of the heat into
  the air. So the re-entry shot with the fire on the engine end and the nose trailing is the right way round, and the
  entry-burn shot keeps the same attitude. Sources read: Wikipedia, Atmospheric entry (blunt body theory); Siemens
  Simcenter knowledge base, blunt bodies.
- **Screen direction.** Keeping a traveller on the same side of the line, and the thing she is travelling toward on
  the same side of the frame, is the 180-degree rule; a cut that puts the destination behind her reads as a turn
  back. Sources read: Wikipedia, 180-degree rule; Videomaker, screen direction.
- **The goofs this is avoiding.** IMDb's goofs pages for First Men in the Moon (1964: the Earth's phase changes
  between shots) and Iron Sky (2012: the Moon's phase) are exactly this class of error, and the ones audiences list
  first.

## New footage, and what it cost

Two generations (Higgsfield, Seedance 2.5, 720p, five and six seconds), both from stills taken off the cut so they
match their neighbours: the landed bottle on the lawn (the last frame of s11_hq) opening its hatch and bringing out a
tray of four glasses; strawberries and cherries falling into water. 77 credits in all (35 and 42); the account had
about eleven left after that, below the price of one more clip, and the ElevenLabs workspace refused a video run on
its quota (nothing charged). So the rest of V19 is built from the library and from the V18 shots themselves:

| clip | made how |
|---|---|
| v19/homeward_nomoon.mp4 | h/c11_homeward with the stray Moon tracked per frame (a quadratic through the detections, residual one pixel) and filled by solving Laplace's equation over a feathered disc with the sky around it as the boundary, the ring's own grain put back; re-encoded at crf 10, 10-bit like the source (scratch/v19/depatch.py) |
| v19/descent_nocrescent.mp4 | v11/617c18bf with the crescent in the corner filled from the sky and stars beside it, same tracker; trimmed to the five seconds the cut uses |
| v19/fall.mp4 | w/x_reentrypov src 12.0 to 14.75, the entry burn over the cloud deck, trimmed out so the cut's sources travel light |
| v19/earth_up_slow.mp4 | v15/fbfbe7c8 src 6.4 to 9.2 (the Earth up, the horizon dropping out of frame as the camera booms up), slowed to 0.84 with ffmpeg minterpolate (mci) so flag wide to lift-off keeps its 7.3 s |
| v19/tasting4.mp4 | v13/t1_tasting cropped 1.5x on the four glasses and the hand (lanczos, a touch of unsharp), reversed |
| v19/robot_lawn.mp4, v19/berries.mp4 | generated (above) |

## Checks
- Strips of every new clip region and of the fills (before and after crops on eight frames each).
- Cut sheet of every cut on the proof (the last frame out beside the first frame in).
- Bar alignment printed by music19.py: identical to V18 (the cut's anchors did not move).
- Dialogue clearance per line (dialog.py): identical to V18 to the tenth of a dB (the speech-band margin at the tenth
  percentile is 6.7 dB on "Nice bottle", 8.8 on "running out of road", 8.2 on "Oh, that's new"), once mix2.py's
  deeper dialogue dips were extended to CUT=19 (they were keyed to cuts 16 to 18; without that the beds sat 2 dB
  higher under every line). Loudness of the master (ebur128): at the end of this file.

## Commands
```
npx remotion render src/index.ts FlavorRaceV19 out/race19/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music19.py ../out/race19_music.wav && python3 vo19.py ../out/race19_vo.wav && python3 cues19.py ../out/race19_sfx.wav
CUT=19 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race19/pic.mp4 ../out/race19_music.wav ../out/race19_sfx.wav ../out/race19_vo.wav ../out/race19/final.mp4
```
The app encode (two-pass x264 3.5 Mb/s, BT.709, faststart) and the poster frame are the same as V18's; the copy
goes to final/public/media/flavor-race.mp4.

## The master
Mix: -15.5 LUFS integrated in the mix stage, loudness range 8.8 LU, max short-term -11.3 LUFS, true peak -1.50 dBTP,
max limiting 5.6 dB (the same figures as V18 to the tenth). Measured on the delivered file (ebur128): -16.3 LUFS
integrated, loudness range 8.0 LU, true peak -1.5 dBTP. A whole-film scan of the render for jumps away from the cuts
(frame-to-frame change at 96 by 54 against the local median) found only the relight flash, the Moon touchdown, the
cloud break-out, the whip up through the tree and the contrail, all of them V18's frames; nothing in the regions V19
changed.

# THE FLAVOR RACE V21: V20 without the toast

The note: "take the toast shot out". V21 is V20 (docs/session/RACE20.md) with the toast gone. Picture in
src/FlavorRaceV21.tsx, sound in sound/cues21.py, vo21.py, music21.py, events21.py (mix2.py with CUT=21). 2:26, four
and a half seconds shorter than V20.

## What changed

- The toast shot (clips/v20/toast) is out. The film ends on the lawn as the arm brings the tray of four glasses to
  the lens: the robot shot plays to the end of its take (3.5 s, src 2.67 to its last frame at 6.04) and its last
  frame holds under the dissolve to black. The clip stays in the repo; nothing uses it.
- Everything before the robot shot is V20 to the frame, so every anchor of the score is where V20 had it: bar 23 on
  the pass, the rise on the flag wide, the finale's last chord 0.84 s after the lawn touchdown.
- Sound: the toast's cues are gone (the gloves, the glasses off the tray, the clink and its three notes, the evening
  air under it). The tray's own glass and its three small notes now ring into the fade, and the finale's ring-out
  fades with the picture (music21.py plays it to the black plus 0.6 s, a 0.9 s fade).
- The app copy and the Stage notes say two minutes twenty-six.

## The score

On the V20 rubric the change costs a point under Idea and story: the ending no longer shows the four glasses being
lifted as the room's samples; the tray of four arriving at the lens carries that by count alone (which is the V19
review's own free fix 6). 89 out of 100; everything else in RACE20.md's re-score stands.

## Commands
```
npx remotion render src/index.ts FlavorRaceV21 out/race21/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music21.py ../out/race21_music.wav && python3 vo21.py ../out/race21_vo.wav && python3 cues21.py ../out/race21_sfx.wav
CUT=21 PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race21/pic.mp4 ../out/race21_music.wav ../out/race21_sfx.wav ../out/race21_vo.wav ../out/race21/final.mp4
```
The app encode and the poster are the same as V20's; the copy goes to final/public/media/flavor-race.mp4.

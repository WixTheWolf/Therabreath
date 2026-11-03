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

Scored after a full viewing (the whole film at one frame a second, the climb and the trip home frame by frame) and
the measurements, on the V20 rubric:

| Area | Out of | V20 | V21 | what still costs |
|---|---|---|---|---|
| Idea and story | 20 | 19 | 18 | The ending carries the room's four samples by count alone: no A to D on the glasses, and without the toast no beat that says this is the room's tasting (2) |
| Picture | 25 | 21 | 21 | The bottle's fins, legs and label layout still change between generated shots (3); the landing's dust billows and hangs, which it cannot do in vacuum (1) |
| Editing and pacing | 20 | 18 | 18 | The Earth is larger in the flag wide than in the landing wide before it (1); the landing is told twice, the wide a frame from the ground and then the footpad close-up (1) |
| Sound and mix | 20 | 18 | 19 | Unheard in the room: the Moon sits 5 dB lower than V19 and needs a check over the room's air handling (1). The end card now resolves 1.9 dB under the pass (V20: 0.5), so the order is the story's: the launch, the pass, the cloud, the relight, the card |
| Fit for the room | 15 | 14 | 14 | 2:26 is still long for a send-off before lunch (1) |
| **Total** | **100** | **90** | **90** | |

Loudness at the key moments (momentary, LUFS): launch -9.3, the pass -10.3, the cloud punch -11.3, the relight -11.6,
the end card -12.2, the montage -13.7, the Moon descent -23.0. The plot lines on their words: "Nice bottle" 25.3 dB
over everything else at the tenth percentile, "running out of road" 25.7, "Oh, that's new" 17.8 (the same as V20).

## Commands
```
npx remotion render src/index.ts FlavorRaceV21 out/race21/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music21.py ../out/race21_music.wav && python3 vo21.py ../out/race21_vo.wav && python3 cues21.py ../out/race21_sfx.wav
CUT=21 PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race21/pic.mp4 ../out/race21_music.wav ../out/race21_sfx.wav ../out/race21_vo.wav ../out/race21/final.mp4
```
The app encode and the poster are the same as V20's; the copy goes to final/public/media/flavor-race.mp4.

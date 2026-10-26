# THE FLAVOR RACE V22: the last lap rebuilt, the fall replaced

The note: "I still think the video needs work. I don't like shot 118.00 and 119.00. I also think the space race from
90.00 to 99.00 needs work". V22 is V21 (docs/session/RACE21.md) with both passages rebuilt to their V21 lengths, so
every anchor of the score holds. Picture in src/FlavorRaceV22.tsx, sound in sound/cues22.py, vo22.py, music22.py,
events22.py (mix2.py with CUT=22). 2:26.

## What was wrong

- 1:58 to 1:59 (the fall, v19/fall): a tiny rocket far off against blue sky over the cloud deck. After the fiery
  close-up of the re-entry it dropped the energy, and at that size the bottle could be anything.
- 1:30 to 1:39 (the last lap): the shots did not tell one race.
  - The climb (v15/7e9b6135 src 18.33) put a toy-sized rival on legs beside her.
  - The charge (v15/px27 src 1.75) came after she was already alone.
  - From behind (v12/g6_pass src 0.75), she was already ahead and small while the competitor filled the frame, so
    the moment the score called the pass showed nothing passing.
  - The streak for the Moon (7e9b6135 src 20.65) ends on a golden rocket that reads as the competitor.

## What changed

The last lap, 90.25 to 100.21 (the same 239 frames):

| shot | clip | what it says |
|---|---|---|
| rivalfar, 1.25 s | v20/race_lr src 4.5 | the competitor far ahead to the right, only its smoke left in frame (as V21) |
| level, 2.67 s | v15/px27 src 0.67 | she has caught it: alongside the competitor, left to right; the lens closes on her label and the cap fills it |
| neck2, 1.38 s | v12/g3_neck src 0.75 (new to the film) | from behind, dead level; her engines kick at src 2.0, on the score's bar 23 (95.42; the bar is at 95.44) |
| pass, 1.92 s | v12/g6_pass src 0.375 | a wider angle from the same side, through a white flash off the kick: level, then she pulls away, the mint trail behind her |
| mcerupts, 1.5 s | v122/v122_mc_erupts src 0.9 | Mission Control erupts (as V21) |
| passtail, 1.25 s | v12/g6_pass src 2.71 | back on the race: the competitor coughs smoke as she closes on the Moon; then the Moon |

The fall, 118.21 to 119.58 (the same 33 frames): w/x_reentrypov src 5.75 to 7.13, the view down past her engines as
the cloud deck rushes up and swallows the lens. It ends inside the cloud, so the white flash into the clouds shot is
now a cut from cloud to cloud.

Sound: the last lap's cues follow the new shots (the competitor's grind far off and right, then beside her while she
is alongside it; her turbine and a riser under the push to her cap and the thump as it fills the lens; the two
engines level from behind with the competitor on the right; the drop, the reverse suck, the sub and the crack on the
kick; the grind falling away; the room; the competitor's cough on the frame its smoke appears). The fall's entry burn
is closer and fuller now that the camera sits at the bells, with the air building as the deck rushes up.

## Why no new footage

The best fix for the pass is one new side-on take from the race's own frame: she surges on the mint flame, draws
level with the competitor and passes it, left to right, the competitor falling back out of frame. It is set up on the
ElevenLabs flow kV2Cgf1jrrEIfQfZmfi7 (node XakTcYBkfmGwO4R8y3XX: Gemini Omni, 8 s, 1080p, start frame race_lr src
3.0, 7,339 credits). The workspace has 261 credits left of its 231,000, so it was refused without charge; Higgsfield
has 10.91. When credits are back, that one run (or Veo 3.1 Lite at about 2,400 credits) replaces neck2 and pass.

## The score

Scored after a full viewing of the changed passages (the last lap and the fall at 24 frames a second, the rest at
one frame a second) and the measurements, on the V20 rubric:

| Area | Out of | V21 | V22 | what still costs |
|---|---|---|---|---|
| Idea and story | 20 | 18 | 18 | The ending carries the room's four samples by count alone (2). The race now has its turn and its payoff: caught, level, the kick, gone, and the competitor coughing behind her |
| Picture | 25 | 21 | 22 | The bottle's fins, legs and label layout still change between generated shots (2; the toy-sized rival on legs and the golden rocket are gone); the landing's dust billows and hangs, which it cannot do in vacuum (1). The fall is now one of the strongest images in the film |
| Editing and pacing | 20 | 18 | 18 | The Earth is larger in the flag wide than in the landing wide (1); the landing is told twice, the wide a frame from the ground and then the footpad close-up (1). The race now keeps one direction from the side and one from behind; the kick is an axial cut-out (closer to wider on the same side) on the action, under the flare and a flash |
| Sound and mix | 20 | 19 | 19 | Unheard in the room: the Moon sits low and needs a check over the room's air handling (1) |
| Fit for the room | 15 | 14 | 14 | 2:26 is still long for a send-off before lunch (1) |
| **Total** | **100** | **90** | **91** | |

What would move it most: the generated side-on pass (above), the catch, the level and the pass in one take from
the same side as the competitor's surge (Picture +1: one consistent pair of rockets through the whole lap; Idea +1:
the turn of the story seen whole), and an answer for the four samples at the end.

Loudness at the key moments (momentary, LUFS): launch -9.3, the kick -10.2 (1.7 dB over the lap before it, out of a half-second drop),
the cloud punch -11.3, the relight -11.6, the end card -12.1, the montage -13.6, the fall -13.9, the competitor's
cough -14.7, the Moon descent -23.1. Integrated -16.4 LUFS, true peak -1.5 dBTP. The lines clear the bed as in V21
(dialog.py).

## Commands
```
npx remotion render src/index.ts FlavorRaceV22 out/race22/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music22.py ../out/race22_music.wav && python3 vo22.py ../out/race22_vo.wav && python3 cues22.py ../out/race22_sfx.wav
CUT=22 PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race22/pic.mp4 ../out/race22_music.wav ../out/race22_sfx.wav ../out/race22_vo.wav ../out/race22/final.mp4
```
The app encode and the poster are the same as V20's; the copy goes to final/public/media/flavor-race.mp4.

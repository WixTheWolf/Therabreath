# THE FLAVOR RACE V20: every deduction in the V19 review, fixed or answered

V20 is V19 (docs/session/RACE19.md) rebuilt against a scored review. Picture in src/FlavorRaceV20.tsx, sound in
sound/cues20.py, vo20.py, music20.py, events20.py (mix2.py with CUT=20). 2:31, fifteen seconds shorter than V19, all
of it from the trip home.

## The brief

After the review scored V19 at 71 out of 100: "ok. build it so it has a score of 100/100", and "i also have omni gemini
and grok". A hundred is the target, not a claim: every deduction in the review gets a fix, and the film is scored
again on the same rubric at the end of this file, honestly.

## The rubric (from the V19 review)

| Area | Out of | V19 |
|---|---|---|
| Idea and story | 20 | 16 |
| Picture | 25 | 17 |
| Editing and pacing | 20 | 13 |
| Sound and mix | 20 | 13 |
| Fit for the room | 15 | 12 |
| **Total** | **100** | **71** |

## Every deduction, and what V20 does with it

| the review said | V20 |
|---|---|
| The race changes direction: the rockets fly right side by side, then left as the rival pulls away and again after the relight | A new take, left to right from the side-by-side frame (clips/v20/race_lr, Gemini Omni from the neck shot's frame): the rival's engines flare at +0.55, it surges ahead and pulls away to the right; the same take, later, is the rival still far ahead after the relight. The sound follows: the rival's engine sits right and stays right |
| TheraBreath glows amber after the transfer, the competitor's color | The glow is regraded to TheraBreath mint (clips/v20/life_mint: the amber hue band moved to 160 degrees through a smoothed mask, desaturated by half where it moved, so it reads as light and not paint) |
| Mission Control's screens have garbled lettering | The cheer is pushed in 1.24x from the bottom of the frame, under the sign and screen lettering |
| The pass is no louder than the montage; the launch is the loudest moment | A drop before the pass (the score 7 dB down and the thrust 10 dB down for the half second before bar 23, a reverse suck drawing it in), then the lead opens 3 dB over where the score ran, the sub and the crack 3 dB up. The room rider that held everything at one level is eased (RIDE 1.0 / 0.3 against V19's 1.7 / 0.45) |
| "Nice bottle" and "running out of road" are hard to hear | The score steps 9 to 10 dB aside under both (V19: 5), the dip starts before the radio's tone, and mix2.py's speech-band carve is 3 dB deeper for the score and 2 dB deeper for the effects with CUT=20 |
| The Moon descent: the rocket looks miles tall against the curve of the surface | A new true-scale take (clips/v20/descent_true, Veo 3.1 Lite from an empty-Moon start frame to the landed frame): a low locked-off shot on the regolith, the rocket descending into frame on its plume; the footpad close-up; the same wide, landed. The regolith dissolve and the limb shot are gone |
| The Earth changes face (Americas, Africa, Americas) and size between shots | The Africa look-home is out; the flag wide holds the Earth behind the flag, then the lift-off |
| The film spends 33 seconds getting home, the slowest cutting in the film; the lawn holds one wide for 12 seconds | Lift-off to the hatch is 16.0 s (V19: 24.0): lift-off 2.0, homeward 1.5, re-entry 1.25, the fall 1.38, the cloud 2.75, the sign 1.46, the whip 0.5, the contrail 1.63, the lawn 3.58. The look home (2.7 s) is gone too. The tree whip is half a second at four times speed; the lawn is 3.6 s; the tray shot starts at the hatch |
| The closing music would need re-timing | The finale cue loses four bars on a bar line (file 59.21, the downbeat of bar 38, into 65.53, the downbeat of bar 42: chroma similarity 0.87 and 0.96 across the join, an 80 ms equal-power crossfade), so its last chord still lands 0.84 s after the lawn touchdown, as in V19 |
| The tasting opens on five glasses | The bench shot is gone |
| The ending is a row of glasses in an empty lab, nothing tying it to the room's Samples A to D | The film ends on the lawn: four gloved hands lift the four glasses off the tray and touch them together in front of the rocket (clips/v20/toast, Gemini Omni from the tray's last frame), one clink in the evening air, the tray's three notes again as it rings |
| The bottle's fins and legs change between shots | Not fixable without regenerating the film: every generated shot draws its own bottle. Answered in the re-score |

## New footage, and what it cost

All through ElevenLabs (the workspace flow kV2Cgf1jrrEIfQfZmfi7), each from a still taken off the cut so it matches
its neighbours:

| clip | model | from | credits |
|---|---|---|---|
| empty-Moon start frame | image edit | the landed frame, the rocket removed | 433 |
| v20/toast.mp4 (5.0 s) | Gemini Omni | the tray's last frame | 4,612 |
| v20/race_lr.mp4 (6.0 s) | Gemini Omni | the neck shot's frame | 5,521 |
| v20/descent_true.mp4 (6.0 s) | Veo 3.1 Lite, 1080p | empty-Moon start frame to the landed frame | 1,818 |

12,384 credits; the workspace has about 260 of its 231,000 left. The toast was refused once by the model's safety
filter (it read as a drinks toast) and went through as "small tasting cups of mouthwash samples". The descent was
meant for Gemini Omni, which needs a start frame whenever an end frame is set (hence the empty-Moon still) and then
cost more than the quota had left; Veo 3.1 Lite takes both frames at a third of the price. Higgsfield (10.91
credits) was below the price of any clip. Grok has no route from this environment (no connector, and none of the
connected services lists it).

## The sound, measured

Loudness at the key moments (momentary, 400 ms, the loudest in each window; LUFS), V19 as delivered against V20:

| moment | V19 | V20 |
|---|---|---|
| ignition WHUMP | -9.6 | -9.8 |
| launch | -10.0 | -9.3 |
| both, full thrust | -12.6 | -12.1 |
| "Nice bottle" | -14.8 | -14.4 |
| "running out of road" | -13.9 | -13.8 |
| montage | -13.7 | -13.6 |
| relight | -11.9 | -11.6 |
| the charge at the lens | -12.9 | -12.1 |
| **the pass** | -13.6 | -10.3 |
| Mission Control | -16.6 | -16.3 |
| Moon descent | -18.2 | -23.0 |
| Moon touchdown | -11.3 | -14.5 |
| flag wide | -12.0 | -16.0 |
| Moon lift-off | -11.5 | -13.4 |
| re-entry | -13.7 | -13.2 |
| **cloud punch** | -15.0 | -11.2 |
| lawn touchdown | -14.7 | -13.4 |
| end card | -8.6 | -11.6 |
| the toast clink | (no toast) | -16.1 |

In V19 the pass sat 3.6 dB under the launch and level with the montage, and the flag wide, the Moon lift-off and the
end card were all louder than it. In V20 the order is the story's: the launch, then the pass (1 dB under it), then
the punch into the cloud, then the relight and the end card (1.3 dB under the pass); the Moon is quiet.

The spoken words against everything else in the speech band (300 Hz to 4 kHz, 50 ms frames, only the frames within
12 dB of the line's own loudest, so the pauses between words do not count):

| line | V19 p10 | V20 p10 | V19 median | V20 median |
|---|---|---|---|---|
| "Nice bottle. See you at the moon." | 16.9 | 25.3 | 24.2 | 30.0 |
| "I'm running out of road here. The same fuel won't get me there first." | 20.2 | 25.7 | 26.3 | 30.8 |
| "Oh, that's new." | 14.6 | 17.8 | 22.5 | 26.0 |
| "Well, that's not ideal." | 28.7 | 28.3 | 51.5 | 37.7 |

(dB of voice over everything else; p10 is the margin the worst tenth of the syllables still have.) The review's
"at or below the music" was the old clearance count (dialog.py), which also counts the pauses between words; on the
words themselves the two plot lines gain 5 to 8 dB.

## Research read for V20

- **The drop before the hit.** Trailer sound practice: the quiet before an impact is what makes it land, and a mix
  held at one loudness leaves impacts nothing to land against. Sources: Krotos, "5 Tips for Designing Trailer Sound
  Effects"; Rareform Audio, "What the Drop in Film Trailers Really Means" (the drop and the stopdown); IRPR Sound,
  "Why does my trailer lack impact?". Practitioner guidance, not research; it matches what the V19 measurements
  showed.
- **Dust on the Moon.** In vacuum the plume throws the regolith out in a flat, fast spray on ballistic paths (a NASA
  Kennedy analysis of Apollo landing video puts the ejection angle at 1 to 3 degrees); nothing billows or hangs.
  Sources: two NASA technical reports on the Apollo landings' plume and ejecta (NTRS 20130012063, 20140017853); the
  University of Texas dissertation on plume impingement and dust dispersal (2012). The generated landing still lets its dust hang for a second and a half; noted in the re-score.

## Checks

- Every new clip strip-checked frame by frame before the cut (the toast's clink at src 3.35, the descent's touchdown
  at src 3.0, the rival's flare at src 1.15, the cloud break-out at src 4.0), so every effect is placed on its frame.
- A half-size proof, the cut sheet (the last frame out beside the first frame in, all 73 cuts) and strips of the race,
  the Moon and the home stretch at two to four frames a second. The tray's last frame and the toast's first match.
- Bar alignment printed by music20.py: the join at bar 36.999 into bar 41.002; the last chord at 129.33 s, HQTOUCH
  + 0.84 to the hundredth; the rise on the flag wide to the frame; bar 23 on the pass to 5 ms.
- Loudness of the master (the mix stage): -15.5 LUFS integrated, loudness range 10.4 LU (V19: 8.8), max short-term
  -10.5 LUFS, true peak -1.50 dBTP. The delivered app file (ebur128): -16.5 LUFS integrated, loudness range 10.6 LU
  (V19: 8.0), true peak -1.3 dBTP.
- A whole-film scan of the render for jumps away from the cuts (frame-to-frame change at 96 by 54 against the local
  median, scratch v20/tools/scan.py) finds only the button's light, the eruption's whiteout, the relight flash, the
  Moon touchdown, the cloud break-out, the whip and the contrail, all by design; nothing in the new shots.

## Commands
```
npx remotion render src/index.ts FlavorRaceV20 out/race20/pic.mp4 --muted --concurrency=3 --crf=14 --log=error
cd sound && python3 music20.py ../out/race20_music.wav && python3 vo20.py ../out/race20_vo.wav && python3 cues20.py ../out/race20_sfx.wav
CUT=20 PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race20/pic.mp4 ../out/race20_music.wav ../out/race20_sfx.wav ../out/race20_vo.wav ../out/race20/final.mp4
```
The app encode (two-pass x264 3.5 Mb/s, BT.709, faststart) and the poster frame are the same as V19's; the copy
goes to final/public/media/flavor-race.mp4.

## The re-score

Scored on the same rubric, by the same standard as the V19 review: from the film as rendered, the cut sheet, the
strips and the measurements above. I have not heard the mix in a room; the sound score is from the measurements and
the cue placement.

| Area | Out of | V19 | V20 | what still costs |
|---|---|---|---|---|
| Idea and story | 20 | 16 | 19 | The four glasses are the room's four samples by count and by the hour it plays, not by a mark on them (the review suggested A to D) |
| Picture | 25 | 17 | 21 | The bottle's fins, legs and label layout still change between generated shots (3): every model draws its own bottle. The landing's dust billows and hangs, which it cannot do in vacuum (1) |
| Editing and pacing | 20 | 13 | 18 | The Earth is larger in the flag wide than in the landing wide a few seconds before it (1; a longer lens explains some of it, not all). The landing is told twice: the wide has her a frame from the ground, then the footpad close-up lowers the leg for two more seconds (1) |
| Sound and mix | 20 | 13 | 18 | Unheard in the room (1): the Moon now sits 5 dB lower than in V19 and could read as a dropout over a loud air handler. The end card's chord is within 1.3 dB of the pass (1) |
| Fit for the room | 15 | 12 | 14 | Two and a half minutes is still long for a send-off before lunch (1) |
| **Total** | **100** | **71** | **90** | |

The estimate before the build was the mid-80s; the measured mix and the shorter third act came in better than
that. The last ten points are not in this environment: one locked bottle across every generated shot means
regenerating most of the film from a single reference (the ElevenLabs workspace has about 260 credits left and
Higgsfield 10.91); a landing wide with the flag wide's Earth and vacuum dust is one more generation; the glasses
marked A to D on the tray is one more; the room check of the mix needs the room; and the length is a call for the
run of show.

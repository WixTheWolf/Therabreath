# THE FLAVOR RACE V24: the director's V23, finished at 2K

The note, with the director's own V23 cut (V22 re-edited from 1:30 to 1:38): "Cut out a lot of the race shots after
it is fueled with more flavor. Re-Edit and enhance the flavor montage starting at 1:07 to make it more fast-paced,
alive, juicy, watery, and flavorful with more flavor shots. Make them salivate after seeing the flavor montage. Keep
this video edit exactly how it is, but make sure to upscale everything to at least 2K resolution. Fix all audio, sfx,
music, sound design, and fix the C&D from morphing at 2:00." Then: "Take the Follow or Lead text out of that shot. The
hatch frame should not be frozen open up and but before the glasses come out."

Picture in src/FlavorRaceV24.tsx, sound in sound/cues24.py, vo24.py, music24.py, events24.py (mix2.py with CUT=24).
2:23.67 (3,448 frames), 2560 x 1440.

## V23, frame for frame

V23 was matched to V22 frame by frame (64 x 36 grey thumbnails against every library clip):

- frames 0 to 2164: V22 as it was (the relight one frame shorter, 42 frames);
- the climb, 97 frames: v15/58279c55 from 1.0 s, the two rockets side by side over the Earth, the Moon ahead, with a
  baked-in FOLLOW? OR LEAD? title;
- the streak, 46 frames: v15/7e9b6135 from 20.125 s, she streaks past the lens for the Moon, then the competitor's
  gold hull rushes the lens;
- black, 29 frames;
- V22 from its descent on (V22 frame 2405), 68 frames earlier, the descent fading up from black over its first 29
  frames;
- except the robot's first 33 frames, replaced by a held frame of the hatch close-up (v12/g7_robot); the robot take
  resumes where it would have been (src 4.04).

V24 keeps every cut point. What changed inside them:

| where | V23 | V24 |
|---|---|---|
| 1:07 to 1:16, the montage (227 frames, the score's bars 5 to 10) | 8 shots on 3, 4, 2, 2, 2, 2, 2, 7 beats | 20 shots, a cut on every beat and a run of half beats into the yuzu (below) |
| 1:30 to 1:34, the climb | the title FOLLOW? OR LEAD? over the sky | the same take with the title gone (v24/58279c55_clean) |
| 1:59 to 2:02, Church & Dwight | the real seal on the monument dissolving into the generated one in the last five frames of the shot, the generated seals on the tower in the wide, the whip and under the contrail | the real seal baked into every frame of the take: the monument, the tower in the wide and the tower under the contrail (v24/5b518a71_fix) |
| 2:06.7 to 2:08.0, the hatch | a held frame, the hatch already open | the hatch close-up in motion (g7_robot src 0.21 to 1.58): closed, it swings open, the glasses on the tray inside; out before the tray comes out |
| everything | 1920 x 1080 (V23 itself was 0.85 Mbps) | 2560 x 1440 from the sources |

## The montage

Two new reels from Gemini Omni 1.1 Flash (1080p, 10 s each, generated with sound; fruit, leaves, ice and water only,
dark studio, high-speed): v24/reelA (grapefruit burst, lime spritz, ice and mint into sparkling water, blueberries and
raspberries plunging, a green apple slice in a crown of water, a strawberry split and dripping) and v24/reelB (a water
crown among the fruit, mint into sparkling water, condensation on cold glass, watermelon juice thrown up, cherries and
grapes, a lemon wheel's spiral, ice into a glass, bubbles, a lime wheel bursting, lemon, mint and ice in one splash).
With the library's drop on the orange, frosted mint, watermelon burst and the yuzu:

| beat | shot | source |
|---|---|---|
| 0 (2 beats) | grapefruit bursts | reelA 0.00 |
| 2 | lime spritz | reelA 1.58 |
| 3 | watermelon juice | reelB 3.00 |
| 4 (2 beats) | one drop on the orange, the crown | v15/7e9b6135 0.40 |
| 6 | berries plunge | reelA 4.54 |
| 7 | ice and mint | reelA 3.04 |
| 8 | cherries and grapes | reelB 4.17 |
| 9 | green apple crown | reelA 6.04 |
| 10 | lemon wheel spiral | reelB 5.13 |
| 11 | water crown | reelB 0.00 |
| 12 | mint into sparkling water | reelB 1.04 |
| 13 | lime wheel bursts | reelB 7.13 |
| 14 | strawberry, its juice running | reelA 7.50 |
| 15 | ice crashes into a glass | reelB 6.29 |
| 16, 16.5, 17, 17.5 (half beats) | frosted mint, condensation, bubbles, watermelon burst | v15/1d8d16ab 3.4, reelB 1.96, reelB 8.17, v15/15190f35 1.66 |
| 18 | lemon, mint and ice in one splash | reelB 9.13 |
| 19 (5 beats) | the yuzu: the one | k/n08_yuzu 2.4 |

Sound: a wet, close sound on every cut (ElevenLabs Sound Effects v2: a citrus burst, a juice spritz, a watermelon
crunch, ice plunging into sparkling water, berries plopping, a crown splash, soda fizz, a juice drip, a big splash; 36
takes, the 16 with the cleanest onsets kept as wav/17_*), the reels' own sound under them on their frames, a cold fizz
bed, a riser through the half beats into the yuzu's split, and the score 2 dB under the splashes so they lead with it.

## The C&D seal

The take (v15/5b518a71, 1912 x 1080) is one wide of the headquarters (frames 0 to 65, the camera locked off), the
whip through the tree, then the tower under the contrail (frames 116 to 160, the camera tilting and tracking).
scripts/fix_cd_seals.py replaces all three generated seals with the real one (public/img/cd-seal.png) on every frame:
an ellipse fitted to the generated red ring per frame; the real seal mapped onto it as a pure stretch (an upright seal
on an upright wall stays upright; under the contrail the measured roll of the lettering, about 10 degrees, is kept),
1.5% larger so no generated red shows; lit through an affine colour map on four anchors (white, red, navy, skin) and a
gain map from the generated seal; softened, motion-blurred along the camera's travel under the contrail, and grained
to the footage's own noise. Where the tower ring enters past the frame's edge, its size and tilt come from the
whole-ring frames and its centre from matching the visible red. The generated TM beside the monument seal is covered
with the stone beside it. Nothing fades between real and generated any more.

## The title

scripts/clean_follow.py: a text-free re-render of the climb (Flux 3 Edit Video on ElevenLabs, 1248 x 704) lines up
with the original take to under a pixel; it is laid in only where the two differ strongly above the bottles (per
frame, feathered), so the bottles, the wordmark, the plumes and the Earth are all the original's.

## 2K

scripts/build_2k.py writes race/clips2k/<clip>.mp4 for every clip the cut uses, the same frames and length as the
source so every `from` holds, the aspect kept (1916 x 1080 becomes 2560 x 1444, so the tracked logo patches still
land): Topaz Video Upscale (Proteus, 2x) for the 720p sources over the spans the cut uses (one concatenated batch of
nine spans, 590 frames), Lanczos with a light unsharp for the 1080p sources and for the 720p frames outside those
spans. The picture renders at --scale=1.3333 (2560 x 1440), so the graphics, the patches and the end card are drawn
at 2K too. race/clips2k is not committed (1.4 GB); the Topaz batch is ElevenLabs generation VO5EDpEB23NawY7Gh3Q4.

The fall's source take (w/x_reentrypov) is not in the repository, so its 33 frames come from the V22 master
(v24/fall_v22) and play bare (no second grain or vignette).

## Sound

Every stem rebuilt on the V24 timeline. Outside the montage, the climb and the hatch, the design is V22's on its new
frames.

- The climb and the streak: her clean thrust and the competitor's grind side by side as they climb, a mid roar of
  both engines, her turbine and a riser into the streak; she streaks past the lens (a whoosh, a crack, a sub); the
  competitor's rough fire swells as its gold hull rushes the lens on the score's bar 23 (the same half-second drop
  before it, then 3 dB up), a reverse suck draws everything in, and the black cuts it off. The score is cut on the
  black and its throw rings out into the Moon's fade up; the Moon is quiet until the footpad, the landing thrust and
  the thruster puffs a little up so the descent is not a dropout.
- The lawn: the hatch close-up has its latch, its swing and a glass note from the tray inside; the arm, the tray and
  the glasses follow their new frames; the score's last chord still rings under the hatch.
- The mix: mix2.py, CUT=24, as V22 (PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5).

## Checks

- V24 against V23 frame by frame (64 x 36 grey): every hard cut in V23 is in V24 on the same frame; outside the
  montage, the climb and the hatch every segment is within 1 to 3.5 grey levels of V23 (V23's own encode at 0.85
  Mbps and the 2K sources), the climb differs where the title was (20.6), the hatch where it now moves (13.6). The
  fall's last frame first carried the cloud flash twice (the V22 master already has it); V24 skips the overlay's first
  two frames there, and the frame matches V23.
- Loudness (momentary maxima, LUFS): launch -9.3, the streak -10.6, the cloud punch -11.5, the relight -11.7, the end
  card -12.2, the climb -12.9, the montage -13.0 (V22 -13.6), the black -19.3, the Moon descent -27.9. Integrated
  -16.4 LUFS (ebur128 on the web file; -15.5 by mix2.py's own meter), true peak -1.3 dBTP. Every radio line clears
  the bed in the speech band (median 21 to 37 dB, dialog.py).
- Web file against the master: SSIM 0.986 over the montage.
- The site: tsc, `npm test` 13/13, `next build`, verify-workshop and the dash check; locally the film controls (39
  checks: 2560 x 1440, 143.67 s, sound), the team film modal, and the attendee leak scan (59 responses, nothing names
  the film, race media 403 to the room password and signed links).

## Spend (ElevenLabs)

Flux 3 Edit Video (the title) 916; two Gemini Omni 1.1 Flash reels 18,259; 36 sound effect takes about 150; Topaz
3,030. About 22,350 credits in all.

## Commands

```
python3 scripts/clean_follow.py <flux_edit.mp4> public/race/clips/v24/58279c55_clean.mp4
python3 scripts/fix_cd_seals.py public/race/clips/v24/5b518a71_fix.mp4
ffmpeg -i <the V22 app file> -vf "trim=start_frame=2831:end_frame=2876,setpts=PTS-STARTPTS" -an -c:v libx264 -preset slow -crf 10 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv public/race/clips/v24/fall_v22.mp4
python3 scripts/build_2k.py FlavorRaceV24                                   # Lanczos for every clip
python3 scripts/build_2k.py FlavorRaceV24 <topaz_out.mp4> <topaz spans.txt>  # Topaz over the 720p spans
npx remotion render src/index.ts FlavorRaceV24 out/race24/pic.mp4 --muted --concurrency=3 --crf=12 --scale=1.3333333333333333 --jpeg-quality=95
cd sound && python3 music24.py ../out/race24_music.wav && python3 vo24.py ../out/race24_vo.wav && python3 cues24.py ../out/race24_sfx.wav
CUT=24 PRESENT=1 RIDE=1.0 RIDE_DOWN=0.3 TARGET=-15.4 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race24/pic.mp4 ../out/race24_music.wav ../out/race24_sfx.wav ../out/race24_vo.wav ../out/race24/final.mp4
```
The topaz spans (clip, first frame, end frame): v15/f864fd4b 9 123, v14/ca51b3b2 359 434, v14/8fed7431 27 133,
v15/5d17c937 43 122, v15/7e9b6135 7 31, 292 336, 369 417, 480 529, v19/robot_lawn 94 145.

The app file (`final/public/media/flavor-race.mp4`, 84 MB): two-pass x264 4.5 Mbps (`-preset slow -tune film
-profile:v high -x264-params aq-mode=3:aq-strength=0.85:rc-lookahead=60 -maxrate 10000k -bufsize 16000k`),
`scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv`, tagged BT.709 TV range, AAC 192k from
`out/race24/final_mix.wav`, faststart. The poster is the same flag-wide frame as before, now 2560 x 1440.

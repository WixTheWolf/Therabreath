# THE FLAVOR RACE: session handoff (after V12.1)

## State
- V12.1, the team-screening cut: `src/FlavorRaceV12_1.tsx` (registered in `src/Root.tsx` as FlavorRaceV12-1). 2:19.4.
- V12.1 review copy: `docs/session/flavor-race-v12.1-review.mp4` (720p, 1.45 Mbps, AAC 160k). Mix on `mix2.py`'s meter: -16.1 LUFS integrated, LRA 10.1 LU, -1.2 dBTP (ffmpeg `ebur128` reads the review copy at -16.9 LUFS, LRA 9.5 LU, -1.0 dBTP).
- V12.1 is built on V12 with the favorite Version 4 sequences put back, from the director's V12.1 polish brief (below). V13 (`src/FlavorRaceV13.tsx`) was the wrong direction (it cut favorite scenes) and stays only for reference. V12 is unchanged.
- Clips are force-added under `public/race/clips/` (the folder is otherwise ignored). Recovered from the Higgsfield library for V12.1 (job id in brackets):
  - `s11_hq.mp4` (e6315e7c): the landing at home that V12 used but the repo was missing.
  - `k/n01_beauty.mp4` (0c4f52fd): the cap and stripe macros, and the engine cluster.
  - `k/n17_macro1.mp4` (2412dd59): the frosted valve with cold vapor.
  - `k/n21_glass.mp4` (4167700d): the firing-room window (V12.1 uses 12.4 to 14.7, the push toward the glass).
  - `k/n22_crowd.mp4` (aea82b08): the fans.
  - `s06_land_fix.mp4` (41723d26): Version 4's Moon landing with the locked cap.
  - `v121/gauge.mp4` (b4d0ba10): the pressure gauge.
  - The burner close-up the brief names (305c7cea) is `k/n18_nozzle.mp4`, byte for byte.
- Sound engine: `sound/cues12_1.py` (SFX stem), `sound/events12_1.py` (music automation and the silences), `sound/mix2.py` (`CUT=12.1`). New library WAVs in `sound/lib`: `x_crowd`, `x_applause` and the radio takes used for distant chatter (converted from `public/race/audio`).
- Higgsfield: `higgsfield/seedance.py` (Seedance 2.5 image-to-video with a spend ledger in `docs/session/hf-v13-jobs.json`). No credits were spent on V12.1; about $41 of the $100 balance is spent (all on V13).

## The V12.1 brief, and what the cut does with it
- Opening, the surprise (7 s): only macro photography of what looks like an ordinary TheraBreath bottle: white plastic catching the light as the ribbed cap slides in (`v11/02b1b193` 0 to 1.04 at 0.72x), the cap beaded with cold (`n01_beauty` 1.7), condensation over the orange stripe (`n01_beauty` 6.0), the label (`02b1b193` 2.35 to 2.95, cropped so the gantry stays out). No engines, legs, fins, gantry or full bottle. Sound: a distant machine hum, droplets, tiny ice cracks, a far vent, radio chatter so far away it never becomes words.
- First reveal: the wide silhouette held 2.0 s (`h/s10_reveal` 0 to 0.8 at 0.4x), then the lights as three events: bank (THUNK), bank (THUNK), every bank at once (measured off the clip at 1.06, 2.86 and 4.04 s), and the lit image holds 3.8 s after the blast. The score wakes on the first bank.
- Show off: hero push, umbilical release, frosted valve, the competitor, the engine cluster, THE FLAVOR RACE, Mission Control (Norco), the partnership card.
- Launch, in the brief's order: the count drives the cuts (three on the pad, two on the gauge, one on the button), then the burner close-up in near silence (metal ticks, fuel pressure, igniter chatter, a low spool, WHUMP on the white bloom); the pad erupts from above; both bottles leave the pad together (3.8 s, the music's lift-off peak); the firing-room window (the roar through thick glass: no highs, the pane buzzing, the room, consoles, radio); the fans (the roar far off, wind, yelling, the cheer, carried half a second over the cut); straight back to the rockets with the full roar. The sound and the music drop away at the edge of space.
- Discovery, arranged with purpose: what TheraBreath sees, one botanical (yuzu), the lab (citrus, FLAVOR LAB super), one liquid macro (the drop), the aroma, the formulation (the fuel cell), Mission Control leans in and sends it, the transmission, the relight. The rival only coughs; it is never destroyed.
- The Moon, cause before effect: the landing (V4's `s06_land_fix`: descent, flame on the regolith, touchdown, dust), the foot, the pole close-up (servo, ratchet, CHK), and only then the wide: the planted flag with Earth behind, held 3.15 s (the shot is still until 0.96 s, so it plays at 0.3x), then the lift-off at real speed. The music is silent from the touchdown and rises gently on the wide. The flag wide (`w/c7_flag`) is no longer used, so the result is never shown before the action. The late rival lands on the score's last accent (127.3 s).
- Ending: home (Ewing), six glasses in a quiet room (`v13/t2_tasting`, the gloved hand sets down the sixth), the music gone, a calm voice: "Would you like to taste it?" (`v10_robot_taste`), a second on the glasses, one second of black and silence, then TASTE THE FUTURE with both logos, held 6 s, the score's final gesture under it.

## Commands
- Picture: `npx remotion render src/index.ts FlavorRaceV12-1 out/race121_pic.mp4 --muted --concurrency=3 --props='{"stem":"none"}'`
- Stems: `npx remotion render src/index.ts FlavorRaceV12-1 out/race121_music.wav --codec=wav --props='{"stem":"music"}'`, then `"vo"`. Run renders one at a time (memory); each audio stem takes about 10 minutes.
- SFX: `cd sound && python3 cues12_1.py ../out/race121_sfx.wav`
- Mix: `CUT=12.1 PRESENT=1 RIDE=1.3 RIDE_DOWN=0.3 TARGET=-16 CEIL=-1.2 STEMS=1 python3 mix2.py ../out/race121_pic.mp4 ../out/race121_music.wav ../out/race121_sfx.wav ../out/race121_vo.wav ../out/race121_final.mp4`. With `STEMS=1` the processed stems are written next to the output as `<output>_music.wav` and so on, so never give the output the same prefix as the input stems.
- Review copy: two-pass x264 at 1450k from the master, `scale=1280:720:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`, audio from `<output>_mix.wav` as AAC 160k, `-movflags +faststart`.

## Mix notes
- The presentation rider lifts quiet passages (RIDE) and holds loud ones back (RIDE_DOWN, new, defaults to RIDE so older cuts mix as before). V13's `RIDE=1.6` pulled the sustained liftoff down by about 6 dB, so the long show-off drone ended up nearly as loud as the launch. V12.1 uses `RIDE=1.3 RIDE_DOWN=0.3`: the liftoff (-9.7 LUFS over the shot) and the pad eruption (-9.0) are the loudest moments, the firing room drops to -17.5, the crowd -15.9, the full roar returns at -11.7, the opening macros stay at -29.8 and the edge of space at -40.2.
- Measured silences in the processed music stem: digital silence through the count and the burner, at the edge of space, from the Moon touchdown to the flag wide, around the question and on the black before the card (the whole mix is -115 dBFS there).
- The VO stem was placed in Python with the composition's exact cue times (frame-rounded starts, gain 0.62) instead of a 10-minute Remotion render; the Remotion command above produces the same stem.

## Known nits
- The button shot (`k/n02_mctense` from 4.0) still shows the garbled button label for about two frames before the glove covers it. Starting at 4.08 removes it; fold it into the next picture render.

## Seedance ideas (not generated; each needs approval)
Each starts from a frame of approved footage and replaces a segment at the same length, so only the picture re-renders (about 20 minutes) and the sound stays valid. Start frames are cheap to pull again from the clips named.
- The droplet (opening, 5 s, about $5.69): from `k/n01_beauty` at 6.4 s, cropped to the stripe so no label text shows. One cold droplet breaks loose and slides down across the orange stripe while a wisp of cold vapor drifts through. Adds the two opening details no existing take has.
- Rockets beyond the glass (firing room, 4 s, about $4.55): from `k/n21_glass` at 14.6 s. The two bottle rockets visibly climb past the window frame on bright flames while the camera pushes toward the glass.
- Mission Control erupts (the relight, 4 s, about $4.55): from `h/mc_ff` at 6.6 s. Seen from behind, the team straightens and throws their arms up as the big screen flares green. A human payoff for the discovery, like the fans at the launch.
- Optional, the lamp banks (the reveal, 4 s, about $4.55): a stadium lamp bank slamming on row by row, cut in as two half-second inserts so each THUNK is seen. It interrupts the continuous wide, so try it as an alternate.

## Standing rules
No em or en dashes (`node playbook/scripts/check-dashes.mjs video/src video/sound video/docs`). No faces. Locked hero bottle (white, short ribbed orange cap). Rival labelled only COMPETITOR. Real logos unaltered. On-screen text as overlay only. No product claims. The Mr. Blue Sky file stays private and uncommitted. Ask before spending credits.

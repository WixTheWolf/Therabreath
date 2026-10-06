# THE FLAVOR RACE: session handoff (after V13)

## State
- Locked V13 cut: `src/FlavorRaceV13.tsx` (registered in `src/Root.tsx` as FlavorRaceV13). 1:58.65.
- V13 review copy: `docs/session/flavor-race-v13-review.mp4` (720p, 1.45 Mbps, AAC 160k). Mix: -16.1 LUFS integrated, LRA 9.8 LU, -1.2 dBTP on `mix2.py`'s meter (the meter V12's 7.2 LU was read on); ffmpeg `ebur128` reads the review copy at -17.0 LUFS, LRA 8.8 LU, -1.0 dBTP, where V12's review copy reads -16.8 LUFS, LRA 6.1 LU.
- V12 stays as it was (`src/FlavorRaceV12.tsx`, `docs/session/flavor-race-v12-review.mp4`).
- Clips used by V12 and V13 are force-added under `public/race/clips/` (the folder is otherwise ignored). The six new V13 shots are in `public/race/clips/v13/`. The rejected takes (`p1_particles`, `r1_reignite`) were not committed; `v13/t1_tasting` (five glasses) stays as the earlier candidate.
- Sound engine: `sound/cues13.py` (SFX stem), `sound/events13.py` (music automation and the silences), `sound/mix2.py` (`CUT=13`). Libraries in `sound/lib`, `sound/raw`, `sound/wav` are force-added.
- Higgsfield: `higgsfield/seedance.py` (Seedance 2.5 image-to-video: upload a start frame, submit, poll, download, with a spend ledger in `docs/session/hf-v13-jobs.json`). `higgsfield/index.ts` is the SDK example. Both read `HF_CREDENTIALS` (key-id:key-secret) from the environment or `video/.env.local` (ignored, never commit). In the cloud environment the key authenticates on `platform.higgsfield.ai`; `api.higgsfield.ai` answers 401 for it (the proxy-injected credential for that host is rejected), so both default to the platform host (`HF_BASE` overrides).

## What V13 did with the V12 review
- Removed: the partnership card, the cap macro, the button and nozzle inserts, the topdown, the fruit and crystal shots (`sees`, `yuzu`, `citrus`, `tea`, `cuke`, `cardamom`, `aroma`, `signal`), the touchscreen (`press`), the green glow (`life`), the glass-tube refuel (`transfer`), the old `cell`, `pass`, `cough` and `sputter`, and the robot.
- The choice: V12's burner cut grew ice crystals from 1.4 s, so it was regenerated clean (`v13/c1_cutoff`, start frame from the original, end frame a cleaned still). Its last frame is the first frame of the particles and the relight, so the engines die and relight from the same angle.
- Discovery chain: aroma drifting past the dark hull (`v13/p2_particles`), lean (`h/mc_ff` 5.1), drop, prism, canister seal (`w/s1_fuel` 9.5 to 12.5), clean relight (`v13/r2_reignite`, end frame from the original firing footage so the plumes stay real), hero overtake on clean blue-white exhaust (`v13/o1_overtake`), the rival's thrust flickers out and back with no smoke (`v13/f1_flicker`, started from the overtake's last frame).
- Silhouette 2.75 s (`h/s10_reveal` 0 to 0.9 s at 0.33x). Competitor gag 2.0 s (`v12/g9_late` 1.1 to 3.1). One shot home (`h/c11_homeward`). Tactile tasting at The Flavor Factory: a gloved hand sets down the sixth glass (`v13/t2_tasting`, 0.74x), super at the top of frame. No taste line.
- Real silences: the top, the count (the music stops dead on the cut to the cold pad; "one" lands 1.2 s before the ignition), the engines dying (the score winds down with them and rings out), the Moon touchdown, the tasting. The score keeps its own clock in four sections (see the comment above `MUSIC` in the cut); the gaps are carved in `events13.py`.
- One clean end card, 4 s: TASTE THE FUTURE. at 150 px, both logos at 104 px (about twice V12), no embers or flare; the score's final gesture lands on it and its decay carries the card to black.

## Higgsfield spend (Seedance 2.5, 1080p, 24 fps, no audio, $1.1372 per second)
- Kept: `c1_cutoff` 4 s, `p2_particles` 5 s, `r2_reignite` 4 s, `o1_overtake` 5 s, `f1_flicker` 4 s, `t2_tasting` 5 s.
- Rejected: `p1_particles` (gold glitter that read as sparks), `r1_reignite` (plumes rendered as solid glowing tubes).
- About $41 of the $100 balance (`python3 higgsfield/seedance.py ledger`). The dashboard at open.higgsfield.ai is the authority.

## Commands
- Picture: `npx remotion render src/index.ts FlavorRaceV13 out/race13_pic.mp4 --muted --concurrency=3 --props='{"stem":"none"}'`
- Stems: `--codec=wav --props='{"stem":"music"}'` and `"vo"`. Run renders one at a time (memory).
- SFX: `cd sound && python3 cues13.py ../out/race13_sfx.wav`
- Mix: `CUT=13 PRESENT=1 RIDE=1.6 TARGET=-16 CEIL=-1.2 STEMS=1 python3 mix2.py ../out/race13_pic.mp4 ../out/race13_music.wav ../out/race13_sfx.wav ../out/race13_vo.wav ../out/race13_final.mp4`. With `STEMS=1` the processed stems are written next to the output as `<output>_music.wav` and so on, so never give the output the same prefix as the input stems.
- Review copy: two-pass x264 at 1450k from the master, `scale=1280:720:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`, audio from `<output>_mix.wav` as AAC 160k, `-movflags +faststart`.

## Notes for V14
- Loudness range: the presentation rider at `RIDE=1.6` lands 9.8 LU. Without it the cut measures 13.3 LU (`RIDE=1.3`: 12.0). The rider's floor keeps the true silences silent (the top and the held breath stay near -55 dBFS); it lifts the aroma drift and the tasting by 4 to 5 dB, which suits a meeting room.
- The score was composed to V12 and is re-placed here, not rewritten. A score composed to this picture would let the pad's stop on the cold pad and the final gesture's entry on the end card breathe on their own.
- Rendering the music and VO stems through Remotion takes about 10 minutes each, because every frame is evaluated for the volume curves. Placing them in Python would be faster.
- The end card keeps TASTE THE FUTURE. above the logos. Drop the line if "one clean end card" meant logos only.
- The tasting super reads THE FLAVOR FACTORY / TASTING LAB · 1847 HOURS; confirm the wording.
- `v13/t1_tasting` (five glasses) stays in the repo as the earlier candidate; the cut uses `v13/t2_tasting` (six).

## Standing rules
No em or en dashes (`node playbook/scripts/check-dashes.mjs video/src video/sound video/docs`). No faces. Locked hero bottle (white, short ribbed orange cap). Rival labelled only COMPETITOR. Real logos unaltered. On-screen text as overlay only. No product claims. The Mr. Blue Sky file stays private and uncommitted. Ask before spending credits.

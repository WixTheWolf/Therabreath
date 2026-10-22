# THE FLAVOR RACE: session handoff (after V15)

## V15 polish and the 2K master (21 October 2026)
- The film the presentation plays is now the polished V15 at 2560 x 1440: `final/public/media/flavor-race.mp4` (H.264 High, 24 fps, two-pass 3.9 Mbps, AAC 192k, BT.709 TV range, faststart, about 94 MB so it stays under GitHub's 100 MB file limit), with a 2560 x 1440 poster (`flavor-race-poster.jpg`, the onboard look back at 0:45). `docs/session/flavor-race-v15-review.mp4` is the earlier 720p review copy, before the polish.
- Polish, with every cut point where the director put it:
  - No faces: the warning beat (`px31`) opened on 1.7 s of a 1960s control room with two men's faces. Those 1.7 s (`warn`) now push in on the room's red alarm beacon (zoom 1.8 from 72% 42%, softened 1 px over the proxy's blocks), then the proxy's own cut (frame 41) to TheraBreath's warning light (`warnlight`).
  - One grey Moon: TheraBreath standing, the flag wide and the stinger's late rival were generated on a brown regolith (CIELAB chroma 9 to 22 against 1 to 4 on the descent, the footpad and the Earthrise). `scripts/grade_moon.py` pulls only warm, weakly coloured pixels toward grey (the cap, the flag's stripe, the engine glow, Earth and the wordmark are left alone): `v15/moon_stand_grey` (k 0.65), `v15/c7_flag_grey` (w/c7_flag from 9 s, k 0.85, gate 26 to 40), `v15/g9_late_grey` (k 0.7). Ground chroma after: 3.2, 8.5, 4.2 to 5.3.
  - The real Church & Dwight seal on the headquarters monument (`cdsign`): the generated monument carried a drawn copy (the arm redrawn). `scripts/make_cd_seal.py` fits the real seal (`public/img/cd-seal.png`, Church & Dwight's logo from Brandfetch) to the generated ring's ellipse, lights it through an affine colour map on four anchors (white, red, navy, skin) and the sign's own fall-off, softens and grains it, and covers the generated TM with the stone beside it; the real seal's own TM lands there. The camera is locked off (under 0.2 px over the 47 frames used); `public/race/v15/cd_seal_track.json` is track_sign.py's track anyway. `LogoPatch` takes the source width per patch (`sw`, this clip is 1912 wide). The small seal on the building behind is still the generated one.
  - Sound: the 1960s room tone comes back under the beacon; the alarm leads there (+14 dB, settling to +2 on the hull light) with the score 5 dB down (`events15.py`), so in its band it sits 4 dB under the score instead of 12; the hull creak moves onto the hull shot.
- Commands:
  - Grades: `python3 scripts/grade_moon.py public/race/clips/w/c7_flag.mp4 9 15 public/race/clips/v15/c7_flag_grey.mp4 0.85 26 40`, `... v122/moon_stand.mp4 0 4.05 .../v15/moon_stand_grey.mp4 0.65`, `... v12/g9_late.mp4 0 5.05 .../v15/g9_late_grey.mp4 0.7`.
  - Seal: `ffmpeg -ss 0 -i public/race/clips/v15/5b518a71.mp4 -frames:v 1 -vf "scale=in_color_matrix=bt601:in_range=tv,format=rgb24" ref0.png`, `python3 scripts/make_cd_seal.py ref0.png public/race/v15/cd_seal_patch.png`, `python3 scripts/track_sign.py public/race/clips/v15/5b518a71.mp4 0 2.958 40,600,780,940 public/race/v15/cd_seal_track.json`.
  - Picture at 2K: `npx remotion render src/index.ts FlavorRaceV15 out/race15p_pic.mp4 --muted --concurrency=3 --crf=12 --scale=1.3333333333333333 --jpeg-quality=95` (2560 x 1440, about 29 minutes; the graphics and the end card render natively at 2K, the clips are scaled by the browser). The render is full-range BT.601.
  - Stems and mix as below (V15 commands), with `TARGET=-15.2`: -16.0 LUFS integrated, 8.9 LU range, -1.5 dBTP.
  - Delivery: two-pass x264 `-preset slower -tune film -profile:v high -x264-params aq-mode=3:aq-strength=0.85:rc-lookahead=60 -b:v 3900k -maxrate 9000k -bufsize 14000k`, `-vf scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p`, tagged BT.709 TV range, audio from `out/race15p_final_mix.wav` as AAC 192k, `-movflags +faststart`. A test of the launch at this rate held SSIM 0.989 against the master with no visible blocking in the fire, the smoke or dark space; light grain reduction before the encode gained nothing.
- Not redone for the polish: the V15 Premiere package (`premiere/V15/`) still has the earlier `warn`, `stand`, `flagwide`, `cdsign` and stinger shots.

## State
- V15, the final cut: the director's own edit of 12 October 2026 (a 3:04 review proxy of 77 shots, with the flavor montage and the sound unfinished), conformed shot for shot to the full-resolution sources and finished: `src/FlavorRaceV15.tsx` (registered in `src/Root.tsx` as FlavorRaceV15). 3:03.6, 4,406 frames at 24 fps, 75 shots.
- V15 review copy: `docs/session/flavor-race-v15-review.mp4` (720p, two-pass 1.1 Mbps so it stays under 30 MB, AAC 160k).
- The editable Premiere timeline of V15: `premiere/V15/THE_FLAVOR_RACE_V15.xml` with 85 files in `media/` (about 445 MB: the 75 shots with up to 1 s handles, the supers, the end card, the two flashes, the vignette, the three stems and the reference mix; 14 markers; 24 fps). How to open it and the shots that need care: `premiere/README.md`.
- Clips, force-added under `public/race/clips/v15/`:
  - 24 Higgsfield clips the director's edit uses, named by the first 8 characters of their job id. 15 are trimmed to the span the cut uses plus 1 s handles, cut on whole seconds (the composition's `from` values are the originals' minus whole seconds); the other 9 are the originals.
  - `px26`, `px27`, `px31`: the director's shots 26, 27 and 31 (two race angles and the warning light, at 0:55, 0:59 and 1:07). Their sources are not in the Higgsfield library (the library's 225 videos were matched frame by frame, and 18 uploads would not download), so they play from the director's review proxy, upscaled to 1080p (lanczos, light unsharp, CRF 14, no audio). Replace them when the originals arrive. Shot 35 (at 1:17) was also missing; the new montage replaces it.
  - `g5_life_fix`, `n02_monitors_fix`: two repaired clips (below).
- Tracks and patches for the repairs: `public/race/v15/` (the Mission Control sign and jacket patches with their tracks, and the tracks for the hull, the close-up and the monitors).
- Sound engine: `sound/music15.py` (the music stem, placed from the score files on their own clocks), `sound/cues15.py` (the SFX stem, 225 cues), `sound/events15.py` (music automation and the silences), `sound/vo15.py` (the VO stem), `sound/mix2.py` (`CUT=15`).
- Higgsfield: V15 spent no credits.
- V14 and everything before it are unchanged and stay for comparison.

## V15: the director's edit, and what V15 does with it
- Kept exactly: the structure, the shot order and the cut points of the director's edit, with its personality and spectacle (the opening macro surprise, EVERY CATEGORY HAS A RACE, the stadium lights, Mission Control at The Flavor Factory, the crowd, FOLLOW? OR LEAD?, the trip home to Church & Dwight, and the competitor finally landing on the Moon after the end card).
- From V14 and the V12.1 brief: a score cut to picture, a sound for every beat, the silences, the flag continuity (the pole goes in before the flag is seen), the end card, and the mix targets.
- Chapters:
  1. The surprise: macros of what looks like an ordinary giant bottle, EVERY CATEGORY HAS A RACE, the silhouettes and the stadium lights, the rival, the hero cap, Mission Control, the cap in the cold, the count, the burner.
  2. Launch: ignition, the crowd, both rockets leave together, the long lens, the onboard look back, the hull, the pitch-over.
  3. The race: neck and neck, the competitor commits and pulls away, and TheraBreath's warning light comes on.
  4. Discovery and the montage: The Flavor Factory searches; the engines go quiet; nine flavor shots on the score's beats (tea, cucumber and tea, coconut, watermelon, lime, cucumber, mint, chamomile, yuzu), then the pipette, the glove, FLAVOR TRANSFER READY, the world's flavors in orbit, the transfer; TheraBreath comes alive and the engines relight on the score's return (103.4 s); FOLLOW? OR LEAD?; it overtakes for the Moon.
  5. The Moon: the descent in silence, the footpad ("The Flavor has landed"), TheraBreath on the Moon, the pole, and only then the flag wide (the clean "TheraBreath / THE FUTURE OF FLAVOR" flag), the Earthrise.
  6. Home: The Flavor Factory sees it, the lift-off for home, re-entry, down through the clouds to New Jersey, the campus, Church & Dwight headquarters, the landing, six samples, the tasting, silence, black, THE FUTURE OF FRESHNESS / LET'S TASTE WHAT'S NEXT. with both logos.
  7. The stinger: back on the Moon, the competitor finally arrives.
- Taken out of the director's edit: the shot that spells the rival's label wrong (the pull-away runs on instead), and the director's slow motion on the first Mission Control shot (its time went to the cap in the cold).
- Frame-level repairs (a cut detector run over the whole picture, every hit checked by eye; every cut point stays where the director put it): the transfer button's in-point moves 1 frame later (its first frame was the fuel coupling from the shot before it in the source), the flagpole's 5 frames later (a wide of a campus building), the eruption's 1 frame earlier (its last frame was the lift-off's first, so that frame played twice), and the rival's engine shot now ends on the source's own cut into the pull-away (5 frames of the pull-away played twice).
- For the director to decide: the warning beat (`px31`, 1:07.6) opens on about 1.6 s of a vintage control room where two men are seen in profile, before the warning light. The standing rule is no faces. Cutting it would move every later cut off the score's beats, so V15 keeps it as the director cut it; the alternatives are a no-face shot of the same length, or the warning light from earlier in its source once the original arrives.

## Generated text in the V15 clips, and what the cut does with it
- The Mission Control wall sign and the operator's jacket (`h/mc_ff`) wore a generated copy of The Flavor Factory wordmark with a mangled R. Each now carries the real logo, tracked to the camera (`scripts/track_sign.py` finds a partial affine per frame with ORB and RANSAC; `scripts/make_sign_patch.py` builds the patch: a panel in the sign's finish, or the jacket with its generated lettering inpainted, and the real `public/img/tff-logo.png` on it). The logo's black lettering is set in the sign's cream and the jacket's grey, with its coloured dots kept, so it reads on a dark surface; if the brand has an official reversed logo, swap it in.
- The hull shot (`v14/8fed7431`): the small print under the wordmark reads HEALTHY HOUTH, so it is softened by a tracked blur (`soften` on the segment: feathered ellipses placed in source pixels and moved by `label_track_hull.json`).
- The close-up as TheraBreath comes alive (`v12/g5_life`): the small print reads FREBS HZEATH. HEALTHY HOUTHE / ORAL RINGE, so it is lifted off the label frame by frame (`scripts/fix_text.py life`: the dark strokes in a tracked band under the stripe are inpainted from the label around them, so the glow rising through the bottle stays its own). The label reads TheraBreath alone.
- The Flavor Factory's monitors (`k/n02_mctense`): both screen headers read THEABRRTH ONE, so `scripts/fix_text.py monitors` inpaints them and sets THERABREATH ONE in their place, tracked to the screens.
- The launch button (`k/n02_mctense`): its label reads LHARNCT on the shot's first frame, before the glove covers it, and in fragments under the glove. `scripts/fix_text.py button` lifts the letters off: white strokes inside the band the label is printed in (moving down as the button is pressed), filled from the red around them only, with the acrylic cover's long straight edges kept. The button reads blank.
- The Mission Control sign track lost the sign on the shot's last frame (the patch slipped and the generated ORY showed beside it); the track carries its motion on over that frame instead.
- Spelled correctly and left as they are, but part of the generated picture rather than overlays (the standing rule is overlay-only text; they are the director's picks): EVERY CATEGORY HAS A RACE (`v15/b92b53de`), FOLLOW? OR LEAD? (`v15/58279c55`) and FLAVOR TRANSFER READY on the button (`v15/7e9b6135`).
- The Church & Dwight headquarters sign (`v15/5b518a71`) is a generated version of their logo, not the real mark: worth a brand check before the film goes outside the team.
- Everywhere else the small print reads the director's tagline correctly (FRESH BREATH, HEALTHY MOUTH / ORAL RINSE); on the umbilical and the end of the chase it is partly garbled but too small and brief to read.

## Commands (V15)
- Repairs (from `video/`):
  - Mission Control: `python3 scripts/track_sign.py public/race/clips/h/mc_ff.mp4 0.333 3.40 60,20,560,250 public/race/v15/sign_track_mc1.json` and `... 0.333 2.958 240,690,670,850 public/race/v15/jacket_track_mc1.json`; the patches from the frame at 0.333 s (`ffmpeg -ss 0.333 -i public/race/clips/h/mc_ff.mp4 -frames:v 1 ref.png`) with `python3 scripts/make_sign_patch.py ref.png public/race/v15/sign_patch_mc.png sign` and `... jacket_patch_mc.png jacket`.
  - Hull: `python3 scripts/track_sign.py public/race/clips/v14/8fed7431.mp4 1.278 5.45 420,300,800,560 public/race/v15/label_track_hull.json`
  - Close-up: `python3 scripts/track_sign.py public/race/clips/v12/g5_life.mp4 0 2.0 560,280,1300,660 public/race/v15/label_track_life.json`, then `python3 scripts/fix_text.py life public/race/clips/v12/g5_life.mp4 0 48 public/race/clips/v15/g5_life_fix.mp4 public/race/v15/label_track_life.json`
  - Monitors: `python3 scripts/track_sign.py public/race/clips/k/n02_mctense.mp4 2.655 4.2 180,140,1720,640 public/race/v15/screens_track_mc.json`, then `python3 scripts/fix_text.py monitors public/race/clips/k/n02_mctense.mp4 64 36 public/race/clips/v15/n02_monitors_fix.mp4 public/race/v15/screens_track_mc.json`
  - Launch button: `python3 scripts/fix_text.py button public/race/clips/k/n02_mctense.mp4 95 23 public/race/clips/v15/n02_button_fix.mp4`
- Picture: `npx remotion render src/index.ts FlavorRaceV15 out/race15_pic.mp4 --muted --concurrency=3 --crf=14` (about 17 minutes). The delivered master was the first render with nine stretches re-rendered after their repairs (`--frames=440-502`, `635-652`, `778-796`, `968-1066`, `1517-1621`, `2216-2251`, `2353-2394`, `3096-3126`, `3587-3634`) and spliced in frame for frame in one encode; a fresh render gives the same picture.
- Stems (from `video/sound`): `python3 music15.py ../out/race15_music.wav`, `python3 cues15.py ../out/race15_sfx.wav`, `python3 vo15.py ../out/race15_vo.wav`.
- Mix: `CUT=15 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-15.2 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race15_pic.mp4 ../out/race15_music.wav ../out/race15_sfx.wav ../out/race15_vo.wav ../out/race15_final.mp4`. On this mix mix2's meter reads 0.8 LU hotter than ffmpeg's ebur128, so `TARGET=-15.2` lands at -16.0 LUFS.
- Review copy: two-pass x264 at 1100k from the picture, `scale=1280:720:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`, tagged `-color_range tv -colorspace smpte170m -color_primaries bt709 -color_trc bt709` (Remotion encodes with the BT.601 matrix, and ffmpeg's scaler keeps it, so the tag must say so), audio from `out/race15_final_mix.wav` as AAC 160k, `-movflags +faststart`.
- Premiere package: `python3 premiere/bake_shots.py FlavorRaceV15 premiere/V15`, `python3 premiere/build_media.py FlavorRaceV15 premiere/V15 out/race15_final`, `python3 premiere/make_xml.py premiere/V15 --root C:/FlavorRace/V15`.

## Mix notes (V15)
- The score (`v12_flavor_score`) plays in sections on its own clock, never stretched (`music15.py`): the dark opening swells as the pad floods with light and stops on the cut to the cap in the cold (the count, the spark and the bloom play in silence); one unbroken run from the ignition, with the lift-off swell (36.0 s) on both rockets clearing the pad, the race's downbeat (51.0 s) on the chase, the quiet glass section under the search and the montage (cut on its beats), and its rise into the return (103.4 s) as the engines relight; the warm section from the flag wide; the V12 finale from the clouds, its main theme opening on the campus and fading under the tasting; and the score's final gesture (150.0 s) on the end card.
- The silences (`events15.py`): the edge of space (from the pitch-over to the chase) and the Moon (from the descent to the flag wide); the hush before the card is silent.
- Readings (ffmpeg ebur128): the 24-bit mix is -16.0 LUFS integrated, 9.3 LU loudness range, -1.5 dBTP; the review copy is -16.1 LUFS, 9.2 LU, -1.1 dBTP.

## Known nits (V15)
- `px26`, `px27` and `px31` are upscaled from the director's proxy, so they are softer than the shots around them, and `px31` opens on two faces in profile (above).
- The repaired close-up, monitors and button clips cover only a few frames past the cut, so their handles are short (no head handle on the close-up or the monitors, one frame on the button). On the button's tail handle the acrylic edge shows a small step where the label was lifted.
- The tracks hold their first and last values outside the frames the film uses, so in a handle a patch or a softened region can slip off the surface it covers (the Premiere markers say where).
- The Premiere package leaves out the moving film grain.

## V14 (the previous cut)
- V14, cut from the 19 clips the director generated in Higgsfield on 6 October 2026: `src/FlavorRaceV14.tsx` (registered in `src/Root.tsx` as FlavorRaceV14). 2:33.2.
- V14 review copy: `docs/session/flavor-race-v14-review.mp4` (720p, 1.45 Mbps, AAC 160k).
- The editable Premiere timelines: `premiere/V14/` and `premiere/V12.2/` (one FCP7 XML each for File > Import, and every file it uses in `media/`). How to open them, the track layout and the shots that need care: `premiere/README.md`.
- V12.2, V12.1 and V13 are unchanged and stay for comparison.
- Clips are force-added under `public/race/clips/` (the folder is otherwise ignored). New for V14, in `v14/`: 18 of the 19 Seedance 2.5 clips, named by the first 8 characters of their Higgsfield job id (1280x720, 24 fps, about 30 s each). `27198920` is not used: its rival is drawn blue and silver and carries a TheraBreath label. The Moon flag wide, the lift-off and the late rival are V12's (`v12/g13_moonlift`, `v12/g9_late`), cooled and desaturated to match the new grey regolith.
- Sound engine: `sound/cues14.py` (SFX stem), `sound/events14.py` (music automation and the silences), `sound/mix2.py` (`CUT=14`), `sound/vo_place.py` (the VO stem without a Remotion render).
- Higgsfield: V14 spent no credits (the clips are the director's own generations). About $55.75 of the $100 is spent in total, all before V14.

## V14: the story, chapter by chapter
1. Launch and race. A beauty shoot for a bottle, lit from behind (the hull, the ribbed orange cap, the wordmark, an amber bottle with a dark cap), two silhouettes on the pad, held, and every stadium lamp at once: THERABREATH VS. COMPETITOR, the title, the partners card. The count drives the cuts (three on the pad, two on the igniter spark, one inside the nozzle as it stutters), the bloom, the pad erupts, both rockets leave together, the long lens, into the cloud, above it at sunrise, the launch site far below, Earth through the glass, silence at the edge of space. The race is cut on the score's half-bars from its downbeat: neck and neck over Earth, the caps in the heat, the labels, the engines, both in front of the Moon, until TheraBreath gains a small, believable lead.
2. The flavor field and the detection. TheraBreath flies into a field of refracted flavor; its sensors glow among the prisms; the field beads on the hull. At The Flavor Factory (Norco) a pipette drips into a beaker, the sample answers under the analyzer (the field appears on the monitor), the vial is sealed into the transmitter and the pulse runs. The signal reaches the cap, flows through the intake, and the engines reignite on the score's return (103.4 s). TheraBreath turns for the Moon; the rival's warning light comes on and it smokes; TheraBreath streaks away alone.
3. The Moon. The approach and the descent in silence, the footpad touches down ("The Flavor has landed"), the arm raises the flagpole, the flag wide with Earth behind as the score returns, the lift-off for home, and only then does the rival land, late, on the score's last accent (127.3 s).
4. Home. Out of the Moon's shadow into the sun, down through the clouds at sunrise, the rooftop pad at Church & Dwight headquarters (Ewing, New Jersey), touchdown, a gloved hand sets the sixth clear sample beside five, the rack, black, TASTE THE FUTURE.

## Generated text in the V14 clips, and what the cut does with it
- Pushed under the letterbox by framing: the truck with a generated copy of The Flavor Factory logo on both pad wides (zoom 1.28 from the top, down 118 px), the misspelled line under the wordmark on the label close-up (it reads HEALTHY HOUTH; zoom 1.13 from the top), and a garbled TheraBreath name on the front of the transmitter (zoom 1.07 from the top).
- Blurred in place (`blur` regions on a segment, grouped by strength, moving with the push-in; `premiere/bake_shots.py` bakes the same): the beaker's print in the lab, the line under the wordmark on the droplets, receive and sunlight shots, the transmitter's badge, a sticker on the hatch latch, and the product bottle's print and fake organic seal in the last lab shot (the seal harder).
- Cut around: the hatch ends at 23.25 s, before the flag opens on a garbled wordmark; the rack ends before the bottle sharpens and the source's own title card; the streak ends before a generated line of copy (from 27 s in `58cfbf13`); the opening macros avoid the parts of `d9bc7723` where the rival is drawn wrong.
- The tagline itself comes from the director's reference rocket ("FRESH BREATH. HEALTHY MOUTH / ORAL RINSE"), so it stays where it is too small to read (the race, the prisms, the Moon wides).
- The location supers sit on a soft shadow of their own (`Super14`), so they read on the bright lab bench and the sunlit rooftop.

## Commands (V14)
- Picture: `npx remotion render src/index.ts FlavorRaceV14 out/race14_pic.mp4 --muted --concurrency=3 --props='{"stem":"none"}'` (about 18 minutes; the blurred shots are the slow ones).
- Music stem: `npx remotion render src/index.ts FlavorRaceV14 out/race14_music.wav --codec=wav --props='{"stem":"music"}'` (about 10 minutes). Run renders one at a time (memory).
- VO stem: `python3 sound/vo_place.py FlavorRaceV14 out/race14_vo.wav`
- SFX: `cd sound && python3 cues14.py ../out/race14_sfx.wav`
- Mix: `CUT=14 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-16 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race14_pic.mp4 ../out/race14_music.wav ../out/race14_sfx.wav ../out/race14_vo.wav ../out/race14_final.mp4`
- Review copy: as for V12.2 below, from `out/race14_final.mp4` and `out/race14_final_mix.wav`.
- Premiere package: `python3 premiere/bake_shots.py FlavorRaceV14 premiere/V14`, `python3 premiere/build_media.py FlavorRaceV14 premiere/V14 out/race14_final`, `python3 premiere/make_xml.py premiere/V14 --root C:/FlavorRace/V14`.

## Mix notes (V14)
- The score plays in four sections on its own clock: the dark drone under the beauty shoot and the lights, cut on the cold pad (the count plays in silence); one unbroken run from the eruption (the lift-off swell at 36.0 s) through the race (the race opens on its downbeat at 51.0 s), the quiet glass section under the flavor field and the lab, and its rise into the return as the engines reignite; then from the flag wide its last accent on the rival's landing and the warm home section, fading under the sixth sample; and the final gesture on TASTE THE FUTURE.
- The silences (`events14.py`): the count, the spark and the bloom; the edge of space (cut on the porthole, back on the race's downbeat); and the Moon, from the cut to the approach until the flag wide. Every cut and reopen sits between the score's hits.
- Readings (ffmpeg ebur128): the 24-bit mix is -16.8 LUFS integrated, 8.3 LU loudness range, -1.5 dBTP; the review copy is -16.9 LUFS, 8.3 LU, -1.3 dBTP.
- With `norm='rms'` in `sdx.Mix.put`, 0 dB means -20 dBFS RMS: V14's opening ambience was first written 15 dB too quiet for that reason and is now level with V12.2's opening macros.

## Known nits (V14)
- The V14 sources are 720p at 24 fps, so they are softer than the 1080p V12.2 shots, most of all where the cut pushes in (the pad wides at 1.28, the label close-up at 1.13).
- The blur regions are fixed in the frame; where a bottle drifts in a handle, the line can slip out from under its blur (the Premiere markers say where).
- The Premiere package leaves out the moving film grain.

## V12.2 (the previous cut)
- V12.2, the team-screening cut with the director's notes on V12.1: `src/FlavorRaceV12_2.tsx` (registered in `src/Root.tsx` as FlavorRaceV12-2). 2:27.2.
- V12.2 review copy: `docs/session/flavor-race-v12.2-review.mp4` (720p, 1.45 Mbps, AAC 160k).
- The editable Premiere timeline of V12.2: `premiere/V12.2/` (one FCP7 XML for File > Import, and every file it uses in `media/`). How to open it, the track layout and the shots that need care: `premiere/README.md`.
- V12.1 (`src/FlavorRaceV12_1.tsx`, `docs/session/flavor-race-v12.1-review.mp4`) is unchanged and stays for comparison. V13 (`src/FlavorRaceV13.tsx`) was the wrong direction and stays only for reference.
- Clips are force-added under `public/race/clips/` (the folder is otherwise ignored). New for V12.2, all in `v122/`:
  - `v122_droplet.mp4`, `v122_window.mp4`, `v122_mc_erupts.mp4`: the three Seedance 2.5 clips the director approved (job ids in the ledger, `docs/session/hf-v13-jobs.json`).
  - `fans2.mp4`: the fans in front of both launch towers. No generation: `scripts/fans_two_towers.py` composites a second tower and glow into `k/n22_crowd` from a mirrored, time-offset copy of the same footage, kept behind the crowd by a luminance matte.
  - `m1_reel.mp4`: `v11/m1_pullaway` 0.3 to 1.9 s played in reverse, so the gap closes (TheraBreath reels the rival in). `ffmpeg -ss 0.3 -t 1.6 -i public/race/clips/v11/m1_pullaway.mp4 -vf "reverse,setpts=PTS-STARTPTS" -an -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p public/race/clips/v122/m1_reel.mp4`
  - `moon_stand.mp4`: the new Moon landing shot, the 1080p Seedance final (7e918801) of draft 2512a280: TheraBreath standing on the Moon, Earth rising behind it.
  - `850bde0e.mp4`: both rockets dead level, the rival's red light and one puff (the V11 pick, recovered from the Higgsfield library).
- Sound engine: `sound/cues12_2.py` (SFX stem), `sound/events12_2.py` (music automation and the silences), `sound/mix2.py` (`CUT=12.2`).
- Higgsfield: `higgsfield/seedance.py` (Seedance 2.5 image-to-video with a spend ledger; `HF_OUT` picks the clip folder). V12.2 spent $14.79 by the ledger's published rates (three 1080p clips); about $55.75 of the $100 is spent in total.

## The notes on V12.1, and what V12.2 does with them
- Seedance clips 1 to 3, cut in:
  - The droplet (opening): replaces the stripe macro. One cold droplet slides down across the orange stripe while cold vapor drifts through (`v122_droplet` 1.8 to 4.0 s). Sound: condensation beads, a tiny wet glide, the vapor breathing past, and the drop landing somewhere far below.
  - Rockets beyond the glass (firing room): both rockets climb past the top of the window on twin columns of fire, cropped in (`v122_window` from 1.6 s, zoom 1.16 to 1.22). The take's first 1.5 s show glowing blobs on the noses, so the cut starts after them. The roar through thick glass, the pane rattling and the radio chatter are unchanged.
  - Mission Control erupts (the relight): seen from behind, the team springs up with arms high as the wall screen flares green (`v122_mc_erupts` 1.05 to 2.55 s, zoomed 1.13 from the bottom so the garbled wall sign stays under the letterbox).
- The fans (1.7 s), cropped in to show two rockets: `fans2` at zoom 1.33 to 1.37 shows both launch towers, each glowing at the base, the fans shielding their eyes and then cheering.
- The Moon landing: `s06_land_fix` is gone. The Higgsfield history has no Seedance 2.0 model (every Seedance job is 2.5), and the only other Seedance landing is that one, so V12.2 uses the existing Seedance shot of TheraBreath on the Moon (`moon_stand`, shifted down 80 px so the whole cap clears the letterbox). The Moon now runs: the descent in silence, the foot touches down ("The Flavor has landed"), TheraBreath standing on the Moon with Earth rising, the pole close-up, and only then the planted-flag wide (also shifted down, so the cap is whole).
- Back in: tea, cucumber and rose petals (V12's beats: 0.6, 0.7 and 0.5 s, with V12's grades and sounds), the prism (1.6 s, its shimmer and one high glass note), the black-smoke sputter (`w/s6_comp` 6.7 to 8.2 s), and the robot arm with the six clear samples (`v12/g7_robot`, V12's hatch, arm, clinks, servo hesitation and the small musical smile), which replaces the six-glass tasting.
- Taken out: the VO "Would you like to taste it?" The ending is the robot arm in the quiet, the score fading under it, black, then the end card.
- The launch button: `k/n02_mctense` 4.06 to 4.60 s at 0.75x. The glove is already on the button (the garbled label never shows) and the shot cuts before the finger lifts (4.65 s).
- The race:
  - Before the choice, the rival never gets far: it edges ahead by about a length (`m1_pullaway` 0.4 to 1.15 s; V12.1 ran on until it was a dot at the Moon).
  - After the relight, the comeback builds to the end, cut on the score's half-bars (0.75 s) so the cutting quickens with the music: the relight, Mission Control erupts, TheraBreath at full throttle, it reels the rival in (the gap visibly closes), dead level as the rival's red light comes on and it coughs one puff, the side profile as TheraBreath's nose inches ahead (0.75 s), the surge past (held 2.25 s), the rival sputters black smoke, and TheraBreath is a bright star at the Moon while the rival flickers in the foreground. The score's drive is cut on the descent to the Moon and its throw rings out over the silence.
  - Sound: TheraBreath's clean thrust runs the whole chase and climbs in pitch; the rival's rough idle grows as it is reeled in and falls away after the surge; a sub and a deep push of air on the surge; the sputter carries into the last shot as little flickering coughs.

## The V12.1 brief (V14 keeps its beats)
- Opening, the surprise (6.6 s of macros): plastic and the ribbed cap, the cap beaded with cold, the droplet across the stripe, the label. No engines, legs, fins, gantry or full bottle.
- First reveal: the silhouette held 2.0 s, then the lights as three events (bank, bank, blast), the lit image held 3.8 s.
- Launch order: the count drives the cuts, the burner close-up in near silence, the pad erupts, both bottles leave the pad together, the firing-room window, the fans, back to the rockets, silence at the edge of space.
- The Moon: cause before effect, the result never shown before the action. The late rival lands on the score's last accent (127.3 s).
- Ending: six samples, silence, black, TASTE THE FUTURE with TheraBreath × The Flavor Factory, held 6 s.

## Commands (V12.2)
- Picture: `npx remotion render src/index.ts FlavorRaceV12-2 out/race122_pic.mp4 --muted --concurrency=3 --props='{"stem":"none"}'`
- Music stem: `npx remotion render src/index.ts FlavorRaceV12-2 out/race122_music.wav --codec=wav --props='{"stem":"music"}'`. Run renders one at a time (memory); the music stem takes about 10 minutes.
- VO stem: the same Remotion command with `"vo"`, or place the two lines at the composition's frame-rounded cue times at gain 0.62 (what V12.2 did).
- SFX: `cd sound && python3 cues12_2.py ../out/race122_sfx.wav`
- Mix: `CUT=12.2 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-16 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race122_pic.mp4 ../out/race122_music.wav ../out/race122_sfx.wav ../out/race122_vo.wav ../out/race122_final.mp4`. With `STEMS=1` the processed stems are written next to the output as `<output>_music.wav` and so on, so never give the output the same prefix as the input stems.
- Review copy: two-pass x264 at 1450k from the master, `scale=1280:720:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`, audio from `<output>_mix.wav` as AAC 160k, `-movflags +faststart`.
- Premiere package (after the picture render and the mix with `STEMS=1`): `python3 premiere/bake_shots.py FlavorRaceV12_2 premiere/V12.2` (every shot framed as the film shows it, with 1 s handles that stop where the source cuts to another shot; about 15 minutes, or name shot ids to re-bake only those), `python3 premiere/build_media.py FlavorRaceV12_2 premiere/V12.2 out/race122_final` (graphics and stems; about 5 minutes), `python3 premiere/make_xml.py premiere/V12.2 --root C:/FlavorRace/V12.2`.

## Mix notes (V12.2)
- V12.2 is mixed with `RIDE=1.7 RIDE_DOWN=0.45 CEIL=-1.5` (V12.1 used 1.3 and 0.3). The stronger rider keeps the loudness range where V12.1's was (10.1 LU on mix2's meter; it rose to 10.8 at 1.3 and 0.3 once the robot tail was cut short), and the lower ceiling leaves room for the AAC encode (the review copy peaked at -0.7 dBTP with -1.2).
- Readings (ffmpeg ebur128): the 24-bit mix is -16.7 LUFS integrated, 9.8 LU loudness range, -1.5 dBTP; the review copy is -16.8 LUFS, 9.8 LU, -1.3 dBTP. mix2's own meter reads the same mix at -16.1 LUFS (its K-weighting is an approximation, so `TARGET` lands about 0.6 LU quieter on a standard meter).
- The robot tail is cut before the black: the arm, the clink and the crystals stop by robot+5.25 s, so the hush before the end card is silent (below -115 dBFS).
- With `STEMS=1`, mix2 writes the stems after the level rider and before the limiter, so the three stems sum to the mix before limiting (the Premiere package relies on this).

## Known nits (V12.2)
- Generated footage carries garbled in-scene text: the launch button's label, the gauge's mirrored dial lettering and the wall sign in `v122_mc_erupts`. The framing keeps each one out of frame or under the letterbox, so a re-cut has to keep it (the Premiere sequence has a marker on each). The Mission Control room shots and the touchscreen show the same screen text, wall sign and jacket lettering as in V12.
- `v122_window` has glowing blobs on the rockets' noses for its first 1.5 s; the cut starts at 1.6 s.
- The Premiere package leaves out the moving film grain.

## Seedance ideas (not generated; each needs approval)
- The lamp banks (the reveal, 4 s, about $4.55): a stadium lamp bank slamming on row by row, cut in as two half-second inserts so each THUNK is seen. It interrupts the continuous wide, so try it as an alternate.
- A cleaner rockets-beyond-the-glass take (4 s, about $4.55), if the team wants the rockets' first second too: the same prompt from a start frame without the two pad glows, so nothing rides up on the noses.

## Standing rules
No em or en dashes (`node playbook/design/scripts/check-dashes.mjs .` from the repo root, as CI runs it). No faces. Locked hero bottle (white, short ribbed orange cap). Rival labelled only COMPETITOR. Real logos unaltered. On-screen text as overlay only. No product claims. The Mr. Blue Sky file stays private and uncommitted. Ask before spending credits.

## V16, the full-length film re-cut from V15.1 (22 October 2026)
- `src/FlavorRaceV16.tsx` (registered as FlavorRaceV16, 24 fps, 3,871 frames, 2:41). The treatment, the shot list, what
  came out and why, the voice lines, the score and the sound are in `docs/session/RACE16.md`.
- Score: five new ElevenLabs Music v2.5 cues in `public/race/audio/v16_*.mp3` (D, 152.02 BPM, bar 1.5787 s), placed on
  their bar lines by `sound/music16.py`. Effects: `sound/cues16.py` (every cue on its picture frame; the pipette drop at
  +1.20, the melon at +0.15, the coconut at +0.03 and +0.40, the orange drop at +0.38, the press at +0.60, the relight
  at +0.27). Voice: `sound/vo16.py` (eleven radio lines from the V4 sessions). Baton: `sound/events16.py`; `mix2.py`
  with `CUT=16` dips the score and the effects deeper under speech.
- New clips committed: `public/race/clips/m/n01_padmoon.mp4` and the three grey-Moon grades from the V15 polish.
- Commands are at the end of `docs/session/RACE16.md`. The app copy (`final/public/media/flavor-race.mp4`) is the
  1080p picture with the mix, two-pass x264 at 3.5 Mbps, faststart; the poster is the flag wide.

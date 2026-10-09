# THE FLAVOR RACE: session handoff (after V14)

## State
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

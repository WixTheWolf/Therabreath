# THE FLAVOR RACE: session handoff (after V12.2)

## State
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

## The V12.1 brief (still in force)
- Opening, the surprise (6.6 s of macros): plastic and the ribbed cap, the cap beaded with cold, the droplet across the stripe, the label. No engines, legs, fins, gantry or full bottle.
- First reveal: the silhouette held 2.0 s, then the lights as three events (bank, bank, blast), the lit image held 3.8 s.
- Launch order: the count drives the cuts, the burner close-up in near silence, the pad erupts, both bottles leave the pad together, the firing-room window, the fans, back to the rockets, silence at the edge of space.
- The Moon: cause before effect, the result never shown before the action. The late rival lands on the score's last accent (127.3 s).
- Ending: six samples, silence, black, TASTE THE FUTURE with TheraBreath × The Flavor Factory, held 6 s.

## Commands
- Picture: `npx remotion render src/index.ts FlavorRaceV12-2 out/race122_pic.mp4 --muted --concurrency=3 --props='{"stem":"none"}'`
- Music stem: `npx remotion render src/index.ts FlavorRaceV12-2 out/race122_music.wav --codec=wav --props='{"stem":"music"}'`. Run renders one at a time (memory); the music stem takes about 10 minutes.
- VO stem: the same Remotion command with `"vo"`, or place the two lines at the composition's frame-rounded cue times at gain 0.62 (what V12.2 did).
- SFX: `cd sound && python3 cues12_2.py ../out/race122_sfx.wav`
- Mix: `CUT=12.2 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-16 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race122_pic.mp4 ../out/race122_music.wav ../out/race122_sfx.wav ../out/race122_vo.wav ../out/race122_final.mp4`. With `STEMS=1` the processed stems are written next to the output as `<output>_music.wav` and so on, so never give the output the same prefix as the input stems.
- Review copy: two-pass x264 at 1450k from the master, `scale=1280:720:flags=lanczos:in_range=pc:out_range=tv,format=yuv420p`, audio from `<output>_mix.wav` as AAC 160k, `-movflags +faststart`.
- Premiere package (after the picture render and the mix with `STEMS=1`): `python3 premiere/bake_shots.py FlavorRaceV12_2 premiere/V12.2` (every shot framed as the film shows it, with 1 s handles that stop where the source cuts to another shot; about 15 minutes, or name shot ids to re-bake only those), `python3 premiere/build_media.py FlavorRaceV12_2 premiere/V12.2 out/race122_final` (graphics and stems; about 5 minutes), `python3 premiere/make_xml.py premiere/V12.2 --root C:/FlavorRace/V12.2`.

## Mix notes
- V12.2 is mixed with `RIDE=1.7 RIDE_DOWN=0.45 CEIL=-1.5` (V12.1 used 1.3 and 0.3). The stronger rider keeps the loudness range where V12.1's was (10.1 LU on mix2's meter; it rose to 10.8 at 1.3 and 0.3 once the robot tail was cut short), and the lower ceiling leaves room for the AAC encode (the review copy peaked at -0.7 dBTP with -1.2).
- Readings (ffmpeg ebur128): the 24-bit mix is -16.7 LUFS integrated, 9.8 LU loudness range, -1.5 dBTP; the review copy is -16.8 LUFS, 9.8 LU, -1.3 dBTP. mix2's own meter reads the same mix at -16.1 LUFS (its K-weighting is an approximation, so `TARGET` lands about 0.6 LU quieter on a standard meter).
- The robot tail is cut before the black: the arm, the clink and the crystals stop by robot+5.25 s, so the hush before the end card is silent (below -115 dBFS).
- With `STEMS=1`, mix2 writes the stems after the level rider and before the limiter, so the three stems sum to the mix before limiting (the Premiere package relies on this).

## Known nits
- Generated footage carries garbled in-scene text: the launch button's label, the gauge's mirrored dial lettering and the wall sign in `v122_mc_erupts`. The framing keeps each one out of frame or under the letterbox, so a re-cut has to keep it (the Premiere sequence has a marker on each). The Mission Control room shots and the touchscreen show the same screen text, wall sign and jacket lettering as in V12.
- `v122_window` has glowing blobs on the rockets' noses for its first 1.5 s; the cut starts at 1.6 s.
- The Premiere package leaves out the moving film grain.

## Seedance ideas (not generated; each needs approval)
- The lamp banks (the reveal, 4 s, about $4.55): a stadium lamp bank slamming on row by row, cut in as two half-second inserts so each THUNK is seen. It interrupts the continuous wide, so try it as an alternate.
- A cleaner rockets-beyond-the-glass take (4 s, about $4.55), if the team wants the rockets' first second too: the same prompt from a start frame without the two pad glows, so nothing rides up on the noses.

## Standing rules
No em or en dashes (`node playbook/scripts/check-dashes.mjs video/src video/sound video/docs`). No faces. Locked hero bottle (white, short ribbed orange cap). Rival labelled only COMPETITOR. Real logos unaltered. On-screen text as overlay only. No product claims. The Mr. Blue Sky file stays private and uncommitted. Ask before spending credits.

# THE FLAVOR RACE: editable Premiere timeline

`V12.2/` holds THE FLAVOR RACE V12.2 as a Premiere Pro timeline you can re-cut by hand: one import file and every file it uses.

## Open it in Premiere
1. Copy the `V12.2` folder to `C:\FlavorRace\`, so the media sits in `C:\FlavorRace\V12.2\media`. (Anywhere else works too: see step 3.)
2. Open your project (for example `THERABREATH_FLAVOR_RACE.prproj`) and choose **File > Import**, then pick `C:\FlavorRace\V12.2\THE_FLAVOR_RACE_V12.2.xml`. Premiere adds one bin, `THE FLAVOR RACE V12.2 (editable)`, and changes nothing else in the project.
3. If the folder is somewhere else, Premiere asks to link media: select the first file, choose **Locate**, open the `media` folder and pick that file. With **Relink others automatically** on, it finds the rest in the same folder.
4. Open the sequence `THE FLAVOR RACE V12.2 (editable)` in the `Sequences` bin. It is 1920x1080, 30 fps, 48 kHz stereo, 2:27.2.

## What is on the timeline
| Track | Contents |
| --- | --- |
| V1 | Every shot (64), named `S01 sheen` to `S64 robot` in film order, with the 0.5 s dissolve into `S31 sees` |
| V2 | The title and the supers (transparent), the partners card and the TASTE THE FUTURE end card (full frame, over black) |
| V3 | The three light flashes (lights, ignition, relight) |
| V4 | The letterbox (118 px bars) and the vignette, one long transparent layer |
| A1 | VO stem (the count, "The Flavor has landed") |
| A2 | Effects stem (the full V12.2 sound design) |
| A3 | Music stem (the score as placed and shaped in the V12.2 mix) |
| A4 | The final V12.2 mix, for reference only: its clip is disabled, so enable it to compare |

The stems are the V12.2 mix's own processed stems (after the level rider, before the final limiter), all lowered by the same 5 dB so they cannot clip when they play together without that limiter. Raised 5 dB and limited, together they are the V12.2 mix: for the final export, put a Hard Limiter on the Mix track with Input Boost 5 dB and Maximum Amplitude -1.5 dB. The reference mix on A4 is at the film's full level (-16.7 LUFS), so it plays 5 dB louder than the stems; mute A1 to A3 when you compare.

## How the shots were prepared
- Each shot is its own file (`media/S<nn>_<name>.mp4`), framed exactly as the film shows it: the clip speed, the slow push-in and its anchor point, the vertical shift on the Moon shots, the camera shake on the launch and the colour lift on the tea and rose shots are built in. Nothing on the timeline needs effects to look right.
- Every shot has up to 1 second of handle at both ends, so you can trim, extend, slip and reorder freely. A handle is shorter where the source clip ends or cuts to another shot, so extending a shot never flashes a frame of a different one. In the handles the push-in holds its first or last size.
- Some generated clips change angle partway through a shot (`S12 standoff`, `S19 liftoff`, `S30 choice`, `S55 foot`, `S61 homeward` and `S62 descent` among them). The film keeps those changes, so trimming such a shot can drop one of its angles.
- To change a shot's speed or framing, or to use other parts of a clip, the original full-length clips are in `video/public/race/clips/` (drag that folder into the Project panel; Premiere makes a bin per subfolder).
- The effects stem is designed to the V12.2 picture: when you move shots, cut the effects with them, or ask for a new sound pass after the picture is locked.
- The graphics are separate files on V2 to V4: the title, the supers, the flashes and the letterbox are QuickTime Animation with transparency; the two cards are H.264 over black (they only ever play over black). Each is exactly as long as in the film, except that the partners card stops at the end of its black: in the film its last, almost faded frame lies over the next shot's first frame.
- Not included: the moving film grain (it is on top of everything in the film and is purely cosmetic).

## Shots to treat with care
The sequence has a marker on each of these, so they show in the Markers panel:
- `S04 label`: cropped hard right so the launch gantry stays out of the opening macros. Its tail handle tilts down to the fins and the smoke, which the opening never shows.
- `S15 gauge`: zoomed in so the mirrored dial lettering stays under the letterbox.
- `S16 button`: the button's label is garbled in the source; the shot starts once the glove covers it and ends before the finger lifts.
- `S20 window`: a generated shot; for the first 1.5 s of the source the rockets have glowing blobs on their noses, and the head handle shows them, so keep the in-point.
- `S21 crowd`: the second launch tower is a composite; wider framing would show a face at the left edge.
- `S22 tbfire`: past its out-point the source flies on past the camera into space (a morph, not a cut), so extend its tail only a few frames.
- `S29 edge`: the rival edges ahead by about a length. In the tail handle it pulls far ahead, which the notes on V12.1 ruled out.
- `S46 mcerupt`: a generated shot; the framing keeps a garbled wall sign under the letterbox.
- `S48 reel`: footage played in reverse (the gap closing).
- `S54 approach`: the music is silent from here to the flag wide by design.
- `S56 stand`: the new Moon landing shot, shifted down so the whole cap clears the letterbox.
- `S64 robot`: the score fades out under it; the tray settles in the quiet.
- The original clips also contain things the cut avoids, for example `v122/850bde0e` (dead level) has a fireball from 4.9 s, and the rival is never destroyed.

## Rebuilding the package
From `video/`, after a picture render and a mix with `STEMS=1`:
```
python3 premiere/bake_shots.py FlavorRaceV12_2 premiere/V12.2
python3 premiere/build_media.py FlavorRaceV12_2 premiere/V12.2 out/race122_final
python3 premiere/make_xml.py premiere/V12.2 --root C:/FlavorRace/V12.2
```
`--root` is the folder the XML expects the package in; Premiere relinks from anywhere else.

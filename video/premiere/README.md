# THE FLAVOR RACE: editable Premiere timelines

Two cuts of THE FLAVOR RACE are here as Premiere Pro timelines you can re-cut by hand, each as one import file and every file it uses:
- `V14/`: V14, cut from the clips generated on 6 October 2026 (2:33.2, 55 shots).
- `V12.2/`: V12.2, the team-screening cut (2:27.2, 64 shots).

## Open one in Premiere
The steps use V14; for V12.2 read `V12.2` for `V14`.
1. Copy the `V14` folder to `C:\FlavorRace\`, so the media sits in `C:\FlavorRace\V14\media`. (Anywhere else works too: see step 3.)
2. Open your project (for example `THERABREATH_FLAVOR_RACE.prproj`) and choose **File > Import**, then pick `C:\FlavorRace\V14\THE_FLAVOR_RACE_V14.xml`. Premiere adds one bin, `THE FLAVOR RACE V14 (editable)`, and changes nothing else in the project.
3. If the folder is somewhere else, Premiere asks to link media: select the first file, choose **Locate**, open the `media` folder and pick that file. With **Relink others automatically** on, it finds the rest in the same folder.
4. Open the sequence `THE FLAVOR RACE V14 (editable)` in the `Sequences` bin. It is 1920x1080, 30 fps, 48 kHz stereo.

## What is on the timeline
| Track | V14 | V12.2 |
| --- | --- | --- |
| V1 | Every shot (55), `S01 hull` to `S55 rack` in film order, all hard cuts | Every shot (64), `S01 sheen` to `S64 robot` in film order, with the 0.5 s dissolve into `S31 sees` |
| V2 | The title, the two location supers (transparent, each on its soft shadow), the partners card and the TASTE THE FUTURE end card (full frame, over black) | The title and the supers (transparent), the partners card and the end card (full frame, over black) |
| V3 | The three light flashes (lights, eruption, relight) | The three light flashes (lights, ignition, relight) |
| V4 | The letterbox (118 px bars) and the vignette, one long transparent layer | The same |
| A1 | VO stem (the count, "The Flavor has landed") | The same |
| A2 | Effects stem (the full sound design) | The same |
| A3 | Music stem (the score as placed and shaped in the mix) | The same |
| A4 | The final mix, for reference only: its clip is disabled, so enable it to compare | The same |

The stems are each mix's own processed stems (after the level rider, before the final limiter), all lowered by the same amount so they cannot clip when they play together without that limiter: 2.5 dB for V14, 5 dB for V12.2. Raised by that amount and limited, together they are the mix: for the final export, put a Hard Limiter on the Mix track with Input Boost set to that amount and Maximum Amplitude -1.5 dB. The reference mix on A4 is at the film's full level (V14 -16.8 LUFS, V12.2 -16.7 LUFS), so it plays louder than the stems; mute A1 to A3 when you compare.

## How the shots were prepared
- Each shot is its own file (`media/S<nn>_<name>.mp4`), framed exactly as the film shows it: the clip speed, the slow push-in and its anchor point, the vertical shift on the Moon shots, the camera shake on the launch, the colour grades (the tea and rose shots in V12.2, the reused Moon shots in V14) and V14's blurred regions are built in. Nothing on the timeline needs effects to look right.
- Every shot has up to 1 second of handle at both ends, so you can trim, extend, slip and reorder freely. A handle is shorter where the source clip ends or cuts to another shot, so extending a shot never flashes a frame of a different one. In the handles the push-in holds its first or last size.
- Some generated clips change angle partway through a shot (in V12.2: `S12 standoff`, `S19 liftoff`, `S30 choice`, `S55 foot`, `S61 homeward` and `S62 descent` among them). The film keeps those changes, so trimming such a shot can drop one of its angles.
- To change a shot's speed or framing, or to use other parts of a clip, the original full-length clips are in `video/public/race/clips/` (drag that folder into the Project panel; Premiere makes a bin per subfolder).
- Each effects stem is designed to its own picture: when you move shots, cut the effects with them, or ask for a new sound pass after the picture is locked.
- The graphics are separate files on V2 to V4: the title, the supers, the flashes and the letterbox are QuickTime Animation with transparency; the two cards are H.264 over black (they only ever play over black). Each is exactly as long as in the film, except that the partners card stops at the end of its black: in the film its last, almost faded frame lies over the next shot's first frame.
- The flashes on V3 are set to the Screen blend mode, as the film blends them; if a Premiere version drops that on import, set Effect Controls > Opacity > Blend Mode to Screen on the three flash clips.
- Keep the letterbox layer on V4 switched on: the shots are baked full frame, and on several V14 shots the bars are what hide generated text (the truck lettering on the pad wides, the line under the wordmark, the name on the transmitter).
- Not included: the moving film grain (it is on top of everything in the film and is purely cosmetic).

## Shots to treat with care: V14
The sequence has a marker on each of these, so they show in the Markers panel:
- `S03 label`: keep the tail; past the out-point a misspelled line under the wordmark (HEALTHY HEATH) comes into plain view.
- `S11 liftoff` and `S13 climb`: keep the heads; the head handles show a pad worker (seen from behind) whom the film never shows.
- `S06 standoff` and `S07 padcold`: zoomed 1.28 from the top and shifted down 118 px, so a truck lettered with a generated copy of The Flavor Factory logo (bottom left) sits under the letterbox. Keep the framing.
- `S24 tblabel`: zoomed 1.13 from the top, so the misspelled line under the wordmark (it reads HEALTHY HOUTH) sits under the letterbox.
- `S30 droplets`, `S35 receive` and `S50 sunlight`: the misspelled line under the wordmark is blurred in place, at fixed positions; in the handles the bottle drifts, so check the line stays covered if you extend them. `S50 sunlight` also must not be extended at the tail: about 0.2 s past the out-point the rival flies into frame beside TheraBreath, which the story rules out.
- `S31 lab`: the beaker's generated print (a logo, a nonsense word, wrong graduations) is blurred in place.
- `S34 transmit`: zoomed 1.07 from the top, so a garbled TheraBreath name on the front of the box sits under the letterbox; the badge at the top right is blurred in place.
- `S46 hatch`: ends at 23.25 s in the source; from 23.3 s the flag shows a garbled wordmark and the camera pulls back, so do not extend the tail. A sticker on the latch is blurred in place.
- `S47 moonwide`, `S48 moonlift`, `S49 gag`: V12's Moon shots, cooled and desaturated to match the new grey regolith; the flag wide plays at 0.26x.
- `S16 porthole` and `S43 approach`: the music is silent by design, from the porthole to the race's downbeat and from the approach to the flag wide.
- `S54 samples`: the generated product bottle's print and fake organic seal are blurred in place (the seal harder). The score has faded by +3.0 s; the sixth sample is set down at +4.05 s in the quiet.
- `S55 rack`: do not extend the tail; the bottle soon comes into focus with its garbled print, and the source ends on its own generated title card.
- The original clips also contain things the cut avoids: `v14/27198920` is not used (its rival is drawn blue and silver with a TheraBreath label), parts of `v14/d9bc7723` show the rival drawn the same way, and `v14/58cfbf13` shows a generated line of copy from 27 s.

## Shots to treat with care: V12.2
These are marked in the V12.2 sequence the same way:
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

## Rebuilding a package
From `video/`, after a picture render and a mix with `STEMS=1`:
```
python3 premiere/bake_shots.py FlavorRaceV14 premiere/V14
python3 premiere/build_media.py FlavorRaceV14 premiere/V14 out/race14_final
python3 premiere/make_xml.py premiere/V14 --root C:/FlavorRace/V14
```
For V12.2: `FlavorRaceV12_2`, `premiere/V12.2`, `out/race122_final` and `--root C:/FlavorRace/V12.2`. `--root` is the folder the XML expects the package in; Premiere relinks from anywhere else.

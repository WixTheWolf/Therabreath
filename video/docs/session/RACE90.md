# THE FLAVOR RACE: the 90-second cut (1:32)

The send-off at the end of the morning (11:48, after the Pipeline read-back, before lunch). Built from V15, the
director's final cut, with every competitor beat taken out: no rival on the pad, no two-rocket launch, no race angles,
no pull-away, no warning light, no FOLLOW? OR LEAD? (two rockets in frame), no stinger. What is left is TheraBreath's
own flight: the surprise, the count, the launch, the engines going quiet, The Flavor Factory finding the flavor, the
transfer and the relight, the Moon, home to Church & Dwight, the tasting, the card.

## Picture: `src/FlavorRace90.tsx` (registered as FlavorRace90, 24 fps, 2,202 frames)
- Same segment table as V15 (same ids, same clips, same repairs and tracks), with shots removed or trimmed on their
  tails, so every V15 sound cue keeps its offset from its cut.
- The stadium-lights shot keeps only its first 0.9 s, the lamp hit (it pans up to both rockets and the rival's label
  after that); a new shot, `padwide` (`v_cap`), holds TheraBreath alone in the floodlights for the rest of that beat.
- Three shots change clip, under the same ids: `ignite` and `liftoff` play `v_moon` (TheraBreath alone on the pad,
  then clearing it; the same clip continues across the crowd cutaway), `crowd` plays `k/n22_crowd` (one rocket in the
  glare). One new shot, `turn` (`m/n08_turn`): one turn over Earth where the race was.
- The montage keeps tea, coconut, watermelon, cucumber and yuzu (lime, chamomile and the cucumber-tea shot are out; the
  blind flight's ingredients stay off screen).
- Structure: I the surprise 0 to 21 s (macro, EVERY CATEGORY HAS A RACE, the lights, Mission Control, the count,
  the burner); II launch 21 to 31 s; III the flight 31 to 37 s (the turn, the engines go quiet, SEARCHING);
  IV discovery 37 to 54 s (the montage, the pipette, FLAVOR TRANSFER READY, the transfer, TheraBreath comes alive,
  the relight, for the Moon); V the Moon 54 to 66 s (descent in silence, the footpad, "The Flavor has landed",
  standing on the Moon, the pole, the flag wide, the Earthrise); VI home 66 to 86 s (lift-off for home, re-entry,
  the clouds, New Jersey, the Church & Dwight sign, the landing on the lawn, the robot, the tasting, silence); the
  end card 86 to 91 s, black.

## Sound: `sound/music90.py`, `sound/events90.py`, `sound/cues90.py`, `sound/vo90.py`, `sound/mix2.py` (`CUT=90`)
- Music: the same score files on their own clocks (nothing stretched), re-placed: the opening swell on the first lamp
  and out on the cap in the cold; the lift-off swell (36.0) as TheraBreath clears the pad; silence at the edge of
  space; the race's downbeat (51.0) on the turn; the drive cut as the engines go quiet; the quiet glass section (75.0)
  from the search, with eight bars removed on a bar line so its rise (103.4) lands on the relight; the Moon in
  silence; the warm section on the flag wide; the finale's main theme on the Church & Dwight sign; the final gesture
  on the card.
- Effects: cues15.py, every cue warped onto the new cut by `timeline.make_warp` (a cue in a removed shot or a trimmed
  tail is dropped; a pre-lap into the next kept shot survives). The count's words are re-anchored to the cap shot.
- Voice: the count and "The Flavor has landed", as V15.

## Commands (from `video/`)
```bash
npx remotion render src/index.ts FlavorRace90 out/race90/pic.mp4 --muted --concurrency=3 --crf=14
cd sound && python3 music90.py ../out/race90_music.wav && python3 cues90.py ../out/race90_sfx.wav && python3 vo90.py ../out/race90_vo.wav
CUT=90 PRESENT=1 RIDE=1.7 RIDE_DOWN=0.45 TARGET=-15.2 CEIL=-1.5 STEMS=1 python3 mix2.py ../out/race90/pic.mp4 ../out/race90_music.wav ../out/race90_sfx.wav ../out/race90_vo.wav ../out/race90/final.mp4
```
The app copy (`final/public/media/flavor-race.mp4`) is the 1080p picture with the mix, x264 CRF 21, faststart.

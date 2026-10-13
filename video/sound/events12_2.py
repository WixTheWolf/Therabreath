# The music's share of the baton on the V12.2 cut (V12.2 times, dB). The five score sections are placed in
# FlavorRaceV12_2.tsx on the score's own clock; this shapes them where the machinery or the people must lead and
# carves the real silences: (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw
# of the last moment of music, so the silence arrives as a decay, not a dropout.
from timeline import Cut

V = Cut('FlavorRaceV12_2')
T = V.t
OUT = T('choice', 0.72)          # TheraBreath's flames go out
MUSIC_AUTO = [
    (0.0, 0),
    (T('liftoff', -0.05), -2), (T('liftoff', 0.6), 0),                             # the crack and the roar punch through, then the release
    (T('window', -0.02), 0), (T('window', 0.1), -2),                               # indoors: the score stays, a little under the room
    (T('crowd', -0.02), -2), (T('crowd', 0.2), -5),                                # it sits under the people
    (T('tbfire', 0.3), -5), (T('tbfire', 0.7), 0),                                 # and retakes control as the cheer clears
    (T('choice', 0.1), 0), (OUT, -6),                                              # it winds down with the engines
    (T('drop', 0.55), 0), (T('drop', 0.7), -4), (T('drop', 1.8), 0),               # the drop lands in near silence
    (T('cell', 2.45), 0), (T('cell', 2.6), -3), (T('cell', 3.2), 0),               # the latch
    (T('mcerupt'), 0), (T('mcerupt', 0.2), -2), (T('throttle'), 0),               # the room erupts under it
    (T('level', 0.5), 0), (T('level', 0.6), -3), (T('level', 1.0), 0),             # the rival's puff reads
    (T('sputter', 0.05), 0), (T('sputter', 0.15), -3), (T('winner', 0.4), 0),      # and so does the black smoke
    (T('moonwide', -0.1), -6), (T('moonlift'), 0),                                 # it rises gently under the wide
    (V.TOTAL, 0),
]
MUSIC_CUTS = [
    (T('padcold'), T('padign', 0.15), 1.8, -6, 0.0),        # the count, the burner, the WHUMP: no music. The swell rises out of the eruption
    (T('pitch', 0.05), T('side', -0.1), 1.6, -8, 0.6),      # the edge of space: silence; the race opens the rhythm again
    (OUT, T('sees', -0.5), 2.6, -6, 0.0),                   # the engines die; the glass section creeps in under what TheraBreath sees
    (T('approach'), T('moonwide', -0.1), 2.6, -6, 0.0),     # the race ends on the cut to the Moon: the drive rings out over the descent,
]                                                           # then the landing, the foot, the pole in silence; it returns on the wide

# The music's share of the baton on the V14 cut (V14 times, dB). The four score sections are placed in
# FlavorRaceV14.tsx on the score's own clock; this shapes them where the machinery must lead and carves the real
# silences: (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last
# moment of music, so the silence arrives as a decay, not a dropout. The cut and reopen points sit between the
# score's own hits (measured off the score), so no hit is clipped.
from timeline import Cut

V = Cut('FlavorRaceV14')
T = V.t
DRIP = T('lab', 1.0)             # the pipette drips
SEAT = T('seal', 1.7)            # the vial seats in the transmitter
LAND = T('gag', 1.7)             # the rival finally lands, on the drive's last accent
MUSIC_AUTO = [
    (0.0, 0),
    (T('erupt', 0.1), -4), (T('liftoff', 0.2), -4), (T('liftoff', 0.32), 0),      # the eruption leads; the score takes over on its jump
    (T('rivallabel', 0.85), 0), (T('rivallabel', 0.95), -3), (T('rivallabel', 1.6), 0),   # the rival's cough reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                                  # one drop in the lab
    (SEAT - 0.1, 0), (SEAT, -3), (SEAT + 0.8, 0),                                  # the vial locks
    (T('rivalsmoke', 0.05), 0), (T('rivalsmoke', 0.15), -3), (T('rivalsmoke', 1.3), 0),   # the rival's sputters read
    (T('gag', 0.05), 0), (T('gag', 0.25), -3), (LAND - 0.08, -3), (LAND, 0),       # under the late arrival, then the accent lands with it
    (V.TOTAL, 0),
]
MUSIC_CUTS = [
    (T('padcold'), T('erupt', 0.1), 1.8, -6, 0.0),             # the count, the spark, the stutter, the WHUMP: no music
    (T('porthole', -0.03), T('side', -0.06), 1.6, -8, 0.03),   # the edge of space: silence; the race opens on the downbeat
    (T('approach'), T('moonwide', -0.1), 2.6, -6, 0.0),        # the race ends on the cut to the Moon: the drive rings out
]                                                              # over the descent; the foot and the flag in silence

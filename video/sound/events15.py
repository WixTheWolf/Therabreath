# The music's share of the baton on the V15 cut (V15 times, dB). The score sections are placed in music15.py on the
# score's own clock; this shapes them where the machinery or the people must lead and carves the real silences:
# (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last moment of
# music, so the silence arrives as a decay, not a dropout. The cut and reopen points sit between the score's own hits.
from timeline import Cut

V = Cut('FlavorRaceV15')
T = V.t
DRIP = T('pipette', 0.9)          # the pipette drop in the lab
PRESS = T('transferbtn', 0.55)    # FLAVOR TRANSFER READY
MUSIC_AUTO = [
    (0.0, 0),
    (T('ignite', 0.2), -5), (T('crowd', -0.05), -5), (T('crowd', 0.1), -7), (T('erupt', -0.02), -7), (T('erupt', 0.08), 0),   # the eruption and the people lead; the score takes over as both clear the pad
    (T('yuzu', 0.0), 0), (T('yuzu', 0.08), -2), (T('yuzu', 0.9), 0),         # the citrus split reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                             # one drop in the lab
    (PRESS - 0.1, 0), (PRESS, -3), (PRESS + 0.8, 0),                          # the press
    (V.TOTAL, 0),
]
MUSIC_CUTS = [
    (T('pitch', -0.03), T('chase', -0.06), 1.6, -8, 0.03),    # the edge of space: silence; the race opens on its downbeat
    (T('descent'), T('flagwide', -0.2), 2.6, -6, 0.0),        # the drive rings out over the descent; the Moon in silence until the flag
]

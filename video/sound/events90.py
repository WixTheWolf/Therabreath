# The music's share of the baton on the 90-second cut (its own times, dB): events15.py re-pointed at this cut, with
# the eruption shot gone (the lift-off takes its place) and two new silences: the engines go quiet before the search,
# and the edge of space reopens on the turn over Earth.
from timeline import Cut

V = Cut('FlavorRace90')
T = V.t
DRIP = T('pipette', 0.9)          # the pipette drop in the lab
PRESS = T('transferbtn', 0.55)    # FLAVOR TRANSFER READY
MUSIC_AUTO = [
    (0.0, 0),
    (T('ignite', 0.2), -5), (T('crowd', -0.05), -5), (T('crowd', 0.1), -7), (T('liftoff', -0.02), -7), (T('liftoff', 0.1), 0),   # the ignition and the people lead; the score takes over as TheraBreath clears the pad
    (T('yuzu', 0.0), 0), (T('yuzu', 0.08), -2), (T('yuzu', 0.9), 0),         # the citrus split reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                             # one drop in the lab
    (PRESS - 0.1, 0), (PRESS, -3), (PRESS + 0.8, 0),                          # the press
    (V.TOTAL, 0),
]
MUSIC_CUTS = [
    (T('pitch', -0.03), T('turn', -0.06), 1.6, -8, 0.03),     # the edge of space: silence; the downbeat opens on the turn
    (T('cutoff', 0.45), T('search', -0.05), 1.4, -8, 0.4),    # the engines go quiet; the glass section opens on the search
    (T('descent'), T('flagwide', -0.2), 2.6, -6, 0.0),        # the drive rings out over the descent; the Moon in silence until the flag
]

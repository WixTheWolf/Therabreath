# The music's share of the baton on the V16 cut (V16 times, dB). The score sections are placed in music16.py on
# their own clocks; this shapes them where the machinery or the people must lead and carves the real silences:
# (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last moment of
# music, so the silence arrives as a decay, not a dropout.
from timeline import Cut

V = Cut('FlavorRaceV16')
T = V.t
DRIP = T('pipette', 1.20)         # the pipette drop lands
PRESS = T('transferbtn', 0.60)    # FLAVOR TRANSFER READY
TOUCH = T('foot', 0.55)
MUSIC_AUTO = [
    (0.0, 0),
    (T('ignite', 0.2), -5), (T('crowd', -0.05), -5), (T('crowd', 0.1), -7), (T('erupt', -0.02), -7), (T('erupt', 0.08), 0),   # the eruption and the people lead; the score takes over as both clear the pad
    (T('warnlight', -0.05), 0), (T('warnlight', 0.1), -3), (T('cutoff'), -3), (T('cutoff', 0.6), -8),   # the alarm and the engines going quiet read
    (T('yuzu', 0.0), 0), (T('yuzu', 0.08), -2), (T('yuzu', 0.9), 0),         # the citrus split reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                             # one drop in the lab
    (PRESS - 0.1, 0), (PRESS, -3), (PRESS + 0.8, 0),                          # the press
    (T('transfer', 1.8), 0), (T('transfer', 2.0), -5), (T('life', 1.3), 0),    # "Oh, that's new."
    (T('pass', 0.05), 0), (T('pass', 0.2), -5), (T('mcerupts', 0.1), -5), (T('overtake'), 0),  # "Go get it!" and the room's cheer read
    (T('track', 0.2), 0), (T('track', 0.35), -3), (T('track', 1.9), 0),        # "Look at her go!"
    (T('chase', 0.1), 0), (T('chase', 0.25), -3), (T('chase', 3.2), 0),        # "Nice bottle."
    (T('monitors', 0.05), 0), (T('monitors', 0.2), -3), (T('moonlaunch', 1.0), 0),   # "Bring it home."
    (T('hqland', 2.5), 0), (T('hqland', 3.1), -3), (T('hqland', 3.9), 0),     # the touchdown on the lawn
    (V.TOTAL, 0),
]
MUSIC_AUTO = sorted(MUSIC_AUTO)      # np.interp needs the points in time order
MUSIC_CUTS = [
    (T('pitch', -0.03), T('side', -0.02), 1.6, -8, 0.2),      # the edge of space: silence; the race re-enters side by side
    (T('descent'), TOUCH - 0.1, 2.6, -6, 0.0),                 # the drive rings out over the descent; the Moon in silence until the footpad
]

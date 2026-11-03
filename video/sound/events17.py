# The music's share of the baton on the V17 cut (V17 times, dB). The score sections are placed in music17.py on
# their own clocks; this shapes them where the machinery or the people must lead and carves the real silences:
# (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last moment of
# music, so the silence arrives as a decay, not a dropout.
from timeline import Cut

V = Cut('FlavorRaceV17')
T = V.t
DRIP = T('pipette', 1.20)         # the pipette drop lands
LOCK = T('glove', 0.95)           # the vial locks into the cell
TOUCH = T('foot', 1.45)           # the footpad meets the regolith
MUSIC_AUTO = [
    (0.0, 0),
    (T('ignite', 0.2), -5), (T('crowd', -0.05), -5), (T('crowd', 0.1), -7), (T('erupt', -0.02), -7), (T('erupt', 0.08), 0),   # the eruption and the people lead; the score takes over as both clear the pad
    (T('rivalaway', 0.25), 0), (T('rivalaway', 0.45), -5), (T('warnlight', -0.05), -5), (T('warnlight', 0.1), -6), (T('cutoff'), -6), (T('cutoff', 0.6), -8),   # "I'm running out of road", the alarm and the engines going quiet read
    (T('yuzu', 0.0), 0), (T('yuzu', 0.08), -2), (T('yuzu', 0.9), 0),         # the citrus split reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                             # one drop in the lab
    (LOCK - 0.1, 0), (LOCK, -3), (LOCK + 0.8, 0),                             # the vial locks
    (T('transfer', 1.8), 0), (T('transfer', 2.0), -5), (T('life', 1.3), 0),    # "Oh, that's new."
    (T('pass', 0.4), 0), (T('pass', 0.55), -5), (T('mcerupts', 0.1), -5), (T('overtake'), 0),  # "Go get it!" and the room's cheer read
    (T('track', 0.2), 0), (T('track', 0.35), -3), (T('track', 1.9), 0),        # "Look at her go!"
    (T('chase', 0.1), 0), (T('chase', 0.25), -5), (T('neck', 1.9), -5), (T('neck', 2.3), 0),   # "Nice bottle. See you at the moon."
    (T('earthrise', 1.0), 0), (T('earthrise', 1.2), -7), (T('moonlaunch', -0.1), -7), (T('moonlaunch', 0.5), 0),   # "Bring it home." over the air
    (T('hqland', 2.5), 0), (T('hqland', 3.1), -3), (T('hqland', 3.9), 0),     # the touchdown on the lawn
    (V.TOTAL, 0),
]
MUSIC_AUTO = sorted(MUSIC_AUTO)      # np.interp needs the points in time order
MUSIC_CUTS = [
    (T('pitch', -0.03), T('both', -0.02), 1.6, -8, 0.2),      # the edge of space: silence; the race re-enters at full thrust
    (T('descent'), TOUCH - 0.1, 2.6, -6, 0.0),                 # the drive rings out over the descent; the Moon in silence until the footpad
]

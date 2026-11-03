# The music's share of the baton on the V21 cut (V21 times, dB). The score sections are placed in music21.py on
# their own clocks; this shapes them where the machinery or the people must lead and carves the real silences:
# (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last moment of
# music, so the silence arrives as a decay, not a dropout. Against V19 (the scored review, docs/session/RACE20.md):
# the two lines the plot hangs on ("Nice bottle", "running out of road") get the score out of their way (9 to 10 dB,
# where V19 gave them 5); the pass is set up by a drop: the score pulls back for the half second before bar 23 and
# opens on it, 2 dB over where it ran, so the lead is the loudest moment after the launch; the lawn touchdown points
# follow the new hqland in point. V21 is V20 without the toast; nothing here moves.
from timeline import Cut

V = Cut('FlavorRaceV21')
T = V.t
DRIP = T('pipette', 1.20)         # the pipette drop lands
LOCK = T('glove', 0.95)           # the vial locks into the cell
PRESS = T('transferbtn', 0.60)    # FLAVOR TRANSFER READY goes down
TOUCH = T('foot', 1.942)          # the footpad meets the regolith
PASSED = T('pass', 0.85)          # TheraBreath draws level and past, on the score's bar 23
HQTOUCH = T('hqland', 2.575)      # touchdown on the lawn (s11_hq src 6.48)
MUSIC_AUTO = [
    (0.0, 0),
    (T('ignite', 0.2), -5), (T('crowd', -0.05), -5), (T('crowd', 0.1), -7), (T('erupt', -0.02), -7), (T('erupt', 0.08), 0),   # the eruption and the people lead; the score takes over as both clear the pad
    (T('rivalaway', 0.1), 0), (T('rivalaway', 0.4), -10), (T('warnlight', -0.05), -9), (T('warnlight', 0.1), -9), (T('cutoff'), -9), (T('cutoff', 0.6), -10),   # "I'm running out of road", the alarm and the engines going quiet read
    (T('yuzu', 0.0), 0), (T('yuzu', 0.08), -2), (T('yuzu', 0.9), 0),         # the citrus split reads
    (DRIP - 0.1, 0), (DRIP, -3), (DRIP + 0.9, 0),                             # one drop in the lab
    (LOCK - 0.1, 0), (LOCK, -3), (LOCK + 0.8, 0),                             # the vial locks
    (PRESS - 0.1, 0), (PRESS, -3), (PRESS + 0.7, 0),                          # the press
    (T('transfer', 0.6), 0), (T('transfer', 0.85), -7), (T('life', 1.5), -6), (T('relight', 0.15), 0),    # "Oh, that's new." (the cue is building toward the brass here)
    (PASSED - 0.55, 0), (PASSED - 0.1, -7), (PASSED - 0.01, -7), (PASSED + 0.03, 3), (PASSED + 1.6, 2), (T('mcerupts', -0.1), 0),   # the drop, then the lead
    (T('mcerupts', -0.05), 0), (T('mcerupts', 0.1), -4), (T('mcerupts', 1.3), -4), (T('overtake', 0.15), 0),  # the room's cheer reads
    (T('chase', -0.6), 0), (T('chase', -0.3), -9), (T('neck', 1.9), -9), (T('neck', 2.3), 0),   # "Nice bottle. See you at the moon."
    (T('clouds', -0.1), 0), (T('clouds', 0.05), 3), (T('clouds', 1.4), 1), (T('cdsign', 0.5), 0),   # the punch into the cloud: the theme opens with it
    (HQTOUCH - 0.6, 0), (HQTOUCH, -3), (HQTOUCH + 0.8, 0),                  # the touchdown on the lawn
    (T('end', 0.1), 0), (T('end', 0.3), -4), (T('stglate', 1.3), -4),          # the card resolves under the room's level, not over it
    (V.TOTAL, 0),
]
MUSIC_AUTO = sorted(MUSIC_AUTO)      # np.interp needs the points in time order
MUSIC_CUTS = [
    (T('pitch', -0.03), T('both', -0.02), 1.6, -8, 0.2),      # the edge of space: silence; the race re-enters at full thrust
    (T('descent'), TOUCH - 0.1, 2.6, -6, 0.0),                 # the drive rings out over the descent; the Moon in silence until the footpad
]

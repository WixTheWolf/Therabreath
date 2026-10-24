# The music's share of the baton on the V12 cut (V12 times, dB). The score is composed to the locked picture and
# plays from the first frame to the last; this only trims it where the machinery must lead.
from timeline import Cut

V12 = Cut('FlavorRaceV12')
T = V12.t
MUSIC_AUTO = [
    (0.0, 0),
    (T('padcold', -0.1), 0), (T('padcold', 0.3), -3), (T('nozzle'), -3), (T('nozzle', 0.3), -5),  # the count, then the nozzle
    (T('ignite', -0.05), -5), (T('ignite', 0.1), -4), (T('topdown'), -4), (T('topdown', 0.6), 0),  # ignition owns the screen
    (T('cell', 2.3), 0), (T('cell', 2.5), -3), (T('cell', 3.3), 0),                                # the lock
    (V12.TOTAL, 0),
]
MUSIC_CUTS = []

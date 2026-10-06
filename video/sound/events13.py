# The music's share of the baton on the V13 cut (V13 times, dB). The four score sections are placed in
# FlavorRaceV13.tsx on the score's own clock; this trims them where the machinery must lead and carves the real
# silences: (cut, reopen, throw seconds, throw dB, reopen ramp seconds). A cut leaves a reverb throw of the last
# moment of music, so the silence arrives as a decay, not a dropout.
from timeline import Cut

V13 = Cut('FlavorRaceV13')
T = V13.t
IGN = T('ignite')
OUT = T('choice', 0.72)          # TheraBreath's flames go out
TOUCH = T('dust', 0.15)          # Moon touchdown
UNFURL = T('flagout', 1.8)       # the flag opens out of the bottle
MUSIC_AUTO = [
    (0.0, 0),
    (IGN - 0.05, -4), (IGN + 1.2, -4), (T('ignite', 2.6), 0),                       # the crack and the roar lead; the swell rises under them
    (T('choice', 0.1), 0), (OUT, -6),                                              # the music winds down with the engines
    (T('drop', 0.7), 0), (T('drop', 0.82), -4), (T('drop', 1.9), 0),               # the drop lands in near silence
    (T('seal', 2.7), 0), (T('seal', 2.85), -3), (T('seal', 3.0), 0),              # the latch
    (V13.TOTAL, 0),
]
MUSIC_CUTS = [
    (T('padcold'), IGN - 0.05, 1.8, -6, 0.0),        # the cold pad: the count plays in silence, then fire
    (OUT, T('particles', 0.2), 2.6, -6, 0.0),        # the engines die; the glass section creeps back under the aroma
    (TOUCH - 0.05, UNFURL, 1.4, -8, 0.06),           # touchdown in silence; the music returns as the flag opens
    (T('tasting'), T('end', -0.2), 2.2, -8, 0.0),    # six glasses in silence; the final gesture takes the end card
]

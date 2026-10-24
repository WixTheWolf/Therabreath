# The music's share of the baton on the V11 cut (V11 times, dB). The score plays under everything; this says who leads.
from timeline import Cut

V11 = Cut('FlavorRaceV11')
T = V11.t
IGN, PUNCH = T('ignite'), T('climb', 2.46)
TING, COUGH = T('bolt', 1.65), T('cough', 1.02)
MUSIC_AUTO = [
    (0.0, 0),
    (T('padwide', -0.1), 0), (T('padwide', 0.3), -5), (T('hush'), -5),       # the machine and the count lead
    (IGN - 0.05, -5), (IGN + 0.05, -7), (PUNCH - 0.3, -7), (PUNCH + 0.6, 0),  # ignition owns the screen; then music
    (T('yuzu', -0.1), 0), (T('yuzu', 0.15), -5), (T('cell', 1.6), -5), (T('lean'), 0),   # the lab: small sounds lead
    (TING - 1.7, 0), (TING - 1.45, -8), (TING - 0.05, -8), (TING + 0.01, -40),           # ting, then one beat of nothing
    (COUGH + 0.6, -40), (COUGH + 1.2, -6), (T('approach', -0.3), 0),
    (T('cups', 0.15), 0), (T('cups', 2.0), -45), (T('hush2'), -60),                      # the song falls away under the question
    (T('end'), -60), (V11.TOTAL, -60),
]
MUSIC_CUTS = []

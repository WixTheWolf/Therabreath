# The music's share of the baton on the V10 cut (V10 times). The V9 points are warped across; the failure and the
# ending are new: the score drops out for one beat after the ting, and the song falls away under the robot's question
# so the pause before the black is truly quiet.
from timeline import V9, Cut, make_warp
from events import MUSIC_AUTO as A9, EDGE

V10 = Cut('FlavorRaceV10')
T = V10.t
_w = make_warp(V9, V10, scaled=('dark',))
_keep = [(t, g) for t, g in A9 if t < 101.8]                     # everything before the bolt carries over
MUSIC_AUTO = sorted({round(_w(t), 3): g for t, g in _keep}.items()) + [
    (T('bolt', -0.1), 0), (T('bolt', 0.15), -8), (T('bolt', 1.6), -8),
    (T('bolt', 1.66), -40), (T('sputter', 0.2), -40), (T('sputter', 0.9), -8),   # ting, then one beat of nothing
    (T('smoke', 0.2), -4), (T('adrift', -0.2), -4), (T('tomoon', -0.6), 0),
    (T('cups', 0.15), 0), (T('cups', 2.0), -45), (T('hush2'), -60),             # the song falls away under the question
    (T('end', 0.0), -60), (V10.TOTAL, -60),
]
MUSIC_CUTS = [(_w(EDGE), _w(EDGE) + 4.8, 2.8, -12)]               # the edge of space

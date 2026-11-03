# THE FLAVOR RACE V18: the voice stem. Five radio lines from the V4 sessions (NORCO in the room, TB-ONE and the
# COMPETITOR over the air), each placed against the shot it belongs to; the other six are gone (the picture and the
# sound carry those moments). The
# perspective follows the picture: a line heard while we are in Mission Control is clean room sound; a line heard while
# we are with the rockets, on the Moon or at the launch site comes over the air (band-limited, a little grit, a
# Quindar tone before and after, the way ground-to-air sounded in 1969). mix2.py levels, shapes and compresses every
# line.
# usage (from video/sound): python3 vo18.py ../out/race18_vo.wav
import os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from timeline import Cut

V = Cut('FlavorRaceV18'); T = V.t; SR = 48000; GAIN = 0.9
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')
RL = T('relight', 0.67); TOUCH = T('foot', 1.942); RIVALLAND = T('stglate', 2.2)
# (file, at, length, air)
LINES = [
    ('v4_n_count', T('cap', 3.78), 2.69, False),         # NORCO, the count on the pad channel: "Three, two, one" (two on the umbilical, one on the button)
    ('v4_c_nice', T('chase', 0.2), 2.88, True),          # COMPETITOR: "Nice bottle. See you at the moon."
    ('v4_t_road', T('rivalaway', 0.3), 7.0, True),       # TB-ONE: "Norco, I'm running out of road here. The same fuel won't get me there first."
    ('v4_t_new', T('transfer', 1.3), 2.36, True),        # TB-ONE, as the flavor comes down the line and the beam arrives: "Oh, that's new." (clear of the glow and the build to the brass)
    ('v4_c_ideal', RIVALLAND + 0.6, 3.12, True),         # COMPETITOR: "Well, that's not ideal."
]


def quindar(dur=0.25, f=2525.0):
    t = np.arange(int(dur * SR)) / SR
    e = np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.004)
    return np.sin(2 * np.pi * f * t) * e


def air(a):
    # ground-to-air: band-limited, a touch of saturation, a little hiss, the Quindar tones framing the line
    y = sosfilt(butter(4, [320, 3400], 'bp', fs=SR, output='sos'), a, axis=0)
    y = np.tanh(2.2 * y / (np.abs(y).max() + 1e-9)) * np.abs(y).max() * 0.9
    r = np.random.default_rng(7)
    hiss = sosfilt(butter(2, [900, 3200], 'bp', fs=SR, output='sos'), r.standard_normal(y.shape), axis=0)
    y += hiss / np.abs(hiss).max() * 0.004
    q = quindar()[:, None] * 0.12 * np.abs(y).max()
    pre = np.zeros((int(0.45 * SR), 2)); pre[:len(q)] += q
    post = np.zeros((int(0.5 * SR), 2)); post[int(0.08 * SR):int(0.08 * SR) + len(q)] += q
    return np.concatenate([pre, y, post]) * 1.4, 0.45          # the band-limited lines read quieter: 3 dB up


y = np.zeros((int(round(V.TOTAL * SR)) + SR, 2))
for name, at, ln, over_air in LINES:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(AUDIO, name + '.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', 'pipe:1'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)[:int((ln + 0.4) * SR)] * GAIN
    lead = 0.0
    if over_air: a, lead = air(a)
    i = int(round((at - lead) * SR)); y[i:i + len(a)] += a
    print(f'{name:14s} at {at:8.3f} s  {"air" if over_air else "room"}')
y = y[:int(round(V.TOTAL * SR))]
sf.write(sys.argv[1], y.astype(np.float32), SR, subtype='FLOAT'); print(sys.argv[1])

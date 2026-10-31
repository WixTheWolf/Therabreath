# THE FLAVOR RACE V15: the VO stem. Two lines, as in V14: the count (it drives the cuts: "three" on the cap in the
# cold, "two" on the umbilical, "one" on the button) and the landing. Each at gain 0.62 (V14's GAIN), cut at its
# length + 0.4 s. usage (from video/sound): python3 vo15.py ../out/race15_vo.wav
import os, subprocess, sys
import numpy as np, soundfile as sf
from timeline import Cut
V = Cut('FlavorRaceV15'); T = V.t; SR = 48000; GAIN = 0.62
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'race', 'audio')
LINES = [('v4_n_count', T('cap', 3.78), 2.69),      # three 24.85, two 25.79 (the umbilical cut), one 26.76 (the button)
         ('v4_t_landed', T('foot', 0.7), 3.97)]     # "the Flavor has landed", just after touchdown
y = np.zeros((int(round(V.TOTAL * SR)) + SR, 2))
for name, at, ln in LINES:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(AUDIO, name + '.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)[:int((ln + 0.4) * SR)] * GAIN
    i = int(round(at * SR)); y[i:i + len(a)] += a
    print(f'{name:14s} at {at:8.3f} s')
y = y[:int(round(V.TOTAL * SR))]
sf.write(sys.argv[1], y.astype(np.float32), SR, subtype='FLOAT'); print(sys.argv[1])

# The VO stem without a Remotion render: each line placed at the composition's frame-rounded cue time, at the
# composition's gain (v * GAIN), cut at LEN + 0.4 s like the Sequence. usage (from video/): python3 sound/vo_place.py <Comp> <out.wav>
import re, subprocess, sys, math
import numpy as np, soundfile as sf
comp, out = sys.argv[1], sys.argv[2]
src = open(f'src/{comp}.tsx').read()
sys.path.insert(0, 'sound'); from timeline import Cut
V = Cut(comp); SR = 48000; FPS = 30
f = lambda s: math.floor(s * FPS + 0.5)
GAIN = float(re.search(r'const GAIN = ([\d.]+);', src).group(1))
vo = src[src.index('const VO: Cue[] = ['):src.index('];', src.index('const VO: Cue[] = ['))]
LEN = {k: float(v) for k, v in re.findall(r'(\w+): ([\d.]+)', src[src.index('const LEN: Record'):].split('\n')[0])}
y = np.zeros((int(round(V.TOTAL * SR)) + SR, 2), np.float64)
for name, sid, off, v in re.findall(r'\{ f: "(\w+)", at: t\("(\w+)", ([\d.]+)\), v: ([\d.]+) \}', vo):
    at = f(V.t(sid, float(off))) / FPS
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'public/race/audio/{name}.mp3', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    a = a[:int(f(LEN[name] + 0.4) / FPS * SR)] * float(v) * GAIN
    i = int(round(at * SR)); y[i:i + len(a)] += a
    print(f'{name:16s} at {at:8.3f} s  ({sid} + {off})  {len(a) / SR:.2f} s')
y = y[:int(round(V.TOTAL * SR))]
sf.write(out, y.astype(np.float32), SR, subtype='FLOAT'); print(out, f'{len(y) / SR:.2f} s, peak {20 * np.log10(np.abs(y).max()):.1f} dBFS')

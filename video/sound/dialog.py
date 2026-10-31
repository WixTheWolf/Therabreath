# Dialogue clearance: speech-band (300 Hz to 4 kHz) level of the voice against everything else, in 50 ms frames.
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000
pre = sys.argv[1]
V = sf.read(pre + '_vo.wav')[0]; O = sf.read(pre + '_music.wav')[0] + sf.read(pre + '_sfx.wav')[0]
sos = butter(4, [300, 4000], 'bp', fs=SR, output='sos')
v = sosfilt(sos, V.mean(1)); o = sosfilt(sos, O.mean(1))
h = int(0.05 * SR); n = len(v) // h
lv = 10 * np.log10((v[:n * h].reshape(n, h) ** 2).mean(1) + 1e-12)
lo = 10 * np.log10((o[:n * h].reshape(n, h) ** 2).mean(1) + 1e-12)
act = lv > lv.max() - 30
# group active frames into lines (gaps under 0.4 s join)
lines = []; i = 0
while i < n:
    if act[i]:
        j = i
        while j < n and (act[j] or act[j:j + 8].any()): j += 1
        lines.append((i, j)); i = j
    else: i += 1
print(f"{'line':>14s}  {'SNR p10':>8s} {'median':>7s}  worst moments")
for a, b in lines:
    s = (lv - lo)[a:b][act[a:b]]
    worst = sorted([(round(((lv - lo)[k]), 1), round(k * 0.05, 2)) for k in range(a, b) if act[k]])[:3]
    print(f"{a*0.05:6.2f}-{b*0.05:6.2f}  {np.percentile(s,10):8.1f} {np.median(s):7.1f}  {worst}")

# Review checks on the mix: the planned silences, clicks, where the sub lives, and mono fold-down.
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
sys.path.insert(0, '.')
from review import mom, kw
SR = 48000; pre = sys.argv[1]
mix = sf.read(pre + '_mix.wav')[0]; sfx = sf.read(pre + '_sfx.wav')[0]
m = mom(mix, 0.1, 0.05)
print('SILENCES (100 ms K-weighted level of the full mix; max inside the window)')
for a, b, what in [(0.0, 0.4, 'first moment'), (8.0, 8.1, 'black before the relay'), (8.6, 9.1, 'after the relay'), (21.65, 23.0, 'the bolt'),
                   (46.65, 47.2, 'hush (before the click)'), (47.3, 47.65, 'hush (after the click)'), (66.75, 67.5, 'edge of space'),
                   (70.7, 73.2, 'the float'), (110.07, 110.22, 'breath before the boom'), (112.15, 112.5, 'adrift'), (166.1, 166.9, 'post black')]:
    seg = m[int(a / 0.05): max(int(a / 0.05) + 1, int((b - 0.1) / 0.05) + 1)]
    print(f"  {a:7.2f}-{b:7.2f}  {seg.max():6.1f} LUFS max  {np.median(seg):6.1f} median   {what}")
print('CLICKS (sample jumps far above the local level, SFX stem)')
x = sfx.mean(1); d = np.abs(np.diff(x)); n = len(d) // 480
loc = np.sqrt((x[:n * 480].reshape(n, 480) ** 2).mean(1)) + 1e-6
ratio = d[:n * 480].reshape(n, 480).max(1) / loc
for i in np.where((ratio > 12) & (loc < 0.02))[0][:20]:
    print(f"  {i * 0.01:8.2f}s  jump/rms {ratio[i]:5.1f}  rms {20*np.log10(loc[i]):6.1f} dB")
print('SUB (< 60 Hz) in the effects stem: where it is above -40 dBFS RMS (0.5 s blocks)')
s = sosfilt(butter(4, 60, 'lp', fs=SR, output='sos'), sfx.mean(1)); h = SR // 2; k = len(s) // h
sl = 20 * np.log10(np.sqrt((s[:k * h].reshape(k, h) ** 2).mean(1)) + 1e-9)
runs = []; on = None
for i, v in enumerate(sl):
    if v > -40 and on is None: on = i
    if (v <= -40 or i == k - 1) and on is not None: runs.append((on * 0.5, i * 0.5, sl[on:i + 1].max())); on = None
for a, b, mx in runs: print(f"  {a:6.1f}-{b:6.1f}s  max {mx:5.1f} dB")
print('MONO fold-down: loss in loudness per section (stereo vs mono, dB)')
for a, b, what in [(6.4, 8.0, 'night wind'), (11.0, 19.6, 'reveal'), (47.6, 54.5, 'liftoff'), (84.6, 93.5, 'lab'), (110.2, 112.1, 'boom'), (144.8, 161.5, 'home')]:
    st = mix[int(a * SR):int(b * SR)]; mo = np.repeat(st.mean(1, keepdims=True), 2, 1)
    ls = 10 * np.log10((kw(st) ** 2).mean(0).sum()); lm = 10 * np.log10((kw(mo) ** 2).mean(0).sum())
    print(f"  {what:12s} {lm - ls:+5.1f} dB")

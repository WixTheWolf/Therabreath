# Stem mix for THE FLAVOR RACE: music, sound effects and dialogue rendered as separate buses, mixed here.
# Dialogue: high-pass, presence lift, compression. Music: a dialogue-keyed sidechain that dips the whole score a
# little and the vocal band (250 Hz to 4 kHz) more, so lines read without the score dropping out.
# Effects: high-pass and light compression. Then bus glue, loudness to -16 LUFS and a -1 dBFS look-ahead limiter.
# usage (from video/): python3 scripts/mix.py <picture.mp4> <music.wav> <sfx.wav> <vo.wav> <out.mp4>
import sys, subprocess, tempfile, wave
import numpy as np
from scipy.signal import butter, sosfilt, lfilter

pic, mus, sfx, vo, dst = sys.argv[1:6]
SR = 48000
T = tempfile.mkdtemp()
ff = ["npx", "remotion", "ffmpeg", "-y", "-v", "error"]


def load(p):
    subprocess.run(ff + ["-i", p, "-ac", "2", "-ar", str(SR), "-c:a", "pcm_s16le", f"{T}/x.wav"], check=True)
    w = wave.open(f"{T}/x.wav")
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float64) / 32768


def peaking(f0, gain_db, q):
    a = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * a, -2 * np.cos(w), 1 - al * a]); aa = np.array([1 + al / a, -2 * np.cos(w), 1 - al / a])
    return b / aa[0], aa / aa[0]


def env_db(x, block=48):
    # peak-ish level per millisecond, in dB
    m = np.abs(x).max(1)
    n = len(m) // block
    e = np.sqrt((m[: n * block].reshape(n, block) ** 2).mean(1))
    return 20 * np.log10(e + 1e-9)


def smooth(target, att_ms, rel_ms):
    # one-pole follower at 1 kHz control rate; target is a gain in dB (<= 0)
    a = np.exp(-1 / att_ms); r = np.exp(-1 / rel_ms)
    g = np.empty_like(target); cur = 0.0
    for i, t in enumerate(target):
        cur = t + (cur - t) * (a if t < cur else r)
        g[i] = cur
    return g


def to_audio_rate(g_db, n):
    t_ctrl = (np.arange(len(g_db)) + 0.5) * 48
    return 10 ** (np.interp(np.arange(n), t_ctrl, g_db) / 20)


def compress(x, thr, ratio, att, rel, makeup=0.0):
    lv = env_db(x)
    over = np.maximum(0, lv - thr)
    g = smooth(-over * (1 - 1 / ratio), att, rel) + makeup
    return x * to_audio_rate(g, len(x))[:, None]


M, X, V = load(mus), load(sfx), load(vo)
n = max(len(M), len(X), len(V))
M, X, V = [np.pad(s, ((0, n - len(s)), (0, 0))) for s in (M, X, V)]

# dialogue
V = sosfilt(butter(2, 90, "hp", fs=SR, output="sos"), V, axis=0)
b, a = peaking(3200, 2.5, 1.0); V = lfilter(b, a, V, axis=0)
V = compress(V, -26, 3.0, 8, 140, makeup=3.0)

# effects
X = sosfilt(butter(2, 28, "hp", fs=SR, output="sos"), X, axis=0)
X = compress(X, -16, 2.0, 5, 120)

# music: dialogue-keyed sidechain, whole band and vocal band
key = env_db(V)
on = np.clip((key + 50) / 14, 0, 1)            # 0 below -50 dB, 1 above -36 dB
g_wide = smooth(-3.5 * on, 40, 450)
g_mid = smooth(-6.0 * on, 40, 450)
lowM = sosfilt(butter(2, 250, "lp", fs=SR, output="sos"), M, axis=0)
highM = sosfilt(butter(2, 4000, "hp", fs=SR, output="sos"), M, axis=0)
midM = M - lowM - highM
M = (lowM + highM) * to_audio_rate(g_wide, n)[:, None] + midM * to_audio_rate(g_wide + g_mid, n)[:, None]

mix = M * 1.0 + X * 1.0 + V * 1.12
mix = compress(mix, -15, 1.8, 25, 260)          # glue


def lufs(x):
    # integrated loudness after ITU-R BS.1770 (approximate K-weighting, 400 ms blocks, absolute and relative gates)
    b1, a1 = peaking(1681.97, 4.0, 0.7071)
    k = lfilter(b1, a1, x, axis=0)
    k = sosfilt(butter(2, 38, "hp", fs=SR, output="sos"), k, axis=0)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    p = np.array([(k[i:i + blk] ** 2).mean(0).sum() for i in range(0, len(k) - blk, hop)])
    l = -0.691 + 10 * np.log10(p + 1e-12)
    p = p[l > -70]; rel = -0.691 + 10 * np.log10(p.mean()) - 10
    p = p[(-0.691 + 10 * np.log10(p + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(p.mean())


L = lufs(mix); mix *= 10 ** ((-16 - L) / 20)

# look-ahead peak limiter, -1 dBFS
ceil = 10 ** (-1 / 20); la = int(0.005 * SR)
pk = np.abs(mix).max(1)
from numpy.lib.stride_tricks import sliding_window_view
wmax = sliding_window_view(np.concatenate([pk, np.zeros(la)]), la + 1).max(1)[:n]
tgt_db = 20 * np.log10(np.minimum(1.0, ceil / np.maximum(wmax, 1e-9)))
blocks = len(tgt_db) // 48
ctrl = tgt_db[: blocks * 48].reshape(blocks, 48).min(1)
g = smooth(ctrl, 0.01, 120)
mix = mix * to_audio_rate(g, n)[:, None]
mix = np.clip(mix, -ceil, ceil)
print(f"input {L:.1f} LUFS -> {lufs(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.2f} dBFS, max limiting {g.min():.2f} dB")

o = wave.open(f"{T}/mix.wav", "wb"); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
o.writeframes((mix * 32767).astype(np.int16).tobytes()); o.close()
subprocess.run(ff + ["-i", pic, "-i", f"{T}/mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", dst], check=True)

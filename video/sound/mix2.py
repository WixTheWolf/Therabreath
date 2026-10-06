# THE FLAVOR RACE final mix, for a private screening: wide dynamic range, quiet stays quiet, nothing squashed.
# Dialogue: leveled line to line, a little presence, gentle compression.
# Music: the baton from events.py (who leads, when), hard cuts that leave a reverb throw, and a dialogue-keyed dip.
# Effects: the designed stem from cues.py, light peak control only. No bus glue.
# Loudness: -18 LUFS integrated (ITU-R BS.1770 gating), with a true-peak-aware look-ahead ceiling at -1 dBFS.
# usage (from video/sound): python3 mix2.py <picture.mp4> <music.wav> <sfx.wav> <vo.wav> <out.mp4>
import os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from numpy.lib.stride_tricks import sliding_window_view
from scipy.signal import butter, sosfilt, lfilter, fftconvolve, resample_poly
if os.environ.get("CUT") == "12.2":
    from events12_2 import MUSIC_AUTO, MUSIC_CUTS
elif os.environ.get("CUT") == "12.1":
    from events12_1 import MUSIC_AUTO, MUSIC_CUTS
elif os.environ.get("CUT") == "13":
    from events13 import MUSIC_AUTO, MUSIC_CUTS
elif os.environ.get("CUT") == "12":
    from events12 import MUSIC_AUTO, MUSIC_CUTS
elif os.environ.get("CUT") == "11":
    from events11 import MUSIC_AUTO, MUSIC_CUTS
elif os.environ.get("CUT") == "10":
    from events10 import MUSIC_AUTO, MUSIC_CUTS
else:
    from events import MUSIC_AUTO, MUSIC_CUTS
from sdx import ir_room

SR = 48000
TARGET = float(os.environ.get('TARGET', -18.0))
CEIL = float(os.environ.get('CEIL', -1.0))
# presentation version: a slow loudness rider narrows the range for a meeting room (quiet lifted, loud held back)
PRESENT = os.environ.get('PRESENT') == '1'
FF = ["npx", "remotion", "ffmpeg", "-y", "-v", "error"]
VIDEO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def db(g): return 10 ** (np.asarray(g) / 20)


def load(p):
    x, sr = sf.read(p, always_2d=True, dtype='float64')
    assert sr == SR, (p, sr)
    return x[:, :2] if x.shape[1] > 1 else np.repeat(x, 2, 1)


def peaking(f0, gain_db, q):
    a = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * a, -2 * np.cos(w), 1 - al * a]); aa = np.array([1 + al / a, -2 * np.cos(w), 1 - al / a])
    return b / aa[0], aa / aa[0]


def env_db(x, block=48):
    m = np.abs(x).max(1); n = len(m) // block
    return 20 * np.log10(np.sqrt((m[: n * block].reshape(n, block) ** 2).mean(1)) + 1e-9)


def smooth(target, att_ms, rel_ms):
    # one-pole follower at 1 kHz control rate; target is a gain in dB (<= 0)
    a = np.exp(-1 / max(att_ms, 1e-3)); r = np.exp(-1 / rel_ms)
    g = np.empty_like(target); cur = 0.0
    for i, v in enumerate(target):
        cur = v + (cur - v) * (a if v < cur else r)
        g[i] = cur
    return g


def to_audio_rate(g_db, n, block=48):
    return db(np.interp(np.arange(n), (np.arange(len(g_db)) + 0.5) * block, g_db))


def compress(x, thr, ratio, att, rel, makeup=0.0):
    over = np.maximum(0, env_db(x) - thr)
    return x * to_audio_rate(smooth(-over * (1 - 1 / ratio), att, rel) + makeup, len(x))[:, None]


def kweight(x):
    b1, a1 = peaking(1681.97, 4.0, 0.7071)
    return sosfilt(butter(2, 38, 'hp', fs=SR, output='sos'), lfilter(b1, a1, x, axis=0), axis=0)


def block_loudness(x, win, hop):
    k = kweight(x); n, h = int(win * SR), int(hop * SR)
    p = np.array([(k[i:i + n] ** 2).mean(0).sum() for i in range(0, len(k) - n, h)])
    return -0.691 + 10 * np.log10(p + 1e-12), p


def lufs(x):
    l, p = block_loudness(x, 0.4, 0.1)
    p = p[l > -70]; rel = -0.691 + 10 * np.log10(p.mean()) - 10
    p = p[(-0.691 + 10 * np.log10(p + 1e-12)) > rel]
    return -0.691 + 10 * np.log10(p.mean())


def lra(x):
    # EBU Tech 3342 loudness range: short-term (3 s) blocks, gated, 10th to 95th percentile
    l, _ = block_loudness(x, 3.0, 1.0)
    l = l[l > -70]; rel = 10 * np.log10(np.mean(10 ** (l / 10))) - 20
    l = l[l > rel]
    return np.percentile(l, 95) - np.percentile(l, 10), l.max()


def true_peak_env(x):
    # 4x oversampled peak per sample, so inter-sample overs are caught too
    up = np.stack([resample_poly(x[:, c], 4, 1) for c in range(2)], 1)
    return np.abs(up).max(1)[: len(x) * 4].reshape(-1, 4).max(1)


def limiter(x, ceil_db, la_ms=5, rel_ms=120):
    ceil = db(ceil_db); la = int(la_ms * SR / 1000); n = len(x)
    pk = true_peak_env(x)
    wmax = sliding_window_view(np.concatenate([pk, np.zeros(la)]), la + 1).max(1)[:n]
    tgt = 20 * np.log10(np.minimum(1.0, ceil / np.maximum(wmax, 1e-9)))
    blocks = len(tgt) // 48
    g = smooth(tgt[: blocks * 48].reshape(blocks, 48).min(1), 0.01, rel_ms)
    y = x * to_audio_rate(g, n)[:, None]
    return np.clip(y, -ceil, ceil), g.min()


def room_ride(x, pivot=None, up=0.58, down=0.6, max_up=9.0, max_down=6.0, floor=-50.0):
    # Slow loudness rider on the whole mix: short-term level (3 s) pulled toward the film's own integrated level.
    # Quiet passages come up (never true silence: below `floor` nothing is lifted), loud ones come down a little.
    # Attack and release of seconds, so it reads as a mixer's hand on the fader, not compression.
    pivot = lufs(x) if pivot is None else pivot
    l, _ = block_loudness(x, 3.0, 0.1)
    g = np.where(l < pivot, np.minimum((pivot - l) * up, max_up), -np.minimum((l - pivot) * down, max_down))
    g = np.where(l < floor, np.minimum(g, np.clip((l - floor + 10) * up, 0, max_up)), g)
    g = smooth(np.repeat(g, 100), 900, 1600)                      # 1 kHz control rate
    tt = np.arange(len(g)) / 1000 + 1.5                           # block centres
    return x * db(np.interp(np.arange(len(x)) / SR, tt, g))[:, None]


def automation(points, n):
    tt = np.arange(n) / SR
    return db(np.interp(tt, [p[0] for p in points], [p[1] for p in points]))


def main(pic, mus, sfx, vo, dst):
    M, X, V = load(mus), load(sfx), load(vo)
    n = max(len(M), len(X), len(V))
    M, X, V = [np.pad(s, ((0, n - len(s)), (0, 0))) for s in (M, X, V)]

    # ---- dialogue: level each line toward the same loudness (slow rider, +/-6 dB), then shape and compress
    V = sosfilt(butter(2, 90, 'hp', fs=SR, output='sos'), V, axis=0)
    lv = env_db(V, block=48 * 8); act = lv > -45
    ride = np.where(act, np.clip(-21 - lv, -6, 6), 0.0)
    for i in range(1, len(ride)):
        if not act[i] and act[i - 1]: ride[i] = ride[i - 1]
    V = V * to_audio_rate(smooth(np.repeat(ride, 8), 120, 400), len(V))[:, None]
    b, a = peaking(3200, 2.5, 1.0); V = lfilter(b, a, V, axis=0)
    V = compress(V, -26, 3.0, 8, 140, makeup=3.0)

    # ---- music: the baton, then the hard cuts with their throws, then a dialogue-keyed dip
    M = M * automation(MUSIC_AUTO, n)[:, None]
    gate = np.ones(n); throw = np.zeros_like(M)
    ir = ir_room(2.6, pre=0.02, er=[(0.03, -8), (0.07, -11)], lp_hz=6000, seed=21)
    for cut in MUSIC_CUTS:
        tc, reopen, tail, g = cut[:4]
        rin = cut[4] if len(cut) > 4 else 0.0                      # optional ramp back in, so a reopen never clicks
        i, j, f = int(tc * SR), int(reopen * SR), int(0.04 * SR)
        gate[i:i + f] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2; gate[i + f:j] = 0
        if rin > 0:
            r = int(rin * SR); gate[j:j + r] *= np.sin(np.linspace(0, np.pi / 2, r)) ** 2
        k = int(0.6 * SR); seg = M[i - k:i] * (np.linspace(0, 1, k) ** 2)[:, None]
        wet = np.stack([fftconvolve(seg[:, c], ir[:, c]) for c in range(2)], 1)[k:k + int(tail * SR)]
        wet *= (np.cos(np.linspace(0, np.pi / 2, len(wet))) ** 2)[:, None]
        throw[i:i + len(wet)] += wet * db(g) / (np.abs(wet).max() + 1e-12) * np.abs(seg).max()
    M = M * gate[:, None] + throw
    key = env_db(V)
    on = np.clip((key + 50) / 14, 0, 1)
    g_wide = smooth(-4.0 * on, 40, 450); g_mid = smooth(-7.0 * on, 40, 450)
    bm, am = peaking(300, -1.5, 0.8); M = lfilter(bm, am, M, axis=0)
    lowM = sosfilt(butter(2, 250, 'lp', fs=SR, output='sos'), M, axis=0)
    highM = sosfilt(butter(2, 4000, 'hp', fs=SR, output='sos'), M, axis=0)
    M = (lowM + highM) * to_audio_rate(g_wide, n)[:, None] + (M - lowM - highM) * to_audio_rate(g_wide + g_mid, n)[:, None]

    # ---- effects: step out of the voice's way while a line is spoken (mostly in the speech band), then
    # light peak control on the very top only (fast, gentle)
    X = sosfilt(butter(2, 25, 'hp', fs=SR, output='sos'), X, axis=0)
    x_wide = smooth(-2.0 * on, 30, 350); x_mid = smooth(-6.0 * on, 30, 350)
    lowX = sosfilt(butter(2, 300, 'lp', fs=SR, output='sos'), X, axis=0)
    highX = sosfilt(butter(2, 4000, 'hp', fs=SR, output='sos'), X, axis=0)
    X = (lowX + highX) * to_audio_rate(x_wide, n)[:, None] + (X - lowX - highX) * to_audio_rate(x_wide + x_mid, n)[:, None]
    top = env_db(X).max()
    X = compress(X, top - 7, 2.5, 1, 90)

    mix = M + X + V * 1.12
    if PRESENT:
        k = float(os.environ.get('RIDE', 1.0))
        kd = float(os.environ.get('RIDE_DOWN', k))              # how hard loud passages are held back (defaults to RIDE)
        mix = room_ride(mix, up=0.58 * k, down=0.6 * kd, max_up=9.0 * k, max_down=6.0 * kd)
    L0 = lufs(mix); G = db(TARGET - L0); mix *= G
    if os.environ.get('STEMS'):                      # the processed stems at mix level, for the review passes
        for tag, s in (('music', M), ('sfx', X), ('vo', V * 1.12)):
            sf.write(dst.rsplit('.', 1)[0] + f'_{tag}.wav', (s * G).astype(np.float32), SR, subtype='FLOAT')
    mix, gr = limiter(mix, CEIL)
    L1 = lufs(mix); r, stmax = lra(mix)
    tp = 20 * np.log10(true_peak_env(mix).max())
    print(f"mix: {L0:.1f} LUFS -> {L1:.1f} LUFS integrated, loudness range {r:.1f} LU, max short-term {stmax:.1f} LUFS, "
          f"true peak {tp:.2f} dBTP, max limiting {gr:.2f} dB")

    T = tempfile.mkdtemp()
    wav = dst.rsplit('.', 1)[0] + '_mix.wav'
    sf.write(wav, mix.astype(np.float32), SR, subtype='PCM_24')
    subprocess.run(FF + ["-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
                         "-ar", "48000", "-shortest", dst], check=True, cwd=VIDEO)
    print(dst)


if __name__ == '__main__':
    main(*[os.path.abspath(p) for p in sys.argv[1:6]])

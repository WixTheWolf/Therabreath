#!/usr/bin/env python3
"""Mix for The Future of Freshness opening film (src/FutureOfFreshness.tsx).

Voice: ElevenLabs take A, cut into lines at its pauses and placed on the picture.
Music: ElevenLabs Music take 1, lengthened by repeating bars 40.78 to 48.63 s (4 bars at 122.3 BPM)
so the final chord lands under the title. SFX: the ElevenLabs library in sound/wav plus five new cues.
Usage: python3 scripts/fof_mix.py out/fof/mix.wav   (then loudness-normalize with ffmpeg loudnorm)
"""
import subprocess, sys
import numpy as np
import scipy.io.wavfile as wavfile

SR = 48000
FF = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
A = "public/fof/audio/"
LIB = "sound/wav/"
DUR = 78.5


def load(path):
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def fade(x, fi=0.01, fo=0.02):
    n = len(x); a = int(fi * SR); b = int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x


def place(bus, x, t, gain=1.0):
    i = int(round(t * SR)); j = min(len(bus), i + len(x))
    if j > i: bus[i:j] += x[: j - i] * gain


N = int(DUR * SR)
music = np.zeros((N, 2), np.float32); vo = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

# ---- Voice: (source start, source end, film time) ----
VO = [(0.00, 2.70, 1.50), (3.25, 5.50, 5.10), (6.40, 13.10, 11.40), (13.37, 18.40, 19.10), (19.24, 22.50, 25.00),
      (22.73, 31.00, 29.20), (31.78, 36.00, 38.20), (36.50, 41.10, 42.90), (41.51, 42.90, 48.00), (43.04, 45.92, 53.40),
      (46.26, 49.45, 57.00), (49.64, 54.64, 60.70), (54.81, 58.70, 66.20), (59.19, 61.05, 71.60), (61.23, 62.56, 74.00)]
v = load(A + "vo_a.mp3")
for s0, s1, t in VO:
    place(vo, fade(v[int(s0 * SR):int(s1 * SR)].copy(), 0.012, 0.06), t, 1.0)

# ---- Music: repeat 4 bars, offset so the entry at 10.0 s hits the glasses at 11.2 s ----
m = load(A + "m1.mp3")
a_, b_ = int(40.78 * SR), int(48.63 * SR); xf = int(0.04 * SR)
head = m[:b_].copy(); tail = m[a_:].copy()
ramp = np.linspace(0, 1, xf)[:, None]
head[-xf:] = head[-xf:] * (1 - ramp) + tail[:xf] * ramp
mext = np.concatenate([head, tail[xf:]])
place(music, mext, 1.2, 1.0)
t = np.arange(N) / SR
music *= np.clip((DUR - 0.25 - t) / 1.6, 0, 1)[:, None]  # gentle end fade

# Duck the music under the voice: about -7 dB, 60 ms attack, 450 ms release.
env = np.abs(vo).max(1)
k = int(0.02 * SR); env = np.convolve(env, np.ones(k) / k, "same")
active = (env > 0.01).astype(np.float32)
g = np.empty(N, np.float32); cur = 1.0
att = 1 - np.exp(-1 / (0.06 * SR)); rel = 1 - np.exp(-1 / (0.45 * SR))
target = 1 - 0.68 * active
for i in range(N):
    tg = target[i]; cur += (tg - cur) * (att if tg < cur else rel); g[i] = cur
music *= g[:, None]

# ---- SFX: (file, film time, gain, max seconds) ----
CUES = [
    (LIB + "01_OPEN_DROPLET_PLINK_V1.wav", 3.58, 0.9, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V1.wav", 3.62, 0.25, 3.0),
    (A + "sfx_swirl1.mp3", 7.05, 0.45, None),
    (A + "sfx_swell2.mp3", 10.6, 0.35, None),
    (A + "sfx_pour1.mp3", 12.2, 0.55, 1.7),
    (A + "sfx_pour2.mp3", 17.15, 0.5, 1.2),
    (LIB + "11_RING_SPARKLE_PASS_V1.wav", 19.0, 0.22, 2.5),
    (LIB + "10_LAB_ROOMTONE_V1.wav", 24.7, 0.35, 4.3),
    (LIB + "10_LAB_CRYSTAL_SING_V1.wav", 29.05, 0.2, 3.0),
    (A + "sfx_swell2.mp3", 32.15, 0.3, None),
    (LIB + "15_END_CRYSTAL_TONE_V1.wav", 38.0, 0.18, 3.5),
    (LIB + "01_OPEN_FROST_CRACKLE_V1.wav", 42.85, 0.5, 2.6),
    (LIB + "10_LAB_FROST_BLOOM_V1.wav", 43.2, 0.25, 2.2),
    (A + "sfx_fizz1.mp3", 45.45, 0.45, None),
    (A + "sfx_fizz1.mp3", 46.35, 0.4, None),
    (A + "sfx_fizz1.mp3", 47.2, 0.3, None),
    (LIB + "10_LAB_LEAVES_V1.wav", 48.12, 0.4, 1.3),
    (LIB + "10_LAB_CITRUS_SPLIT_V1.wav", 49.42, 0.45, 1.2),
    (LIB + "10_LAB_MIST_SPRAY_V1.wav", 49.6, 0.25, 1.1),
    (LIB + "10_LAB_DROP_GLASS_V1.wav", 50.75, 0.4, 1.2),
    (LIB + "14_HOME_GLASS_CLINK_V1.wav", 52.05, 0.25, 1.2),
    (A + "sfx_cups1.mp3", 53.4, 0.5, None),
    (LIB + "10_LAB_DROP_GLASS_V2.wav", 58.3, 0.4, 1.5),
    (A + "sfx_swell2.mp3", 60.35, 0.25, None),
    ("sound/lib/mn_sfx_paper.wav", 66.05, 0.35, 1.6),
    ("sound/lib/mn_sfx_paper.wav", 68.1, 0.2, 1.2),
    (LIB + "15_END_CRYSTAL_TONE_V2.wav", 71.35, 0.3, 5.0),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 71.7, 0.18, 4.0),
]
for path, tt, gain, mx in CUES:
    x = load(path)
    if mx: x = x[: int(mx * SR)]
    pk = np.abs(x).max() or 1
    place(sfx, fade(x / pk * 0.5, 0.005, min(0.25, len(x) / SR / 3)), tt, gain)

mix = vo * 1.0 + music * 0.40 + sfx * 0.7
mix *= np.clip(t / 0.05, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.89
out = sys.argv[1] if len(sys.argv) > 1 else "out/fof/mix.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
sp = active > 0
for name, bus in [("vo", vo), ("music", music * 0.40), ("sfx", sfx * 0.7)]:
    r = np.sqrt((bus[sp] ** 2).mean()); q = np.sqrt((bus[~sp] ** 2).mean())
    print(name, "rms dB while speaking %.1f, between lines %.1f" % (20 * np.log10(r + 1e-9), 20 * np.log10(q + 1e-9)))
print("wrote", out, "%.2fs" % (len(mix) / SR))

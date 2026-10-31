#!/usr/bin/env python3
"""Mix for The Future of Freshness V2 (src/FutureOfFreshnessV2.tsx).

Voice: ElevenLabs v4 take A, cut into lines and placed on the picture.
Score: ElevenLabs Music v2.5 take 1 (120 BPM, bars every 2 s on .99). Two bars of the quiet intro are repeated at
19.99 s so the drop lands on "November 9th" at 36.0 s, and two bars of the drive are removed at 55.99 s so the
score's own outro sits under the end card. SFX: the new V2 cues plus the ElevenLabs library in sound/wav.
Usage: python3 scripts/fof2_mix.py out/fof2/mix_raw.wav <ffmpeg>   (then volume + alimiter to about -16 LUFS)
"""
import subprocess, sys
import numpy as np
import scipy.io.wavfile as wavfile

SR = 48000
FF = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
A = "public/fof2/audio/"
A1 = "public/fof/audio/"
LIB = "sound/wav/"
DUR = 77.0


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
VO = [(0.10, 1.95, 3.30), (2.30, 2.75, 7.25), (3.00, 4.15, 7.95), (4.60, 8.10, 11.30), (8.45, 10.15, 15.10),
      (10.45, 12.15, 18.15), (12.40, 14.85, 20.25), (15.15, 18.35, 23.85), (18.60, 26.40, 27.85), (26.60, 30.25, 36.30),
      (30.60, 35.05, 40.10), (35.40, 36.45, 44.65), (36.45, 39.10, 50.25), (39.30, 42.20, 54.20), (42.20, 45.45, 58.20),
      (45.70, 49.15, 62.25), (49.40, 50.85, 66.60), (51.10, 52.40, 70.30)]
v = load(A + "vo_a.mp3")
for s0, s1, t in VO:
    place(vo, fade(v[int(s0 * SR):int(s1 * SR)].copy(), 0.012, 0.06), t, 1.3 if t > 66 else 1.0)  # the two soft closing lines sit up

# ---- Score: (film start, film end, source start) segments, spliced on bar lines with short crossfades ----
m = load(A + "m1.mp3")
SEG = [(0.0, 19.99, 0.0), (19.99, 23.99, 15.99), (23.99, 55.99, 19.99), (55.99, DUR, 55.99)]
xf = int(0.03 * SR)
for a, b, src in SEG:
    i0, i1 = int(a * SR), int(b * SR)
    s = int(src * SR)
    seg = m[s:s + (i1 - i0) + xf].copy()
    if len(seg) == 0: continue
    if a > 0: seg[:xf] *= np.linspace(0, 1, xf)[:, None]
    if len(seg) > (i1 - i0): seg[i1 - i0:] *= np.linspace(1, 0, len(seg) - (i1 - i0))[:, None]
    place(music, seg, a, 1.0)
t = np.arange(N) / SR
music *= np.clip((DUR - 0.1 - t) / 1.2, 0, 1)[:, None]

# Duck the score under the voice: about -6 dB, 60 ms attack, 450 ms release.
env = np.abs(vo).max(1)
k = int(0.02 * SR); env = np.convolve(env, np.ones(k) / k, "same")
active = (env > 0.01).astype(np.float32)
g = np.empty(N, np.float32); cur = 1.0
att = 1 - np.exp(-1 / (0.06 * SR)); rel = 1 - np.exp(-1 / (0.45 * SR))
target = 1 - 0.62 * active
for i in range(N):
    tg = target[i]; cur += (tg - cur) * (att if tg < cur else rel); g[i] = cur
music *= g[:, None]

# ---- SFX: (file, film time, gain, max seconds) ----
CUES = [
    (LIB + "10_LAB_AROMA_AIR_V1.wav", 0.15, 0.18, 2.8),
    (LIB + "01_OPEN_DROPLET_PLINK_V1.wav", 2.96, 0.9, None),
    (A + "sfx_impact.mp3", 3.0, 0.32, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V1.wav", 3.02, 0.22, 2.5),
    (A + "sfx_whoosh.mp3", 5.30, 0.35, None),
    (A + "sfx_ice.mp3", 5.48, 0.7, None),
    (A1 + "sfx_swirl1.mp3", 7.0, 0.42, None),
    (A + "sfx_impact_b.mp3", 8.55, 0.5, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 8.6, 0.22, 2.5),
    (A + "sfx_whoosh_b.mp3", 10.85, 0.3, None),
    (LIB + "11_RING_SPARKLE_PASS_V1.wav", 11.7, 0.22, 2.4),
    (LIB + "15_END_CRYSTAL_TONE_V1.wav", 15.2, 0.22, 2.5),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 18.1, 0.18, 2.0),
    (LIB + "10_LAB_CRYSTAL_SING_V1.wav", 20.0, 0.16, 3.0),
    (LIB + "10_LAB_ROOMTONE_V1.wav", 23.5, 0.28, 4.0),
    (A + "sfx_riser.mp3", 33.0, 0.6, None),
    (A + "sfx_impact.mp3", 36.0, 0.95, None),
    (LIB + "15_END_CRYSTAL_TONE_V2.wav", 36.05, 0.18, 3.0),
    (A + "sfx_whoosh.mp3", 39.85, 0.3, None),
    (LIB + "01_OPEN_FROST_CRACKLE_V1.wav", 40.0, 0.5, 2.0),
    (A1 + "sfx_fizz1.mp3", 42.0, 0.45, None),
    (A + "sfx_whoosh_b.mp3", 43.85, 0.35, None),
    (LIB + "10_LAB_LEAVES_V1.wav", 44.02, 0.4, 1.4),
    (LIB + "10_LAB_CITRUS_SPLIT_V1.wav", 45.5, 0.45, 1.3),
    (LIB + "10_LAB_MIST_SPRAY_V1.wav", 45.65, 0.22, 1.1),
    (LIB + "10_LAB_DROP_GLASS_V1.wav", 47.0, 0.35, 1.3),
    (LIB + "14_HOME_GLASS_CLINK_V1.wav", 48.52, 0.3, 1.3),
    (A + "sfx_whoosh.mp3", 49.85, 0.28, None),
    ("sound/lib/x_tink.wav", 50.6, 0.28, 1.0),
    ("sound/lib/x_tink.wav", 51.05, 0.26, 1.0),
    ("sound/lib/x_tink.wav", 51.5, 0.24, 1.0),
    ("sound/lib/x_tink.wav", 51.95, 0.22, 1.0),
    (LIB + "10_LAB_DROP_GLASS_V2.wav", 54.05, 0.4, 1.5),
    (A + "sfx_whoosh_b.mp3", 57.85, 0.3, None),
    (LIB + "14_HOME_GLASS_CLINK_V2.wav", 59.83, 0.22, 0.9),
    (LIB + "14_HOME_GLASS_CLINK_V2.wav", 60.39, 0.22, 0.9),
    (LIB + "15_END_CRYSTAL_TONE_V1.wav", 61.03, 0.2, 1.6),
    ("sound/lib/mn_sfx_paper.wav", 62.0, 0.35, 1.6),
    (A + "sfx_riser.mp3", 63.0, 0.5, None),
    (A + "sfx_impact.mp3", 66.0, 0.8, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 66.05, 0.22, 4.0),
    (LIB + "15_END_CRYSTAL_TONE_V2.wav", 71.8, 0.22, 4.5),
]
for path, tt, gain, mx in CUES:
    x = load(path)
    if mx: x = x[: int(mx * SR)]
    pk = np.abs(x).max() or 1
    place(sfx, fade(x / pk * 0.5, 0.004, min(0.25, len(x) / SR / 3)), tt, gain)

# Score automation: full in the quiet opening, pulled back under the dense drive, opened up for the title.
AUTO = [(0.0, 0.48), (35.6, 0.48), (36.0, 0.21), (65.6, 0.21), (66.0, 0.42), (66.45, 0.22), (68.2, 0.22), (68.9, 0.42),
        (70.0, 0.42), (70.25, 0.22), (71.7, 0.22), (72.4, 0.42), (DUR, 0.42)]
mg = np.interp(t, [a for a, _ in AUTO], [b for _, b in AUTO]).astype(np.float32)
music *= mg[:, None]
mix = vo * 1.0 + music + sfx * 0.7
mix *= np.clip(t / 0.05, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.89
out = sys.argv[1] if len(sys.argv) > 1 else "out/fof2/mix.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
sp = active > 0
for a, b in [(0, 36), (36, 66), (66, DUR)]:
    w = sp & (t >= a) & (t < b)
    lv = lambda bus: 20 * np.log10(np.sqrt((bus[w] ** 2).mean()) + 1e-9)
    print("%4.0f-%4.0f s while speaking: vo %.1f, music %.1f, sfx %.1f dB" % (a, b, lv(vo), lv(music), lv(sfx * 0.7)))
print("wrote", out, "%.2fs" % (len(mix) / SR))

#!/usr/bin/env python3
"""Mix for The Future of Freshness V3, "The Drop" (src/FutureOfFreshnessV3.tsx, 81 s).

Built on the V2 mix (scripts/fof2_mix.py): the same voice take for every line that did not change, the same score
edited on its bar lines, the same effects library. What is new: the thesis line is a fresh take ("Now, let's give more
people a reason to want it"), the picture after 11 s runs half a second later, the finale 1.3 s later, and the score
drops to silence twice, for 0.7 s before "November 9" and for 0.8 s before the landing, so each hit lands on nothing.
Usage: python3 scripts/fof3_mix.py out/fof3/mix_raw.wav <ffmpeg>   (then volume + alimiter to about -16 LUFS)
"""
import subprocess, sys
import numpy as np
import scipy.io.wavfile as wavfile

SR = 48000
FF = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
A = "public/fof2/audio/"
A3 = "public/fof3/audio/"
A1 = "public/fof/audio/"
LIB = "sound/wav/"
DUR = 81.0

# V2 film time to V3 film time: the first ten seconds are re-cut by hand, the middle runs 0.5 s later, the finale 1.3 s later.
def T(t):
    return t if t < 11.0 else t + 0.5 if t < 66.0 else t + 1.3


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

# ---- Voice ----
# The two opening lines come from the new take (vo_c1): "TheraBreath took away the burn." and the new thesis line.
vc = load(A3 + "vo_c1.mp3")
for s0, s1, t in [(0.00, 1.85, 3.30), (2.30, 5.05, 7.30)]:
    place(vo, fade(vc[int(s0 * SR):int(s1 * SR)].copy(), 0.012, 0.06), t, 1.0)
# Everything else is the V2 take, moved with the picture. (The V2 "add the want" line is left out.)
VO2 = [(4.60, 8.10, 11.30), (8.45, 10.15, 15.10), (10.45, 12.15, 18.15), (12.40, 14.85, 20.25), (15.15, 18.35, 23.85),
       (18.60, 26.40, 27.85), (26.60, 30.25, 36.30), (30.60, 35.05, 40.10), (35.40, 36.45, 44.65), (36.45, 39.10, 50.25),
       (39.30, 42.20, 54.20), (42.20, 45.45, 58.20), (45.70, 49.15, 62.25), (49.40, 50.85, 66.60), (51.10, 52.40, 70.30)]
v = load(A + "vo_a.mp3")
for s0, s1, t in VO2:
    place(vo, fade(v[int(s0 * SR):int(s1 * SR)].copy(), 0.012, 0.06), T(t), 1.3 if t > 66 else 1.0)

# ---- Score: the V2 bar-line edit, then re-timed to the V3 picture with two holes of silence ----
m = load(A + "m1.mp3")
SEG = [(0.0, 19.99, 0.0), (19.99, 23.99, 15.99), (23.99, 55.99, 19.99), (55.99, 79.7, 55.99)]
xf = int(0.03 * SR)
m2 = np.zeros((int(80.0 * SR), 2), np.float32)
for a, b, src in SEG:
    i0, i1 = int(a * SR), int(b * SR)
    s = int(src * SR)
    seg = m[s:s + (i1 - i0) + xf].copy()
    if len(seg) == 0: continue
    if a > 0: seg[:xf] *= np.linspace(0, 1, xf)[:, None]
    if len(seg) > (i1 - i0): seg[i1 - i0:] *= np.linspace(1, 0, len(seg) - (i1 - i0))[:, None]
    place(m2, seg, a, 1.0)
# V2 time t sits at T(t): shift by 0.5 s up to the finale swell (V2 66.0), and by 1.3 s from there on.
cut = int(66.0 * SR)
place(music, m2[:cut], 0.5, 1.0)
place(music, m2[cut:], 67.3, 1.0)
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

# ---- SFX: (file, film time, gain, max seconds). The opening is cued by hand; the rest follows the V2 cues through T(). ----
CUES = [
    (LIB + "10_LAB_AROMA_AIR_V1.wav", 0.15, 0.18, 2.8),
    (LIB + "01_OPEN_DROPLET_PLINK_V1.wav", 2.96, 0.9, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V1.wav", 3.02, 0.22, 2.5),
    (LIB + "10_LAB_CRYSTAL_SING_V1.wav", 3.3, 0.12, 2.6),
    (A + "sfx_whoosh.mp3", 5.80, 0.35, None),
    (A + "sfx_ice.mp3", 5.98, 0.7, None),
    (A1 + "sfx_swirl1.mp3", 7.2, 0.42, None),
    (A + "sfx_impact_b.mp3", 9.3, 0.5, None),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 9.35, 0.22, 2.5),
    (A + "sfx_whoosh_b.mp3", 11.3, 0.3, None),
    (LIB + "01_OPEN_DROPLET_PLINK_V2.wav", 11.5, 0.45, None),
]
V2CUES = [
    (LIB + "11_RING_SPARKLE_PASS_V1.wav", 11.7, 0.22, 2.4),
    (LIB + "15_END_CRYSTAL_TONE_V1.wav", 15.2, 0.22, 2.5),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 18.1, 0.18, 2.0),
    (LIB + "10_LAB_CRYSTAL_SING_V1.wav", 20.0, 0.16, 3.0),
    (LIB + "10_LAB_ROOMTONE_V1.wav", 23.5, 0.28, 4.0),
    (A + "sfx_riser.mp3", 33.0, 0.6, 2.3),
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
    (A + "sfx_riser.mp3", 63.0, 0.55, 2.9),
]
CUES += [(p, T(tt), gn, mx) for p, tt, gn, mx in V2CUES]
CUES += [
    # The two breaths: the drop alone in the dark, a single plink, then the hit on nothing.
    (LIB + "01_OPEN_DROPLET_PLINK_V2.wav", 35.95, 0.6, None),
    (LIB + "01_OPEN_DROPLET_PLINK_V1.wav", 66.75, 0.8, None),
    (A + "sfx_impact.mp3", 67.3, 1.0, None),
    (LIB + "02_REVEAL_FLOOD_HIT_V1.wav", 67.3, 0.55, 3.0),
    (LIB + "02_REVEAL_SHIMMER_BLOOM_V2.wav", 67.35, 0.22, 4.0),
    (LIB + "10_LAB_DROP_GLASS_V2.wav", 74.5, 0.3, 1.6),
    (LIB + "15_END_CRYSTAL_TONE_V2.wav", 74.6, 0.22, 4.5),
]
for path, tt, gain, mx in CUES:
    x = load(path)
    if mx: x = x[: int(mx * SR)]
    pk = np.abs(x).max() or 1
    place(sfx, fade(x / pk * 0.5, 0.004, min(0.25, len(x) / SR / 3)), tt, gain)

# Score automation: full in the quiet opening, pulled back under the dense drive, opened up for the title, and cut to
# nothing for the two breaths before the hits.
AUTO = [(0.0, 0.48), (35.55, 0.48), (35.75, 0.0), (36.49, 0.0), (36.5, 0.21), (66.25, 0.21), (66.45, 0.0), (67.29, 0.0),
        (67.3, 0.44), (67.75, 0.22), (69.5, 0.22), (70.2, 0.42), (71.3, 0.42), (71.55, 0.22), (73.0, 0.22), (73.7, 0.42), (DUR, 0.42)]
mg = np.interp(t, [a for a, _ in AUTO], [b for _, b in AUTO]).astype(np.float32)
music *= mg[:, None]
mix = vo * 1.0 + music + sfx * 0.7
mix *= np.clip(t / 0.05, 0, 1)[:, None]
pk = np.abs(mix).max(); mix = mix / pk * 0.89
out = sys.argv[1] if len(sys.argv) > 1 else "out/fof3/mix.wav"
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
sp = active > 0
for a, b in [(0, 36.5), (36.5, 67.3), (67.3, DUR)]:
    w = sp & (t >= a) & (t < b)
    lv = lambda bus: 20 * np.log10(np.sqrt((bus[w] ** 2).mean()) + 1e-9)
    print("%4.1f-%4.1f s while speaking: vo %.1f, music %.1f, sfx %.1f dB" % (a, b, lv(vo), lv(music), lv(sfx * 0.7)))
print("wrote", out, "%.2fs" % (len(mix) / SR))

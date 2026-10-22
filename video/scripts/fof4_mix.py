#!/usr/bin/env python3
"""Mix for The Future of Freshness V4 (src/FutureOfFreshnessV4.tsx, 87 s). Revision 2: the effects duck under speech
(the frost cues buried the voice at 0:47), and the footage windows get their sounds (the splash under the title).

Voice: public/fof4/audio/vo_a.mp3 (Elizabeth Anne, eleven_v4), one take, placed line by line from public/fof4/lines.json,
the same table the picture reads, so every word on screen lands on the word she says.
Score: public/fof4/audio/music_b.mp3 (ElevenLabs Music v2.5, 118 BPM, marimba and pizzicato), from 0, ducked under speech.
Effects: the four ElevenLabs sounds made for this cut (pop, glockenspiel ding, page flip and stamp, marker swipe) plus a
few from the house library, cued to the picture by the voice's word times (tw) exactly as the composition does.
Usage: python3 scripts/fof4_mix.py out/fof4/mix_raw.wav <ffmpeg>   (then volume + alimiter to about -16 LUFS)
"""
import json, re, subprocess, sys
import numpy as np
import scipy.io.wavfile as wavfile

SR = 48000
FF = sys.argv[2] if len(sys.argv) > 2 else "ffmpeg"
A4 = "public/fof4/audio/"
A2 = "public/fof2/audio/"
A1 = "public/fof/audio/"
LIB = "sound/wav/"
DUR = 87.0

LINES = json.load(open("public/fof4/lines.json"))
WORDS = []
for w in json.load(open("public/fof4/vo_words.json"))["words"]:
    if w["start"] < 0.17:
        continue
    ln = next((l for l in LINES if l["src0"] - 0.02 <= w["start"] < l["src1"]), None)
    off = ln["at"] - ln["src0"]
    WORDS.append((re.sub(r"[^a-z0-9]", "", w["text"].lower()), w["start"] + off))


def tw(q, n=0):
    k = 0
    for w, t in WORDS:
        if w == re.sub(r"[^a-z0-9]", "", q.lower()):
            if k == n:
                return t
            k += 1
    raise SystemExit("the voice never says " + q)


def rnd(i, k=0):
    x = np.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - np.floor(x)


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


def pitch(x, r):
    """Resample by r (>1 = higher and shorter)."""
    if abs(r - 1) < 1e-3: return x
    n = int(len(x) / r)
    idx = np.linspace(0, len(x) - 1, n)
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], axis=1).astype(np.float32)


N = int(DUR * SR)
music = np.zeros((N, 2), np.float32); vo = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

# ---- Voice ----
v = load(A4 + "vo_a.mp3")
speech = np.zeros(N, np.float32)
for ln in LINES:
    seg = fade(v[int(ln["src0"] * SR):int(ln["src1"] * SR)].copy(), 0.012, 0.06)
    place(vo, seg, ln["at"], 1.0)
    i = int(ln["at"] * SR); speech[i:min(N, i + len(seg))] = 1

# ---- Score: music_b from 0, ducked while she speaks (ramps of 0.25 s), fading out at the end ----
m = load(A4 + "music_b.mp3")
place(music, m, 0.0, 1.0)
k = int(0.25 * SR)
env = np.convolve(speech, np.ones(k) / k, mode="same")
env = np.clip(np.convolve(env, np.ones(k) / k, mode="same"), 0, 1)
duck = 0.58 - 0.40 * env  # 0.58 in the gaps, 0.18 under speech
tail = np.ones(N, np.float32); i0 = int(84.5 * SR); tail[i0:] = np.linspace(1, 0, N - i0)
tail[int(65.6 * SR):int(75.6 * SR)] *= 0.78  # the lift under chapter four and the Playbook sits a little lower, so the owners and dates read
music *= (duck * tail)[:, None]

# ---- Effects: (file, time, gain, [start, end] in the file, pitch) ----
burn = tw("burn"); people = tw("people"); want = tw("want")
n65, n14, n86, hello = tw("sixty-five"), tw("fourteen"), tw("eighty-six"), tw("hello")
july, norco, make = tw("july"), tw("norco"), tw("make")
ross, more, loyal, attract = tw("ross"), tw("more", 1), tw("loyal"), tw("attract")
nov, two, four, one = tw("november"), tw("two"), tw("four"), tw("one")
seven, three = tw("seven"), tw("three")
cooling, survives = tw("cooling"), tw("survives")
four2, blind = tw("four", 1), tw("blind")
cups, letters, names, tasted = tw("cups"), tw("letters"), tw("names"), tw("tasted")
two2, tune, pitch_w, vote = tw("two", 2), tw("tune"), tw("pitch"), tw("vote", 1)
now, nxt, later, owners, dates = tw("now", 1), tw("next"), tw("later"), tw("owners"), tw("dates")
noon, pbk, names2 = tw("noon"), tw("playbook", 1), tw("names", 1)
title = tw("future")

POP = (A4 + "pop_a.mp3", (0.04, 0.32)); POPB = (A4 + "pop_b.mp3", (0.05, 0.6))
DING = (A4 + "ding_b.mp3", (0.0, 1.3)); DINGS = (A4 + "ding_a.mp3", (0.0, 0.4))
FLIP = (A4 + "flip_a.mp3", (0.0, 0.6)); STAMP = (A4 + "flip_a.mp3", (1.18, 1.8)); STAMPB = (A4 + "flip_b.mp3", (1.24, 1.8))
SWIPE = (A4 + "swipe_a.mp3", (0.0, 0.5)); SWIPEB = (A4 + "swipe_b.mp3", (0.0, 0.5))
WHOOSH = (A2 + "sfx_whoosh.mp3", None); WHOOSHB = (A2 + "sfx_whoosh_b.mp3", None)
CUES = []
def cue(src, t, gain, p=1.0): CUES.append((src[0], t, gain, src[1], p))
def lib(name, t, gain, maxs=None, p=1.0): CUES.append((LIB + name, t, gain, (0.0, maxs) if maxs else None, p))

# 0. the burn
cue(POP, 0.35, 0.45, 0.8)
cue(WHOOSH, burn - 0.1, 0.5)
CUES.append((A2 + "sfx_ice.mp3", burn + 0.2, 0.3, None, 1.0))
cue(POP, burn + 0.32, 0.4, 1.3)
# 1. the want
for i in range(18):
    c, r = i % 6, i // 6
    if i % 2 == 0: cue(POP, people - 0.1 + (c + r) * 0.05 + rnd(i) * 0.05, 0.16, 0.9 + rnd(i, 4) * 0.5)
for i in range(18):
    if i % 3 == 0: cue(POP, want + 0.1 + rnd(i, 3) * 0.6, 0.12, 1.5 + rnd(i, 6) * 0.4)
# 2. the math
for kx in range(12): cue(POP, 7.25 + kx * 0.075, 0.08, 0.85 + kx * 0.06)
lib("11_RING_SPARKLE_PASS_V1.wav", n65, 0.2, 2.0)
cue(DINGS, n65 + 0.9, 1.6)
for i in range(6): cue(POP, n14 + 0.05 + rnd(i, 5) * 0.5, 0.16, 1.4 + rnd(i, 7) * 0.3)
cue(DINGS, n14 + 0.6, 1.6, 1.12)
lib("10_LAB_LEAVES_V1.wav", n86, 0.2, 1.2)
for j in range(6): cue(POP, n86 + 0.3 + j * 0.12, 0.2, 1.25)
cue(DINGS, n86 + 0.8, 1.6, 0.94)
cue(POPB, hello, 0.5)
lib("02_REVEAL_SHIMMER_BLOOM_V1.wav", hello + 0.02, 0.2, 2.2)
lib("11_RING_SPARKLE_PASS_V1.wav", hello + 0.05, 0.25, 1.8)
cue(WHOOSHB, 20.7, 0.45)
# 3. Norco
cue(POP, 21.1, 0.3, 0.9); cue(POP, 21.25, 0.3, 1.0)
cue(WHOOSH, july + 0.1, 0.22)
cue(POP, norco + 0.02, 0.4, 0.8)
cue(POP, norco + 0.15, 0.3, 1.0)
lib("10_LAB_AROMA_AIR_V1.wav", norco + 0.3, 0.14, 2.2)
lib("10_LAB_ROOMTONE_V1.wav", norco + 0.15, 0.2, 2.4)
lib("10_LAB_DROP_GLASS_V1.wav", make + 0.3, 0.5, 1.4)
# 4. the ask
cue(WHOOSH, 25.05, 0.28)
cue(FLIP, ross + 0.25, 0.32)
cue(FLIP, more - 0.2, 0.25, 0.9)
cue(WHOOSHB, more + 0.3, 0.14)
cue(SWIPE, loyal + 0.1, 0.45); cue(POP, loyal + 0.55, 0.28, 1.1)
cue(SWIPEB, attract + 0.1, 0.45, 1.05); cue(POP, attract + 0.55, 0.28, 0.95)
cue(WHOOSHB, 34.5, 0.3)
# 5. the day
cue(POP, 34.95, 0.25, 0.85)
cue(STAMP, nov + 0.15, 0.55)
lib("11_RING_SPARKLE_PASS_V1.wav", two, 0.26, 2.0)
for i in range(4): cue(POP, four + i * 0.18, 0.3, 1.0 + i * 0.12)
CUES.append((A2 + "sfx_impact_b.mp3", one + 0.33, 0.1, None, 1.0))
cue(DING, one + 0.35, 0.45)
cue(WHOOSHB, 40.0, 0.45)
# 6. signals
for i in range(7): cue(POP, seven + i * 0.07, 0.18, 0.9 + i * 0.07)
for i in range(3): cue(STAMPB, three - 0.1 + i * 0.2, 0.5, 1.0 + i * 0.06)
# 7. flavor school
cue(POP, 45.4, 0.3, 0.9); cue(POP, 45.55, 0.3, 0.8)
lib("01_OPEN_FROST_CRACKLE_V1.wav", cooling, 0.2, 1.6)
lib("10_LAB_FROST_BLOOM_V1.wav", cooling + 0.1, 0.13, 2.0)
for i in range(5): cue(POP, cooling + 0.35 + i * 0.11, 0.09, 1.5 + i * 0.1)
lib("10_LAB_DROP_GLASS_V2.wav", survives + 0.1, 0.35, 1.4)
CUES.append((A1 + "sfx_fizz1.mp3", survives - 0.3, 0.22, (0.0, 2.2), 1.0))
lib("11_RING_SPARKLE_PASS_V1.wav", survives + 0.35, 0.22, 1.6)
cue(WHOOSHB, 50.3, 0.45)
# 8. territories
for i in range(4): cue(POP, four2 + i * 0.1, 0.34, 0.8 + i * 0.1)
for i in range(4): cue(POP, blind + 0.05 + i * 0.08, 0.22, 1.35)
# 9. cups
CUES.append((A1 + "sfx_cups1.mp3", cups - 0.15, 0.45, (0.0, 1.2), 1.0))
for i in range(4): cue(STAMP, letters - 0.05 + i * 0.1, 0.4, 1.0 + i * 0.05)
for i in range(4): cue(POP, names + 0.05 + i * 0.07, 0.2, 1.3)
lib("14_HOME_GLASS_CLINK_V1.wav", tasted, 0.3, 1.0)
lib("14_HOME_GLASS_CLINK_V2.wav", tasted - 0.1, 0.22, 1.0)
cue(WHOOSHB, 58.9, 0.45)
# 10. concepts
for i, t in enumerate([two2, tune, pitch_w, vote]): cue(POP, t, 0.4, 0.85 + i * 0.08)
for kx in range(3): lib("16_POST_SCREW_TINK_V1.wav", two2 + 0.58 + kx * 0.18, 0.3, 0.5, 0.9 + kx * 0.1)
lib("14_HOME_SERVO_HESITATE_V1.wav", tune + 0.3, 0.16, 0.9)
for kx in range(3): cue(POP, pitch_w + 0.25 + kx * 0.12, 0.16, 1.2 + kx * 0.1)
for kx in range(10): lib("01_OPEN_PLASTIC_TICK_V1.wav", vote + 0.2 + kx * 0.08 + 0.45, 0.22, 0.3, 1.0 + rnd(kx) * 0.3)
cue(DINGS, vote + 1.0, 1.0)
# 11. pipeline
for t in (now, nxt, later): cue(WHOOSH, t - 0.05, 0.22)
for i, (t, n) in enumerate([(now, 3), (nxt, 2), (later, 2)]):
    for kx in range(n): cue(POP, t + 0.15 + kx * 0.1 + 0.2, 0.2, 0.8 + i * 0.1)
for kx in range(7): cue(POP, owners + 0.05 + kx * 0.06, 0.16, 1.3)
for kx in range(7): lib("01_OPEN_PLASTIC_TICK_V1.wav", dates + 0.05 + kx * 0.06, 0.2, 0.3, 1.1)
cue(WHOOSHB, 70.4, 0.45)
# 12. noon
lib("05_PRE_GAUGE_NEEDLE_V1.wav", noon - 0.15, 0.3, 0.7)
cue(DING, noon + 0.4, 0.6)
lib("15_END_CRYSTAL_TONE_V1.wav", noon + 0.4, 0.25, 2.5)
cue(FLIP, pbk - 0.1, 0.4); cue(FLIP, pbk + 0.2, 0.35, 1.1)
lib("10_LAB_TWIST_LOCK_V1.wav", pbk + 0.55, 0.45, 0.8)
for kx in range(4): cue(POP, names2 + kx * 0.12, 0.14, 1.4)
cue(SWIPE, names2 + 0.5, 0.6); cue(SWIPEB, names2 + 1.0, 0.55)
# 13. title and end card
CUES.append((A2 + "sfx_impact.mp3", 75.6, 0.5, None, 1.0))
lib("02_REVEAL_FLOOD_HIT_V1.wav", 75.6, 0.28, 3.0)
lib("02_REVEAL_SHIMMER_BLOOM_V2.wav", 75.65, 0.25, 4.0)
lib("15_END_CRYSTAL_TONE_V2.wav", tw("freshness"), 0.2, 3.0)
lib("10_LAB_DROP_GLASS_V2.wav", 80.0, 0.3, 1.6)
lib("15_END_CRYSTAL_TONE_V1.wav", 80.1, 0.22, 4.5)
cue(WHOOSH, 79.6, 0.2)

cache = {}
for path, t, gain, win, p in CUES:
    if path not in cache: cache[path] = load(path)
    x = cache[path]
    if win: x = x[int(win[0] * SR):int(win[1] * SR) if win[1] else None]
    x = pitch(fade(x.copy(), 0.004, 0.05), p)
    place(sfx, x, t, gain)

# the effects step back under speech (-5 dB with the same 0.25 s ramps as the score), so the voice always reads
sfx *= (1 - 0.5 * env)[:, None]
VO_GAIN = 2.8
mix = music + vo * VO_GAIN + sfx
# balance report: where, while she speaks, the effects come within 4 dB of the voice (quarter-second windows)
w = int(0.25 * SR); worst = []
for i in range(0, N - w, w):
    if speech[i:i + w].mean() < 0.9: continue
    rv = np.sqrt(np.mean((vo[i:i + w] * VO_GAIN) ** 2)) + 1e-9; rs = np.sqrt(np.mean(sfx[i:i + w] ** 2)) + 1e-9; rm = np.sqrt(np.mean(music[i:i + w] ** 2)) + 1e-9
    if rv < 0.02: continue  # a pause between words, not speech
    d = 20 * np.log10(rs / rv); dm = 20 * np.log10(rm / rv)
    if d > -4 or dm > -4: worst.append((round(i / SR, 2), round(d, 1), round(dm, 1)))
print("windows where effects (or music) come within 4 dB of the voice [t, sfx-vo dB, music-vo dB]:", worst[:30])
peak = float(np.abs(mix).max())
print("stems peak: music %.2f vo %.2f sfx %.2f mix %.2f" % (np.abs(music).max(), np.abs(vo).max(), np.abs(sfx).max(), peak))
wavfile.write(sys.argv[1], SR, (mix / max(1.0, peak * 1.02)).astype(np.float32))
wavfile.write(sys.argv[1].replace(".wav", "_vo.wav"), SR, vo.astype(np.float32))
wavfile.write(sys.argv[1].replace(".wav", "_music.wav"), SR, music.astype(np.float32))
print("wrote", sys.argv[1])

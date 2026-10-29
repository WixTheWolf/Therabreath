#!/usr/bin/env python3
"""Mix for The Future of Freshness V5 (src/FutureOfFreshnessV5.tsx), one ending at a time.

Voice: public/fof5/audio/vo.wav, one take holding both endings, placed line by line from public/fof5/take_<ending>.json
(the table the picture reads, written by scripts/fof5_layout.py), so every word on screen lands on the word she says.
Score: the V4 score (public/fof4/audio/music_b.mp3, ElevenLabs Music v2.5, 118 BPM), with whole bars taken out at the
seam where the two sides match best, so its own ending lands on the film's last seconds. Ducked under speech.
Effects: the four ElevenLabs sounds made for V4 (pop, glockenspiel ding, page flip and stamp, marker swipe) and the V2
whoosh, ice, impact and riser, cued by the voice's word times exactly as the composition cues the picture.
Usage: python3 scripts/fof5_mix.py brief|site out/fof5/mix_<ending>.wav <ffmpeg>   (then the loudness pass in V5.md)
"""
import json, re, subprocess, sys
import numpy as np

SR = 48000
ENDING, OUTWAV = sys.argv[1], sys.argv[2]
FF = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"
A5, A4, A2 = "public/fof5/audio/", "public/fof4/audio/", "public/fof2/audio/"
TAKE = json.load(open(f"public/fof5/take_{ENDING}.json"))
DUR = TAKE["duration"]
LINES = {l["id"]: l for l in TAKE["lines"]}
WORDS = TAKE["words"]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def tw(q, after=0.0):
    for w in WORDS:
        if w["k"] == norm(q) and w["t0"] >= after - 0.05:
            return w["t0"]
    raise SystemExit("the voice never says %s after %.2f" % (q, after))


def at(i): return LINES[i]["at"]
def rnd(i, k=0):
    x = np.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return x - np.floor(x)


def load(path):
    raw = subprocess.run([FF, "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def fade(x, fi=0.01, fo=0.02):
    n = len(x); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x


def place(bus, x, t, gain=1.0):
    i = int(round(t * SR)); j = min(len(bus), i + len(x))
    if i < 0: x = x[-i:]; i = 0
    if j > i: bus[i:j] += x[: j - i] * gain


def smooth(x, n):
    """Centered moving average over n samples (a running sum, so it stays fast on a whole film)."""
    c = np.cumsum(np.concatenate([np.zeros(1), x.astype(np.float64)]))
    h = n // 2; i = np.clip(np.arange(len(x)) - h, 0, len(x)); j = np.clip(np.arange(len(x)) + n - h, 0, len(x))
    return ((c[j] - c[i]) / n).astype(np.float32)


def pitch(x, r):
    if abs(r - 1) < 1e-3: return x
    n = int(len(x) / r)
    idx = np.linspace(0, len(x) - 1, n)
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], axis=1).astype(np.float32)


N = int(DUR * SR)
music = np.zeros((N, 2), np.float32); vo = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)

# ---- Voice, at the level of the V4 take so VO_GAIN means the same thing ----
v = load(A5 + "vo.wav")
ref = load(A4 + "vo_a.mp3")
speech_rms = lambda y: np.sqrt(np.mean(y[np.abs(y).max(axis=1) > 0.02] ** 2))
v *= speech_rms(ref) / max(1e-6, speech_rms(v))
speech = np.zeros(N, np.float32)
for ln in TAKE["lines"]:
    seg = fade(v[int(ln["src0"] * SR):int(ln["src1"] * SR)].copy(), 0.012, 0.06)
    place(vo, seg, ln["at"], 1.0)
    i = int(ln["at"] * SR); speech[i:min(N, i + len(seg))] = 1

# ---- Score: take out whole bars where the bar before the cut and the bar after it sound most alike ----
m = load(A4 + "music_b.mp3")
BAR = 4 * 60 / 118
END = 88.68  # where the score's last chord has died away
k = max(0, int(round((END - (DUR - 0.2)) / BAR)))
def spec(a, b):
    y = m[int(a * SR):int(b * SR)].mean(axis=1)
    s = np.abs(np.fft.rfft(y * np.hanning(len(y))))[: 4000]
    return s / (np.linalg.norm(s) + 1e-9)
cands = [n * BAR for n in range(1, 60) if 44 <= n * BAR <= 62 and n * BAR + k * BAR < END - 8]  # after the lift at 36 s, which lands on the day
seam = max(cands, key=lambda a: float(np.dot(spec(a - BAR, a), spec(a + k * BAR - BAR, a + k * BAR)))) if k else None
if k:
    xf = int(0.06 * SR); i = int(seam * SR); j = int((seam + k * BAR) * SR)
    head, tail_ = m[:i + xf].copy(), m[j:].copy()
    head[-xf:] *= np.linspace(1, 0, xf)[:, None]; tail_[:xf] *= np.linspace(0, 1, xf)[:, None]
    m = np.concatenate([head[:-xf], head[-xf:] + tail_[:xf], tail_[xf:]])
print("score: %d bars out at %.2f s" % (k, seam or 0))
place(music, m, 0.0, 1.0)
kk = int(0.25 * SR)
env = np.clip(smooth(smooth(speech, kk), kk), 0, 1)
duck = 0.58 - 0.40 * env
tail = np.ones(N, np.float32); i0 = int((DUR - 2.6) * SR); tail[i0:] = np.linspace(1, 0, N - i0)
music *= (duck * tail)[:, None]
# and wherever the score swells under her anyway (the lift at 36 s), it steps down to stay 8 dB under the voice
VO_GAIN = 2.8
win = int(0.25 * SR)
rv = np.sqrt(smooth((vo[:, 0] * VO_GAIN) ** 2, win)) + 1e-6
rm = np.sqrt(smooth(music[:, 0] ** 2, win)) + 1e-6
guard = np.where(speech > 0, np.minimum(1.0, rv * 10 ** (-8 / 20) / rm), 1.0)
guard = np.maximum(smooth(smooth(guard, win), win), 0.25).astype(np.float32)
music *= guard[:, None]

# ---- Effects ----
POP = (A4 + "pop_2.mp3", (0.04, 0.32)); POPB = (A4 + "pop_1.mp3", (0.05, 0.6))
DINGS = (A4 + "ding_2.mp3", (0.0, 0.45)); DING = (A4 + "ding_1.mp3", (4.75, 6.4))
FLIP = (A4 + "flip_1.mp3", (0.0, 0.6)); STAMP = (A4 + "flip_1.mp3", (1.18, 1.8)); STAMPB = (A4 + "flip_2.mp3", (1.15, 1.8))
SWIPE = (A4 + "swipe_1.mp3", (0.0, 0.5)); SWIPEB = (A4 + "swipe_2.mp3", (0.0, 0.5))
WHOOSH = (A2 + "sfx_whoosh.mp3", None); WHOOSHB = (A2 + "sfx_whoosh_b.mp3", None)
ICE = (A2 + "sfx_ice.mp3", None); IMPACT = (A2 + "sfx_impact.mp3", None); IMPACTB = (A2 + "sfx_impact_b.mp3", None); RISER = (A2 + "sfx_riser.mp3", None)
CUES = []
def cue(src, t, gain, p=1.0): CUES.append((src[0], t, gain, src[1], p))

# 0. the burn
burn = tw("burn")
cue(POP, 0.3, 0.45, 0.8); cue(WHOOSH, burn - 0.1, 0.5); cue(ICE, burn + 0.2, 0.3); cue(POP, burn + 0.32, 0.4, 1.3)
# 1. the want
people, want = tw("people", at("want")), tw("want", at("want"))
for i in range(18):
    c, r = i % 6, i // 6
    if i % 2 == 0: cue(POP, people - 0.1 + (c + r) * 0.05 + rnd(i) * 0.05, 0.16, 0.9 + rnd(i, 4) * 0.5)
    if i % 3 == 0: cue(POP, want + 0.1 + rnd(i, 3) * 0.6, 0.12, 1.5 + rnd(i, 6) * 0.4)
# 2. the math
m0 = at("m65") - 0.3
n65, n14, n86 = tw("sixtyfive", m0), tw("fourteen", m0), tw("eightysix", m0)
wipe_math = at("norco") - 0.6
for kx in range(12): cue(POP, m0 + 0.1 + kx * 0.075, 0.08, 0.85 + kx * 0.06)
cue(DINGS, n65 + 0.9, 1.6)
for i in range(6): cue(POP, n14 + 0.05 + rnd(i, 5) * 0.5, 0.16, 1.4 + rnd(i, 7) * 0.3)
cue(DINGS, n14 + 0.6, 1.6, 1.12)
for j in range(6): cue(POP, n86 + 0.3 + j * 0.12, 0.2, 1.25)
cue(DINGS, n86 + 0.8, 1.6, 0.94)
cue(POPB, wipe_math - 0.35, 0.4); cue(WHOOSHB, wipe_math, 0.45)
# 3. Norco
n0 = at("norco") - 0.5
july, norco, make = tw("july", n0), tw("norco", n0), tw("make", n0)
cue(POP, n0 + 0.2, 0.3, 0.9); cue(POP, n0 + 0.35, 0.3, 1.0)
cue(WHOOSH, july + 0.1, 0.22); cue(POP, norco + 0.02, 0.4, 0.8); cue(POP, norco + 0.15, 0.3, 1.0)
cue(DINGS, make + 0.3, 0.9, 0.8)
# 4. Ross's goal
r0 = at("ross") - 0.05; g0 = at("goal")
cue(WHOOSH, r0 + 0.05, 0.28); cue(FLIP, tw("goal", r0) + 0.05, 0.32); cue(FLIP, g0 - 0.3, 0.25, 0.9); cue(WHOOSHB, g0 + 0.2, 0.14)
cue(SWIPE, tw("strengthen", g0) + 0.1, 0.45); cue(POP, tw("loyal", g0) + 0.4, 0.28, 1.1)
cue(SWIPEB, tw("create", g0) + 0.1, 0.45, 1.05); cue(POP, tw("franchise", g0) + 0.2, 0.28, 0.95)
cue(WHOOSHB, at("day") - 0.7, 0.3)
# 5. the day
d0 = at("day") - 0.6
cue(POP, d0 + 0.25, 0.25, 0.85); cue(STAMP, tw("november", d0) + 0.15, 0.55)
cue(SWIPE, tw("ten", d0), 0.3, 0.8)
four = tw("four", d0)
for i in range(4): cue(POP, four + i * 0.16, 0.3, 1.0 + i * 0.12)
cue(POP, tw("darwin", d0), 0.4, 0.9)
working = tw("working", at("pitch"))
for i in range(4): cue(POP, working + i * 0.14, 0.18, 1.3 + i * 0.08)
cue(WHOOSHB, at("trends") - 0.65, 0.45)
# 6. what you'll do
o0 = at("trends") - 0.6
three, most = tw("three", o0), tw("most", o0)
then = tw("then", most); four2, samples, fresh, kids = tw("four", then), tw("samples", then), tw("fresh", then), tw("kids", then)
blindw, score, phone = tw("blind", at("blind")), tw("score", at("blind")), tw("phone", at("blind"))
for i in range(7): cue(POP, o0 + 0.2 + i * 0.07, 0.18, 0.9 + i * 0.07)
for i in range(3): cue(STAMPB, three - 0.1 + i * 0.16, 0.5, 1.0 + i * 0.06)
for i in range(4): cue(POP, four2 - 0.1 + i * 0.08, 0.25, 0.85 + i * 0.08)
for i in range(4): cue(STAMP, samples - 0.05 + i * 0.1, 0.4, 1.0 + i * 0.05)
cue(SWIPE, fresh, 0.3); cue(SWIPEB, kids, 0.3, 1.05)
cue(POPB, blindw - 0.2, 0.4, 0.9)
for i in range(4): cue(POP, blindw + 0.15 + i * 0.08, 0.2, 1.3)
cue(WHOOSH, score - 0.25, 0.3)
for kx in range(4): cue(POP, phone + 0.05 + kx * 0.11, 0.26, 1.0 + kx * 0.12)
cue(DINGS, phone + 0.75, 1.0, 1.1)
cue(WHOOSHB, at("noon") - 0.65, 0.45)
# 7. by noon
p0 = at("noon") - 0.6
noon, three2, owner, sample = tw("noon", p0), tw("three", p0), tw("owner", p0), tw("sample", p0)
every, writeup, pb = tw("everyone", sample), tw("writeup", sample), tw("playbook", sample)
cue(DING, noon + 0.4, 0.5)
for kx in range(3): cue(POP, three2 + kx * 0.12, 0.35, 0.85 + kx * 0.1)
for kx in range(3): cue(POP, owner + kx * 0.1, 0.18, 1.3)
for kx in range(3): cue(POP, sample + kx * 0.1, 0.18, 1.15)
for kx in range(8): cue(POP, every + kx * 0.05, 0.1, 1.4 + kx * 0.03)
cue(FLIP, writeup - 0.1, 0.3); cue(POPB, writeup + 0.35, 0.34, 0.85)
for kx in range(8): cue(WHOOSHB, pb + 0.35 + kx * 0.07, 0.06, 1.2 + rnd(kx) * 0.3)
for kx in range(8): cue(POP, pb + 0.95 + kx * 0.07, 0.12, 1.5)
cue(WHOOSHB, at("ask") - 0.65, 0.45)
# 8. the ask
a0 = at("ask")
answer, because = tw("answer", a0), tw("because", a0)
answers, morning, phw = tw("answers", because), tw("morning", because), tw("phone", at("phone"))
for kx in range(4): cue(POP, min(answer, a0 + 0.5) + kx * 0.12, 0.32, 0.9 + kx * 0.08)
cue(DINGS, because + 0.1, 0.9, 0.85); cue(WHOOSH, answers - 0.1, 0.3)
for kx in range(4): cue(POP, morning + kx * 0.1, 0.2, 1.1 + kx * 0.1)
cue(WHOOSH, phw - 0.2, 0.3); cue(POP, phw + 0.5, 0.3, 1.0); cue(DINGS, phw + 0.95, 1.1, 1.2)
cue(RISER, at("title") - 0.5 - 2.9, 0.18)
# 9. the title and end card
t0 = at("title") - 0.5; end = LINES["see"]["end"] + 0.35
cue(IMPACT, t0, 0.5); cue(DING, tw("freshness", t0) + 0.3, 0.3, 0.75)
cue(WHOOSH, end - 0.1, 0.2); cue(DINGS, end + 0.3, 0.7, 0.7); cue(IMPACTB, end + 0.3, 0.12)

cache = {}
for path, t, gain, win, p in CUES:
    if path not in cache: cache[path] = load(path)
    x = cache[path]
    if win: x = x[int(win[0] * SR):int(win[1] * SR) if win[1] else None]
    x = pitch(fade(x.copy(), 0.004, 0.05), p)
    place(sfx, x, t, gain)

sfx *= (1 - 0.5 * env)[:, None]
mix = music + vo * VO_GAIN + sfx
w = int(0.25 * SR); worst = []
for i in range(0, N - w, w):
    if speech[i:i + w].mean() < 0.9: continue
    rv = np.sqrt(np.mean((vo[i:i + w] * VO_GAIN) ** 2)) + 1e-9; rs = np.sqrt(np.mean(sfx[i:i + w] ** 2)) + 1e-9; rm = np.sqrt(np.mean(music[i:i + w] ** 2)) + 1e-9
    if rv < 0.02: continue
    d = 20 * np.log10(rs / rv); dm = 20 * np.log10(rm / rv)
    if d > -4 or dm > -4: worst.append((round(i / SR, 2), round(d, 1), round(dm, 1)))
print("windows where effects (or music) come within 4 dB of the voice [t, sfx-vo dB, music-vo dB]:", worst[:30])
peak = float(np.abs(mix).max())
print("stems peak: music %.2f vo %.2f sfx %.2f mix %.2f; %.2f s" % (np.abs(music).max(), np.abs(vo).max(), np.abs(sfx).max(), peak, DUR))
subprocess.run([FF, "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", OUTWAV], input=(mix / max(1.0, peak * 1.02)).astype(np.float32).tobytes(), check=True)
print("wrote", OUTWAV)

# THE FLAVOR RACE sound engine: places designed sounds against the locked picture and renders the effects stem.
# Every cue is anchored to a segment start parsed from FlavorRaceV9.tsx (timeline.py), so sound cannot drift from
# picture. Sources are the ElevenLabs takes in wav/ (48 kHz) and a few library sounds in lib/; the rest is
# synthesized here: sub blooms, drones, the floodlight hum, room air, glass tones.
# Each acoustic space (night pad, control room, lab, home lawn, the vast dark) has its own reverb. Space has no air,
# so it gets a structure-borne "hull" resonance instead: what you hear in orbit is what travels through metal.
import os
from fractions import Fraction
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))


def db(g): return 10 ** (g / 20)


def secs(dur): return np.arange(int(round(dur * SR))) / SR


def st(y):
    return np.repeat(y[:, None], 2, 1) if y.ndim == 1 else y


def _sos(kind, f, order=2):
    nyq = SR / 2 * 0.98
    f = [min(max(v, 5), nyq) for v in f] if isinstance(f, (list, tuple)) else min(max(f, 5), nyq)
    return butter(order, f, kind, fs=SR, output='sos')


def hp(x, f, order=2): return sosfilt(_sos('hp', f, order), x, axis=0)
def lp(x, f, order=2): return sosfilt(_sos('lp', f, order), x, axis=0)
def bp(x, lo, hi, order=2): return sosfilt(_sos('bp', [lo, hi], order), x, axis=0)


def peq(x, f0, gain, q=1.0):
    # RBJ peaking biquad
    a = db(gain / 2); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * a, -2 * np.cos(w), 1 - al * a]); aa = np.array([1 + al / a, -2 * np.cos(w), 1 - al / a])
    return sosfilt(np.r_[b / aa[0], aa / aa[0]][None, :], x, axis=0)


def lp_auto(x, pts, t0):
    # second-order low-pass whose cutoff follows pts [(film time, Hz)], updated every 256 samples
    pts = sorted(pts); B = 256
    tt = t0 + (np.arange(0, len(x), B) + B / 2) / SR
    fc = np.exp(np.interp(tt, [p[0] for p in pts], np.log([p[1] for p in pts])))
    out = np.empty_like(x); zi = np.zeros((1, 2, x.shape[1]))
    for k, i in enumerate(range(0, len(x), B)):
        out[i:i + B], zi = sosfilt(_sos('lp', fc[k]), x[i:i + B], axis=0, zi=zi)
    return out


def vari(x, rate):
    # variable-speed playback: rate per output sample (pitch and speed together, like tape)
    pos = np.concatenate([[0.0], np.cumsum(rate[:-1])])
    pos = pos[pos < len(x) - 1]
    i = pos.astype(int); fr = (pos - i)[:, None]
    return x[i] * (1 - fr) + x[i + 1] * fr


def resample(x, rate):
    if abs(rate - 1) < 1e-6: return x
    f = Fraction(rate).limit_denominator(240)
    return resample_poly(x, f.denominator, f.numerator, axis=0)


def env_db(x, ms=10):
    m = np.abs(x).max(1) if x.ndim == 2 else np.abs(x)
    b = max(1, int(SR * ms / 1000)); k = len(m) // b
    return 20 * np.log10(np.sqrt((m[:k * b].reshape(k, b) ** 2).mean(1)) + 1e-9), b


def onset(x):
    # first transient: where the level first climbs to 14 dB under the peak, backed off to where it left the floor
    m = np.abs(x).max(1); pk = m.max()
    k = int(np.argmax(m > pk * 0.2))
    lo = max(0, k - int(0.015 * SR)); quiet = np.where(m[lo:k] < pk * 0.03)[0]
    return (lo + quiet[-1] if len(quiet) else k) / SR


def peak_t(x):
    e, b = env_db(x, 10)
    return (int(np.argmax(e)) + 0.5) * b / SR


def rms_active(x):
    e, b = env_db(x, 50)
    act = e > e.max() - 30
    return 10 ** ((10 * np.log10(np.mean(10 ** (e[act] / 10)) + 1e-12)) / 20) if act.any() else 1e-9


def loop_to(x, n, xf=0.3):
    if len(x) >= n: return x[:n]
    f = int(xf * SR); c = np.sin(np.linspace(0, np.pi / 2, f))[:, None]
    out = x.copy()
    while len(out) < n:
        out = np.concatenate([out[:-f], out[-f:] * c[::-1] + x[:f] * c, x[f:]])
    return out[:n]


def fades(x, fi, fo):
    n = len(x)
    if fi > 0:
        k = min(n, int(fi * SR)); x[:k] *= (np.sin(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
    if fo > 0:
        k = min(n, int(fo * SR)); x[n - k:] *= (np.cos(np.linspace(0, np.pi / 2, k)) ** 2)[:, None]
    return x


def pan_width(x, pan, width):
    # mid/side: width scales the side; pan moves the mid with a constant-power law (pan may vary per sample)
    m = (x[:, 0] + x[:, 1]) / 2; s = (x[:, 0] - x[:, 1]) / 2 * width
    a = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    gl, gr = np.cos(a) * np.sqrt(2), np.sin(a) * np.sqrt(2)
    return np.stack([m * gl + s, m * gr - s], 1)


_cache = {}


def load(name):
    if name not in _cache:
        for d in ('wav', 'lib', 'syn'):
            p = os.path.join(HERE, d, name + '.wav')
            if os.path.exists(p):
                x, sr = sf.read(p, always_2d=True, dtype='float64')
                assert sr == SR, (name, sr)
                x = st(x[:, 0]) if x.shape[1] == 1 else x[:, :2]
                _cache[name] = hp(x - x.mean(0), 18)
                break
        else:
            raise FileNotFoundError(name)
    return _cache[name]


# ---------- synthesis ----------
def _rng(seed): return np.random.default_rng(seed)


def pink(dur, seed=0, ch=2):
    n = int(dur * SR); X = np.fft.rfft(_rng(seed).standard_normal((n, ch)), axis=0)
    f = np.fft.rfftfreq(n, 1 / SR); f[0] = f[1]
    x = np.fft.irfft(X / np.sqrt(f)[:, None], n, axis=0)
    return x / np.abs(x).max()


def sub_boom(dur=2.6, f0=56, f1=27, glide=0.35, decay=0.85, attack=0.006, harm=0.15):
    # the delayed low end of every impact: a falling sine, softly saturated so small speakers still feel it
    t = secs(dur); f = f1 + (f0 - f1) * np.exp(-t / glide)
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(1, t / attack) * np.exp(-t / decay)
    y = np.tanh(1.8 * np.sin(ph) * e) * (1 - harm) + harm * np.sin(2 * ph) * e
    return st(y / np.abs(y).max())


def rumble(dur, lo=25, hi=110, seed=0):
    x = bp(_rng(seed).standard_normal((int(dur * SR), 2)), lo, hi, 2)
    return x / np.abs(x).max()


def mains_hum(dur, base=55, seed=0, buzz=0.07):
    # stadium floodlights: a mains family (tuned to A, the score's fifth) with ballast buzz, slowly breathing
    t = secs(dur); r = _rng(seed); y = np.zeros((len(t), 2))
    for k, a in [(2, 1.0), (4, 0.55), (6, 0.33), (8, 0.2), (10, 0.12), (12, 0.08), (14, 0.05), (18, 0.03), (22, 0.02)]:
        for c in range(2):
            fr = base * k * (1 + 0.0004 * np.sin(2 * np.pi * r.uniform(0.05, 0.2) * t + r.uniform(0, 6)))
            y[:, c] += a * np.sin(2 * np.pi * np.cumsum(fr) / SR + r.uniform(0, 6))
    gate = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 2 * base * t)))[:, None]
    bz = bp(r.standard_normal((len(t), 2)), 1500, 5000) * gate
    y = y / np.abs(y).max() + buzz * bz / np.abs(bz).max()
    return y * (1 + 0.07 * np.sin(2 * np.pi * 0.21 * t))[:, None] / np.abs(y).max()


def air(dur, lo=180, hi=5000, hum=0.0, seed=0, base=60):
    # room or lab air handling: shaped pink noise with an optional faint electrical hum
    x = bp(pink(dur, seed), lo, hi)
    x /= np.abs(x).max()
    if hum:
        t = secs(dur)
        h = sum(a * np.sin(2 * np.pi * base * k * t) for k, a in [(1, 0.5), (2, 1.0), (3, 0.35)])
        x += hum * st(h / np.abs(h).max())
    return x / np.abs(x).max()


def space_drone(dur, seed=0):
    # the void: two low tones beating slowly, and a breath of high air so faint it is felt as emptiness
    t = secs(dur); r = _rng(seed)
    # D2 against itself, a fraction apart, with a little A above: it sits under the score's D without being a note
    lo = np.stack([np.sin(2 * np.pi * 73.42 * t) + 0.7 * np.sin(2 * np.pi * 73.71 * t + 1) + 0.22 * np.sin(2 * np.pi * 110.0 * t),
                   np.sin(2 * np.pi * 73.55 * t + 2) + 0.7 * np.sin(2 * np.pi * 73.86 * t) + 0.22 * np.sin(2 * np.pi * 110.2 * t + 3)], 1)
    hi = bp(r.standard_normal((len(t), 2)), 2500, 5500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t[:, None] + np.array([0, 1.7])))
    y = lo / np.abs(lo).max() + 0.035 * hi / np.abs(hi).max()
    return y * (0.85 + 0.15 * np.sin(2 * np.pi * 0.05 * t))[:, None]


def whoosh(dur, f0, f1, q=1.4, seed=0, shape='bell'):
    # band of noise whose centre glides f0 -> f1 (log), bell or rising envelope
    n = int(dur * SR); x = _rng(seed).standard_normal((n, 2)); out = np.empty_like(x); B = 256
    zi = np.zeros((2, 2, 2))
    for k, i in enumerate(range(0, n, B)):
        fc = f0 * (f1 / f0) ** (min(1, (i + B / 2) / n))
        out[i:i + B], zi = sosfilt(_sos('bp', [fc / (1 + 0.5 / q), fc * (1 + 0.5 / q)]), x[i:i + B], axis=0, zi=zi)
    u = np.linspace(0, 1, n)
    e = np.sin(np.pi * u) ** 2 if shape == 'bell' else (u ** 2.2) * np.minimum(1, (1 - u) / 0.04)
    y = out * e[:, None]
    return y / np.abs(y).max()


GLASS = ((1.0, 1.0, 1.0), (2.756, 0.45, 0.55), (5.404, 0.22, 0.32), (8.933, 0.1, 0.18))


def crystal(f0, dur=3.0, partials=GLASS, attack=0.004, detune=0.0018, seed=0):
    # a struck or sung glass: inharmonic partials of a free bar, each with its own decay, twins detuned per side
    t = secs(dur); r = _rng(seed); y = np.zeros((len(t), 2))
    for ratio, amp, dec in partials:
        for c, d in enumerate((1 - detune, 1 + detune)):
            y[:, c] += amp * np.sin(2 * np.pi * f0 * ratio * d * t + r.uniform(0, 6)) * np.exp(-t / (dur * dec * 0.35))
    y *= np.minimum(1, t / attack)[:, None]
    return y / np.abs(y).max()


def flutter(dur, rate=19, lo=1800, hi=7000, seed=0):
    # soft petals in the air: little bursts of high noise at an uneven wing-beat
    r = _rng(seed); n = int(dur * SR); t = secs(dur)
    ph = 2 * np.pi * np.cumsum(rate * (1 + 0.25 * np.sin(2 * np.pi * 3.1 * t))) / SR
    g = np.maximum(0, np.sin(ph)) ** 6
    x = bp(r.standard_normal((n, 2)), lo, hi) * g[:, None]
    x *= (np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5)[:, None]
    return x / np.abs(x).max()


# ---------- reverbs ----------
def ir_room(rt60, pre=0.01, er=(), lp_hz=8000, hp_hz=90, damp=(1.25, 1.0, 0.7, 0.45), seed=1, dur=None):
    dur = dur or min(7.0, rt60 * 1.4 + pre)
    n = int(dur * SR); t = np.arange(n) / SR; r = _rng(seed)
    out = np.zeros((n, 2)); edges = [0, 250, 2000, 6000, SR / 2]
    for c in range(2):
        w = r.standard_normal(n); acc = np.zeros(n)
        for b in range(4):
            lo_, hi_ = edges[b], edges[b + 1]
            s = lp(w, hi_) if lo_ == 0 else (hp(w, lo_) if hi_ >= SR / 2 else bp(w, lo_, hi_))
            acc += s * np.exp(-6.91 * t / (rt60 * damp[b]))
        out[:, c] = acc * np.minimum(1, t / 0.006)
    for k, (tt, g) in enumerate(er):
        i = int(tt * SR); c = k % 2
        if i < n - 40:
            out[i, c] += db(g) * 9; out[i + 31, 1 - c] += db(g) * 5
    out = lp(hp(out, hp_hz), lp_hz)
    out = np.concatenate([np.zeros((int(pre * SR), 2)), out])
    return out / np.sqrt((out ** 2).sum() / 2)


def ir_hull(seed=3):
    # what a hull rings like when an engine or a bolt shakes it: a handful of low metal modes, no air
    t = secs(1.8); r = _rng(seed); out = np.zeros((len(t), 2))
    for f, tau, a in [(58, 0.55, 1.0), (87, 0.42, 0.8), (123, 0.5, 0.75), (171, 0.33, 0.5), (236, 0.28, 0.45), (318, 0.22, 0.35), (447, 0.16, 0.25), (611, 0.1, 0.15)]:
        for c in range(2):
            out[:, c] += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * (1 + r.uniform(-0.01, 0.01)) * t + r.uniform(0, 6))
    out += 0.15 * lp(r.standard_normal(out.shape), 700) * np.exp(-t / 0.3)[:, None]
    # a resonator must not amplify: scale so its loudest frequency passes at unity
    H = np.abs(np.fft.rfft(out, axis=0)).max()
    return out / H


IRS = {
    # the dark before the reveal: an enormous space; one drop tells you how big
    'vast': lambda: ir_room(4.6, pre=0.06, er=[(0.09, -8), (0.17, -11), (0.29, -15)], lp_hz=6000, seed=11),
    # the night pad: few early reflections, slap echoes off the towers, a long environmental tail
    'pad': lambda: ir_room(2.7, pre=0.025, er=[(0.18, -5), (0.33, -9), (0.52, -14), (0.71, -19)], lp_hz=5000, seed=12),
    # Flavor Control: small, warm, short
    'room': lambda: ir_room(0.48, pre=0.004, er=[(0.007, -4), (0.013, -6), (0.021, -8), (0.029, -10)], lp_hz=6500, hp_hz=140, seed=13),
    # the lab: small, bright, glassy
    'lab': lambda: ir_room(0.85, pre=0.006, er=[(0.006, -3), (0.011, -5), (0.017, -7), (0.024, -9)], lp_hz=13000, hp_hz=200, damp=(1.0, 1.0, 0.95, 0.8), seed=14),
    # home: soft, open, short
    'lawn': lambda: ir_room(0.75, pre=0.014, er=[(0.03, -10), (0.06, -14)], lp_hz=7000, seed=15),
    # structure-borne sound in orbit
    'hull': ir_hull,
}


class Mix:
    def __init__(self, dur, warp=None):
        # warp: cues written against an earlier cut are mapped onto this one (see timeline.make_warp)
        self.warp = warp
        self.dur = dur; self.n = int(round(dur * SR)) + SR * 3
        self.dry = np.zeros((self.n, 2)); self.sends = {}; self.log = []; self.kills = {}

    def kill(self, bus, at, fade=0.04, nowarp=False):
        # a hard cut takes the room with it: the reverb of this bus is gated out after `at`
        if self.warp and not nowarp: at = self.warp(at)
        self.kills.setdefault(bus, []).append((at, fade))

    def _wpts(self, pts):
        return [(self.warp(p[0]), p[1]) for p in pts] if pts else pts

    def _place(self, x, start, bus):
        i = int(round(start * SR))
        if i < 0: x = x[-i:]; i = 0
        j = min(self.n, i + len(x))
        if j > i: bus[i:j] += x[:j - i]

    def put(self, src, at, gain=0.0, *, trim=None, rate=1.0, align=None, until=None, length=None, fi=0.003, fo=0.03,
            hpf=None, lpf=None, eq=(), pan=0.0, panauto=None, width=1.0, mono=False, env=None, send=-99.0,
            auto=None, lpauto=None, rateauto=None, loop=False, norm='peak', rev=False, dry=True, space=False, tag='', nowarp=False):
        if self.warp and not nowarp:
            at = self.warp(at, start=True)
            if at is None: return None                       # its shot is gone
            if until is not None: until = self.warp(until)
            auto, lpauto, rateauto, panauto = (self._wpts(v) for v in (auto, lpauto, rateauto, panauto))
        x = load(src) if isinstance(src, str) else st(np.asarray(src, dtype=float))
        if trim: x = x[int(trim[0] * SR): (int(trim[1] * SR) if trim[1] else None)]
        x = x.copy()
        if rev: x = x[::-1].copy()
        x = resample(x, rate)
        if norm == 'peak': x /= np.abs(x).max() + 1e-12
        elif norm == 'rms': x *= 0.1 / (rms_active(x) + 1e-12)          # 0 dB gain = -20 dBFS RMS
        if mono: x = st(x.mean(1))
        off = onset(x) if align == 'onset' else peak_t(x) if align == 'peak' else (align or 0.0)
        start = at - off
        if until is not None: length = until - start
        if length is not None:
            n = int(length * SR); x = loop_to(x, n) if loop else x[:n]
        if rateauto:
            tt = start + np.arange(len(x)) / SR
            x = vari(x, np.interp(tt, [p[0] for p in rateauto], [p[1] for p in rateauto]))
        if hpf: x = hp(x, hpf)
        if lpf: x = lp(x, lpf)
        for f0, g, q in eq: x = peq(x, f0, g, q)
        if lpauto: x = lp_auto(x, lpauto, start)
        x = fades(x, fi, fo)
        g = np.full(len(x), db(gain))
        if auto:
            tt = start + np.arange(len(x)) / SR
            g *= db(np.interp(tt, [p[0] for p in auto], [p[1] for p in auto]))
        x *= g[:, None]
        p = pan
        if panauto:
            tt = start + np.arange(len(x)) / SR
            p = np.interp(tt, [q[0] for q in panauto], [q[1] for q in panauto])
        x = pan_width(x, p, width)
        if space:
            # in orbit only the structure carries sound: low-passed through the hull and ringing its modes
            self._place(lp(x, 380), start, self.dry)
            self.sends.setdefault('hull', np.zeros((self.n, 2)))
            self._place(x * db(-9), start, self.sends['hull'])
        elif dry:
            self._place(x, start, self.dry)
        if env and send > -90:
            self.sends.setdefault(env, np.zeros((self.n, 2)))
            self._place(x * db(send), start, self.sends[env])
        self.log.append((start, start + len(x) / SR, src if isinstance(src, str) else (tag or 'synth'), round(gain, 1), env or ''))
        return start

    def render(self):
        out = self.dry.copy()
        for k, bus in self.sends.items():
            if np.abs(bus).max() == 0: continue
            ir = IRS[k.split(':')[0]]()
            wet = np.stack([fftconvolve(bus[:, c], ir[:, c])[: self.n] for c in range(2)], 1)
            for at, fade in self.kills.get(k, []):
                i = int(at * SR); j = i + max(1, int(fade * SR))
                g = np.ones(self.n); g[i:j] = np.cos(np.linspace(0, np.pi / 2, j - i)) ** 2; g[j:] = 0
                wet *= g[:, None]
            out += wet
        out = hp(out, 22, 4)                              # nothing below hearing
        return out[: int(round(self.dur * SR))]

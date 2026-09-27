// Synthesizes the soundtrack and sound effects for the TheraBreath pre-read reel.
// Everything is generated from scratch (oscillators, noise, envelopes, filters),
// so there are no third-party samples or licences to clear.
//
//   node scripts/make-audio.mjs   ->  public/audio/*.wav
//
// Grid: 120 BPM, one beat = 0.5 s = 15 frames at 30 fps. The groove starts at
// 1.5 s (frame 45), the build runs 11.5-13 s, the final hit lands at 13 s (frame 390).
import { mkdirSync, writeFileSync } from "node:fs";

const SR = 48000;
const OUT = new URL("../public/audio/", import.meta.url);
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------ helpers */
const buf = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function writeWav(name, [L, R], gain = 1) {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const norm = peak > 0 ? (0.89 * gain) / peak : 1;
  const n = L.length, data = Buffer.alloc(44 + n * 4);
  data.write("RIFF", 0); data.writeUInt32LE(36 + n * 4, 4); data.write("WAVE", 8);
  data.write("fmt ", 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write("data", 36); data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    // gentle soft clip after normalising
    const l = Math.tanh(L[i] * norm * 1.05) / Math.tanh(1.05), r = Math.tanh(R[i] * norm * 1.05) / Math.tanh(1.05);
    data.writeInt16LE(clamp(Math.round(l * 32767), -32768, 32767), 44 + i * 4);
    data.writeInt16LE(clamp(Math.round(r * 32767), -32768, 32767), 46 + i * 4);
  }
  writeFileSync(new URL(name, OUT), data);
  console.log("wrote", name, (n / SR).toFixed(2) + "s");
}

// add a mono source into a stereo buffer with pan (-1..1)
function mix(dst, t0, src, gain = 1, pan = 0) {
  const s = Math.floor(t0 * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < src.length; i++) { const j = s + i; if (j < 0 || j >= dst[0].length) continue; dst[0][j] += src[i] * gl; dst[1][j] += src[i] * gr; }
}
// state-variable filter over a mono array; cutoff may be a function of sample index
function svf(x, cutoff, q = 0.7, mode = "lp") {
  const y = new Float32Array(x.length); let lp = 0, bp = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof cutoff === "function" ? cutoff(i) : cutoff;
    const f = 2 * Math.sin(Math.PI * clamp(fc, 20, SR / 6) / SR), damp = 1 / q;
    const hp = x[i] - lp - damp * bp; bp += f * hp; lp += f * bp;
    y[i] = mode === "lp" ? lp : mode === "bp" ? bp : hp;
  }
  return y;
}
const env = (i, a, d, len) => { const t = i / SR; if (t < a) return t / a; return Math.exp(-(t - a) / d) * (len && t > len ? Math.max(0, 1 - (t - len) / 0.05) : 1); };
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));

/* ------------------------------------------------------------ instruments */
function kick(len = 0.45, punch = 1) {
  const x = new Float32Array(len * SR); let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR, f = 48 + 190 * Math.exp(-t * 38) * punch;
    ph += f / SR; x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 6.5) + (t < 0.004 ? rnd() * 0.5 : 0);
  }
  return x;
}
function clap() {
  const x = new Float32Array(0.35 * SR);
  for (let i = 0; i < x.length; i++) { const t = i / SR; const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * (o < 0.02 ? 140 : 22)) : 0), 0); x[i] = rnd() * bursts; }
  return svf(x, 1600, 1.2, "bp");
}
function hat(open = false) {
  const x = new Float32Array((open ? 0.22 : 0.06) * SR);
  for (let i = 0; i < x.length; i++) x[i] = rnd() * Math.exp(-(i / SR) * (open ? 18 : 70));
  return svf(x, 8500, 0.8, "hp");
}
function snare(len = 0.18) {
  const x = new Float32Array(len * SR); let ph = 0;
  for (let i = 0; i < x.length; i++) { const t = i / SR; ph += 190 / SR; x[i] = (rnd() * 0.8 + Math.sin(2 * Math.PI * ph) * 0.5) * Math.exp(-t * 24); }
  return svf(x, 5200, 0.7, "lp");
}
function bass(note, len) {
  const x = new Float32Array(len * SR); let ph = 0; const f = midi(note);
  for (let i = 0; i < x.length; i++) { ph += f / SR; x[i] = (saw(ph) * 0.6 + Math.sin(2 * Math.PI * ph)) * env(i, 0.004, 0.35, len - 0.05); }
  return svf(x, (i) => 260 + 1400 * Math.exp(-i / SR * 12), 1.1);
}
function pluck(note, len = 0.3, bright = 1) {
  const x = new Float32Array(len * SR); let a = 0, b = 0; const f = midi(note);
  for (let i = 0; i < x.length; i++) { a += f / SR; b += (f * 1.005) / SR; x[i] = (saw(a) + saw(b)) * 0.5 * env(i, 0.002, 0.11, len); }
  return svf(x, (i) => 900 + 5200 * bright * Math.exp(-i / SR * 16), 1.3);
}
function pad(notes, len, cutoff = 1800) {
  const x = new Float32Array(len * SR);
  notes.forEach((n) => { [-0.08, 0, 0.08].forEach((dt) => { let ph = Math.random(); const f = midi(n) * 2 ** (dt / 12);
    for (let i = 0; i < x.length; i++) { ph += f / SR; x[i] += saw(ph) * 0.12; } }); });
  for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= Math.min(1, t / 0.4) * Math.min(1, (len - t) / 0.5); }
  return svf(x, cutoff, 0.8);
}
function noiseSweep(len, f0, f1, q = 1.5, shape = (p) => p) {
  const x = new Float32Array(len * SR);
  for (let i = 0; i < x.length; i++) x[i] = rnd();
  const y = svf(x, (i) => f0 * (f1 / f0) ** shape(i / x.length), q, "bp");
  return y;
}
// simple stereo reverb (Schroeder): 4 combs + 2 allpasses per side
function reverb([L, R], wet = 0.25, size = 1) {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.round(d * size)), aps = [225, 556];
  const proc = (x, spread) => {
    const out = new Float32Array(x.length);
    combs.forEach((d0) => { const d = d0 + spread, line = new Float32Array(d); let k = 0, lp = 0;
      for (let i = 0; i < x.length; i++) { const y = line[k]; lp = y * 0.8 + lp * 0.2; line[k] = x[i] + lp * 0.8; k = (k + 1) % d; out[i] += y * 0.25; } });
    aps.forEach((d) => { const line = new Float32Array(d); let k = 0;
      for (let i = 0; i < out.length; i++) { const v = line[k], inp = out[i]; line[k] = inp + v * 0.5; out[i] = v - inp * 0.5; k = (k + 1) % d; } });
    return out;
  };
  const wl = proc(L, 0), wr = proc(R, 23);
  for (let i = 0; i < L.length; i++) { L[i] = L[i] * (1 - wet) + wl[i] * wet; R[i] = R[i] * (1 - wet) + wr[i] * wet; }
}

/* ------------------------------------------------------------ music */
const DUR = 15.2, BEAT = 0.5, START = 1.5, BUILD = 11.5, HIT = 13.0;
const beatT = (b) => START + b * BEAT;
const music = buf(DUR);
const drums = buf(DUR);
// progression E - C#m - A - B (one bar each), repeating; E major, bright and open
const CH = [
  { root: 40, pad: [64, 68, 71, 76], arp: [76, 71, 68, 71, 80, 76, 71, 68] },
  { root: 37, pad: [61, 64, 68, 73], arp: [73, 68, 64, 68, 76, 73, 68, 64] },
  { root: 33, pad: [57, 61, 64, 69], arp: [73, 69, 64, 69, 76, 73, 69, 64] },
  { root: 35, pad: [59, 63, 66, 71], arp: [75, 71, 66, 71, 78, 75, 71, 66] },
];

// intro 0-1.5: low pad swell, filtered shut, opening up
mix(music, 0, pad([52, 59, 64, 68], 1.7, 700), 0.8);
// groove 1.5-11.5: five bars
for (let bar = 0; bar < 5; bar++) {
  const c = CH[bar % 4], t0 = beatT(bar * 4);
  mix(music, t0, pad(c.pad, 2.05, 2400), 0.55);
  for (let s = 0; s < 8; s++) mix(music, t0 + s * 0.25, bass(c.root + (s % 4 === 3 ? 12 : 0), 0.24), 0.55);
  for (let s = 0; s < 16; s++) mix(music, t0 + s * 0.125, pluck(c.arp[s % 8], 0.28, bar < 2 ? 0.7 : 1), 0.2, s % 2 ? 0.45 : -0.45);
}
// build 11.5-13: B chord, rising filter, arp doubling up
{ const c = CH[3];
  mix(music, BUILD, pad(c.pad.concat([83]), 1.55, 900), 0.5);
  for (let s = 0; s < 24; s++) { const t = BUILD + s * 0.0625; mix(music, t, pluck(c.arp[s % 8] + (s > 15 ? 12 : 0), 0.14, 0.4 + s / 24), 0.16 + s * 0.004, s % 2 ? 0.5 : -0.5); }
  for (let s = 0; s < 6; s++) mix(music, BUILD + s * 0.25, bass(c.root, 0.22), 0.45);
}
// final hit 13.0: E chord, big and open, ringing out
mix(music, HIT, pad([52, 64, 68, 71, 76, 80, 83], 2.2, 3200), 0.75);
mix(music, HIT, bass(28, 1.6), 0.7);
[76, 80, 83, 88].forEach((n, k) => mix(music, HIT + k * 0.06, pluck(n, 1.4, 1), 0.22, k % 2 ? 0.5 : -0.5));
reverb(music, 0.28, 1.1);

// drums
for (let b = 0; b < 20; b++) {
  const t = beatT(b);
  mix(drums, t, kick(0.45, b === 0 ? 1.4 : 1), b === 0 ? 1.1 : 0.9);
  if (b % 2 === 1) mix(drums, t, clap(), 0.55);
  mix(drums, t + 0.25, hat(b % 4 === 3), 0.28, 0.3);
  if (b >= 4) { mix(drums, t + 0.125, hat(), 0.14, -0.3); mix(drums, t + 0.375, hat(), 0.14, -0.3); }
}
// snare roll through the build: 8ths -> 16ths -> 32nds
{ let t = BUILD, k = 0; while (t < HIT - 0.01) { const step = t < 12.0 ? 0.25 : t < 12.5 ? 0.125 : 0.0625; mix(drums, t, snare(0.12), 0.25 + (t - BUILD) * 0.3); t += step; k++; } }
mix(drums, HIT, kick(0.9, 1.6), 1.3);
// crash
{ const x = new Float32Array(2.2 * SR); for (let i = 0; i < x.length; i++) x[i] = rnd() * Math.exp(-(i / SR) * 2.2); mix(drums, HIT, svf(x, 6000, 0.6, "hp"), 0.45); }
reverb(drums, 0.12, 0.7);

// sum drums into music, master fade
for (let i = 0; i < music[0].length; i++) {
  const t = i / SR, fade = t > 14.2 ? Math.max(0, 1 - (t - 14.2) / 0.95) : 1;
  music[0][i] = (music[0][i] + drums[0][i]) * fade; music[1][i] = (music[1][i] + drums[1][i]) * fade;
}
writeWav("music.wav", music, 0.95);

/* ------------------------------------------------------------ sfx */
const one = (len, fn, wet = 0.2) => { const b = buf(len); fn(b); if (wet) reverb(b, wet, 0.9); return b; };
// water drop: pitched sine blip that sweeps up
writeWav("drop.wav", one(0.6, (b) => { const x = new Float32Array(0.25 * SR); let ph = 0;
  for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (500 + 1900 * (1 - Math.exp(-t * 40))) / SR; x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 26); }
  mix(b, 0, x, 1); }, 0.35));
// splash: noise burst with bright band and fizzy tail
writeWav("splash.wav", one(1.4, (b) => { const x = noiseSweep(0.9, 3800, 900, 0.9, (p) => Math.sqrt(p));
  for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= Math.exp(-t * 7) * (t < 0.01 ? t / 0.01 : 1); }
  const fizz = new Float32Array(1.2 * SR); for (let i = 0; i < fizz.length; i++) fizz[i] = (Math.abs(rnd()) > 0.992 ? rnd() : 0) * Math.exp(-(i / SR) * 3);
  mix(b, 0, x, 1); mix(b, 0.02, svf(fizz, 7000, 2, "bp"), 1.2, 0.2); }, 0.3));
// whoosh: band-passed noise sweeping up then down, panned across
writeWav("whoosh.wav", one(0.9, (b) => { const len = 0.7, x = noiseSweep(len, 400, 5000, 2.2, (p) => Math.sin(p * Math.PI) * 0.9);
  for (let i = 0; i < x.length; i++) { const p = i / x.length; x[i] *= Math.sin(p * Math.PI) ** 1.5; }
  const half = x.length / 2; mix(b, 0, x.subarray(0, half), 1, -0.6); mix(b, half / SR, x.subarray(half), 1, 0.6); }, 0.15));
// whip: very short fast sweep for word cuts
writeWav("whip.wav", one(0.4, (b) => { const x = noiseSweep(0.18, 1200, 9000, 3, (p) => p * p);
  for (let i = 0; i < x.length; i++) { const p = i / x.length; x[i] *= p < 0.7 ? p / 0.7 : (1 - p) / 0.3; }
  const tick = new Float32Array(0.02 * SR); for (let i = 0; i < tick.length; i++) tick[i] = Math.sin(2 * Math.PI * 2400 * i / SR) * Math.exp(-i / SR * 300);
  mix(b, 0, x, 1); mix(b, 0.17, tick, 0.6); }, 0.1));
// pop / bubble for liquid changes
writeWav("pop.wav", one(0.35, (b) => { const x = new Float32Array(0.12 * SR); let ph = 0;
  for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (320 + 900 * t / 0.12) / SR; x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 38); }
  mix(b, 0, x, 1); }, 0.25));
// glass tick for tiles
writeWav("tick.wav", one(0.4, (b) => { [2637, 3951, 5274].forEach((f, k) => { const x = new Float32Array(0.3 * SR);
  for (let i = 0; i < x.length; i++) x[i] = Math.sin(2 * Math.PI * f * i / SR) * Math.exp(-i / SR * (18 + k * 10)); mix(b, 0, x, 0.5 / (k + 1)); }); }, 0.3));
// stamp impact for the three words
writeWav("impact.wav", one(1.0, (b) => { mix(b, 0, kick(0.6, 1.3), 1); const n = new Float32Array(0.25 * SR);
  for (let i = 0; i < n.length; i++) n[i] = rnd() * Math.exp(-i / SR * 20); mix(b, 0, svf(n, 2500, 0.7), 0.5); }, 0.25));
// riser for the build
writeWav("riser.wav", one(1.6, (b) => { const len = 1.5, x = noiseSweep(len, 300, 9000, 3.5, (p) => p ** 1.7); let ph = 0;
  const tone = new Float32Array(len * SR); for (let i = 0; i < tone.length; i++) { const p = i / tone.length; ph += (220 * 2 ** (p * 3)) / SR; tone[i] = saw(ph) * 0.18; }
  const t2 = svf(tone, (i) => 400 + 6000 * (i / tone.length) ** 2, 1.5);
  for (let i = 0; i < x.length; i++) { const p = i / x.length; const e = p ** 2; x[i] *= e; t2[i] *= e; }
  mix(b, 0, x, 1); mix(b, 0, t2, 0.8); }, 0.2));
// shimmer on the end card
writeWav("shimmer.wav", one(2.4, (b) => { [88, 92, 95, 100, 104].forEach((n, k) => mix(b, k * 0.07, pluck(n, 1.6, 1), 0.5 / (1 + k * 0.3), k % 2 ? 0.6 : -0.6)); }, 0.45));

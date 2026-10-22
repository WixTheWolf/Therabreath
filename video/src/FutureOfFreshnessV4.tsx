import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import voWordsRaw from "../public/fof4/vo_words.json";
import linesRaw from "../public/fof4/lines.json";

/* The Future of Freshness, V4 (88 seconds).
   Fun and informative. No generated footage: everything on screen is drawn and animated here, in the palette of the
   site (Cloud Dancer, ink, teal, and the four platform colors). A bright voice tells the story; the words on screen land
   on the words she says (timings from the transcript in public/fof4/vo_words.json, lines placed by lines.json).
   Chapters: the burn, the want, the math (100 houses), hello, Norco, Ross's ask, November 9, Signals, Flavor School,
   Territories, four blind cups, Concepts, Pipeline, the Playbook, the title. Blind: no sample names or ingredients.
   Picture renders muted; scripts/fof4_mix.py builds the mix from the same lines.json. */

const FPS = 30;
const f = (t: number) => Math.round(t * FPS);
export const FOF4_FRAMES = f(87);
const useT = () => useCurrentFrame() / FPS;

const BG = "#F0EEE9";
const INK = "#0B1B2B";
const TEAL = "#2E8FA8";
const ICE = "#BFE9F2";
const GOLD = "#F4B860";
const CORAL = "#E8705F";
const PINK = "#E0407B";
const GREEN = "#6FAF8B";
const CREAM = "#FBFAF7";
const DIM = "rgba(11,27,43,.58)";
const LINE = "rgba(11,27,43,.14)";
const PALETTE = [TEAL, GOLD, CORAL, GREEN, PINK, ICE];
const SERIF = '"Newsreader", Georgia, serif';
const SANS = '"Geist", system-ui, sans-serif';
const MONO = '"Geist Mono", ui-monospace, monospace';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const L = 120;

let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded || typeof document === "undefined") return;
  fontsLoaded = true;
  const handle = delayRender("fof4 fonts");
  const faces = [
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Geist Mono", `url(${staticFile("fonts/GeistMono-Variable.woff2")})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle)).catch(() => continueRender(handle));
};

/* ---------- Timing: the voice, word by word, in film seconds ---------- */
type Line = { id: string; src0: number; src1: number; at: number };
const LINES = linesRaw as Line[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const WORDS = (voWordsRaw as { words: { text: string; start: number; end: number }[] }).words
  .filter((w) => w.start >= 0.17)
  .map((w) => {
    const ln = LINES.find((l) => w.start >= l.src0 - 0.02 && w.start < l.src1);
    const off = ln ? ln.at - ln.src0 : 0;
    return { w: norm(w.text), t0: w.start + off, t1: w.end + off };
  });
const lineAt = (id: string) => { const ln = LINES.find((l) => l.id === id); if (!ln) throw new Error("no line " + id); return ln.at; };
/* tw("word", n): film time of the (n+1)th time the voice says it. */
const tw = (q: string, n = 0) => {
  let k = 0;
  for (const x of WORDS) if (x.w === norm(q)) { if (k === n) return x.t0; k++; }
  throw new Error("the voice never says " + q);
};
/* Word times for a sentence on screen: the first token is matched at or after `after`, the rest follow in order. */
const wordTimes = (tokens: string[], after: number, stagger = 0.12) => {
  const out: number[] = [];
  let i = WORDS.findIndex((x) => x.t0 >= after - 0.05 && x.w === norm(tokens[0]));
  let last = after;
  for (const tk of tokens) {
    const n = norm(tk);
    if (!n) { out.push(last); continue; }
    if (i >= 0 && i < WORDS.length && WORDS[i].w === n) { last = WORDS[i].t0; i++; }
    else { const j = WORDS.findIndex((x, k) => k > i && k < i + 4 && x.w === n); if (j >= 0) { last = WORDS[j].t0; i = j + 1; } else last = last + stagger; }
    out.push(last);
  }
  return out;
};

/* ---------- Motion helpers ---------- */
const POP = { damping: 11, stiffness: 190, mass: 0.7 };
const SOFT = { damping: 17, stiffness: 120, mass: 0.9 };
const SNAP = { damping: 16, stiffness: 320, mass: 0.6 };
const BOUNCE = { damping: 9, stiffness: 150, mass: 0.9 };
type Cfg = typeof POP;
const sp = (t: number, at: number, cfg: Cfg = POP) => (t < at ? 0 : spring({ frame: (t - at) * FPS, fps: FPS, config: cfg }));
const ez = (t: number, a: number, b: number, easing = easeOut) => interpolate(t, [a, b], [0, 1], { ...clamp, easing });
const exitP = (t: number, out?: number, d = 0.25) => (out === undefined ? 0 : interpolate(t, [out - d, out], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }));
const rnd = (i: number, k = 0) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

/* Pop: an element springs in from nothing (with a little rotation) and, at `out`, shrinks away. */
const Pop: React.FC<{ at: number; out?: number; x: number; y: number; rot?: number; cfg?: Cfg; origin?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, out, x, y, rot = 0, cfg = POP, origin = "50% 50%", style, children }) => {
  const t = useT();
  if (t < at) return null;
  const e = exitP(t, out);
  if (e >= 1) return null;
  const s = sp(t, at, cfg) * (1 - e);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${(1 - Math.min(1, s)) * rot}deg)`, transformOrigin: origin, opacity: Math.min(1, s * 4), ...style }}>{children}</div>
  );
};

/* Slide: an element arrives from an offset (springy) and leaves the same way. */
const Slide: React.FC<{ at: number; out?: number; x: number; y: number; dx?: number; dy?: number; cfg?: Cfg; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, out, x, y, dx = 0, dy = 60, cfg = SOFT, style, children }) => {
  const t = useT();
  if (t < at) return null;
  const e = exitP(t, out, 0.3);
  if (e >= 1) return null;
  const s = sp(t, at, cfg);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${dx * (1 - s) - dx * 0.6 * e}px, ${dy * (1 - s) - dy * 0.8 * e}px)`, opacity: Math.min(1, s * 2.5) * (1 - e), ...style }}>{children}</div>
  );
};

/* ---------- Type ---------- */
const serif = (size: number, weight = 300): React.CSSProperties => ({ font: `${weight} ${size}px/1.06 ${SERIF}`, fontVariationSettings: '"opsz" 72', letterSpacing: "-0.025em", color: INK });
const sans = (size: number, weight = 500): React.CSSProperties => ({ font: `${weight} ${size}px/1.15 ${SANS}`, letterSpacing: "-0.02em", color: INK });
const mono = (size: number): React.CSSProperties => ({ font: `500 ${size}px/1.2 ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM });

/* Say: a sentence whose words spring up as the voice says them. *word* sets italic in the accent color; ^group^ and ~group~
   mark phrases a highlighter sweeps under at hiAt[0] and hiAt[1]. */
type Tok = { w: string; it: boolean; hi: number; br: boolean };
const tokenize = (text: string): Tok[] => {
  let it = false, hi = 0;
  return text.split(" ").map((raw) => {
    if (raw === "/") return { w: "", it, hi, br: true };
    let w = raw;
    if (w.startsWith("*")) { it = true; w = w.slice(1); }
    if (w.startsWith("^")) { hi = 1; w = w.slice(1); }
    if (w.startsWith("~")) { hi = 2; w = w.slice(1); }
    const tok = { w: w.replace(/[*^~]/g, ""), it, hi, br: false };
    if (/\*[.,:;!?”]*$/.test(w)) it = false;
    if (/[\^~][.,:;!?”]*$/.test(w)) hi = 0;
    return tok;
  });
};
const Say: React.FC<{ text: string; after: number; out?: number; size?: number; weight?: number; style?: React.CSSProperties; align?: "left" | "center"; accent?: string; hiAt?: number[]; hiColors?: string[]; width?: number }> = ({ text, after, out, size = 64, weight = 300, style, align = "left", accent = TEAL, hiAt = [], hiColors = [ICE, GOLD], width }) => {
  const t = useT();
  if (t < after - 0.05) return null;
  const toks = tokenize(text);
  const times = wordTimes(toks.map((x) => x.w), after);
  const e = exitP(t, out, 0.3);
  if (e >= 1) return null;
  return (
    <div style={{ position: "absolute", ...serif(size, weight), textAlign: align, width, opacity: 1 - e, transform: `translateY(${-e * 26}px)`, ...style }}>
      {toks.map((tk, i) => {
        if (tk.br) return <br key={i} />;
        const t0 = times[i];
        const s = sp(t, t0, SNAP);
        if (s <= 0) return <React.Fragment key={i}><span style={{ opacity: 0 }}>{tk.w} </span></React.Fragment>;
        const hp = tk.hi ? ez(t, hiAt[tk.hi - 1] ?? 1e9, (hiAt[tk.hi - 1] ?? 1e9) + 0.55, Easing.inOut(Easing.cubic)) : 0;
        const inner: React.CSSProperties = {
          display: "inline-block", transform: `translateY(${(1 - Math.min(1, s)) * 0.55}em) rotate(${(1 - Math.min(1, s)) * -4}deg)`, opacity: Math.min(1, s * 3),
          fontStyle: tk.it ? "italic" : undefined, color: tk.it ? accent : undefined,
          backgroundImage: tk.hi ? `linear-gradient(${hiColors[tk.hi - 1]}, ${hiColors[tk.hi - 1]})` : undefined, backgroundRepeat: "no-repeat", backgroundSize: `${hp * 100}% 42%`, backgroundPosition: "0 78%", padding: tk.hi ? "0 0.06em" : undefined, margin: tk.hi ? "0 -0.06em" : undefined,
        };
        return <React.Fragment key={i}><span style={inner}>{tk.w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};

/* Kick: a small mono label that fades in while its tracking settles. */
const Kick: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; size?: number; color?: string }> = ({ at, out, children, style, size = 20, color = DIM }) => {
  const t = useT();
  const a = ez(t, at, at + 0.5);
  const e = exitP(t, out, 0.25);
  if (a <= 0 || e >= 1) return null;
  return <div style={{ position: "absolute", ...mono(size), color, letterSpacing: `${0.18 + (1 - a) * 0.25}em`, opacity: a * (1 - e), whiteSpace: "nowrap", ...style }}>{children}</div>;
};

/* Num: a big number that counts up to its value and lands with a little bounce. */
const Num: React.FC<{ at: number; out?: number; to: number; dur?: number; x: number; y: number; color?: string; size?: number }> = ({ at, out, to, dur = 0.9, x, y, color = INK, size = 230 }) => {
  const t = useT();
  if (t < at) return null;
  const e = exitP(t, out);
  if (e >= 1) return null;
  const v = Math.round(interpolate(t, [at, at + dur], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = t >= at + dur ? 1 + 0.06 * Math.sin(Math.min(1, (t - at - dur) / 0.35) * Math.PI) : 1;
  const a = sp(t, at, SOFT);
  return <div style={{ position: "absolute", left: x, top: y, ...sans(size, 750), color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.05em", lineHeight: 1, transform: `scale(${land * (1 - e)})`, transformOrigin: "0 100%", opacity: Math.min(1, a * 3) }}>{v}</div>;
};

/* Wipe: a colored disc grows from (x, y) over the outgoing scene; the next scene opens through a circle from the same point. */
const WipeOut: React.FC<{ at: number; x: number; y: number; color: string }> = ({ at, x, y, color }) => {
  const t = useT();
  if (t < at || t > at + 1.2) return null;
  const r = interpolate(t, [at, at + 0.45], [0, 2300], { ...clamp, easing: Easing.in(Easing.quad) });
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: color }} />;
};
const wipeIn = (t: number, at: number, x: number, y: number): React.CSSProperties => {
  if (t > at + 0.8) return {};
  const r = interpolate(t, [at + 0.18, at + 0.7], [0, 2300], { ...clamp, easing: Easing.out(Easing.quad) });
  return { clipPath: `circle(${r}px at ${x}px ${y}px)` };
};
/* Scene: a window in film time. */
const Scene: React.FC<{ from: number; to: number; wipe?: { x: number; y: number }; children: React.ReactNode }> = ({ from, to, wipe, children }) => {
  const t = useT();
  if (t < from || t >= to) return null;
  return <AbsoluteFill style={wipe ? wipeIn(t, from, wipe.x, wipe.y) : undefined}>{children}</AbsoluteFill>;
};

/* ---------- Glyphs: everything is drawn here, in ink strokes and flat fills ---------- */
const STROKE = 3;
const House: React.FC<{ fill: string; stroke?: string; dot?: boolean; size?: number }> = ({ fill, stroke = INK, dot, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M6 19 L20 7 L34 19 V34 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 Z" fill={fill} stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M3 20 L20 5 L37 20" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    {dot && <circle cx={20} cy={26} r={4.2} fill="#fff" />}
  </svg>
);
const Person: React.FC<{ color: string; size?: number }> = ({ color, size = 64 }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 64 80">
    <circle cx={32} cy={20} r={14} fill={color} />
    <path d="M10 78 V60 a22 22 0 0 1 44 0 V78 Z" fill={color} />
  </svg>
);
const Flame: React.FC<{ t: number; size?: number }> = ({ t, size = 300 }) => {
  const j = 1 + 0.03 * Math.sin(t * 27) + 0.02 * Math.sin(t * 41 + 1);
  const k = 1 + 0.04 * Math.sin(t * 33 + 2);
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{ transform: `scale(${j}, ${k})`, transformOrigin: "50% 100%" }}>
      <defs><linearGradient id="fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={CORAL} /><stop offset="1" stopColor={GOLD} /></linearGradient></defs>
      <path d="M50 4 C58 30 86 44 86 76 a36 36 0 0 1 -72 0 C14 56 30 46 36 28 C40 42 48 46 54 40 C58 32 50 18 50 4 Z" fill="url(#fl)" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M50 60 C56 74 66 80 66 92 a16 16 0 0 1 -32 0 C34 82 46 74 50 60 Z" fill={CREAM} opacity={0.9} />
    </svg>
  );
};
const Wave: React.FC<{ width: number; color: string; amp?: number; period?: number; phase?: number; h?: number }> = ({ width, color, amp = 18, period = 140, phase = 0, h = 120 }) => {
  const pts: string[] = [];
  for (let x = 0; x <= width; x += 10) pts.push(`${x} ${h / 2 + amp * Math.sin((x / period) * Math.PI * 2 + phase)}`);
  return <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}><path d={`M${pts.join(" L")} L${width} ${h} L0 ${h} Z`} fill={color} /></svg>;
};
const Snowflake: React.FC<{ size?: number; color?: string }> = ({ size = 70, color = TEAL }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100">
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={-44} y1={0} x2={44} y2={0} stroke={color} strokeWidth={5} strokeLinecap="round" />
        {[-28, 28].map((x) => <g key={x}><line x1={x} y1={0} x2={x + (x < 0 ? -12 : 12)} y2={-12} stroke={color} strokeWidth={4.5} strokeLinecap="round" /><line x1={x} y1={0} x2={x + (x < 0 ? -12 : 12)} y2={12} stroke={color} strokeWidth={4.5} strokeLinecap="round" /></g>)}
      </g>
    ))}
  </svg>
);
const Check: React.FC<{ size?: number; color?: string; bg?: string }> = ({ size = 72, color = "#fff", bg = TEAL }) => (
  <svg width={size} height={size} viewBox="0 0 72 72"><circle cx={36} cy={36} r={34} fill={bg} /><path d="M20 37 L31 48 L53 25" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cup: React.FC<{ size?: number; letter?: string; letterAt?: number; t: number }> = ({ size = 220, letter, letterAt = 0, t }) => {
  const ls = letter ? sp(t, letterAt, SNAP) : 0;
  return (
    <div style={{ position: "relative", width: size, height: size * 1.1 }}>
      <svg width={size} height={size * 1.1} viewBox="0 0 100 110">
        <path d="M14 22 L24 100 a6 6 0 0 0 6 5 H70 a6 6 0 0 0 6 -5 L86 22 Z" fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        <ellipse cx={50} cy={22} rx={36} ry={9} fill={CREAM} stroke={INK} strokeWidth={2.6} />
        <path d="M22 60 L26 92" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      </svg>
      {letter && ls > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "58%", transform: `translate(-50%, -50%) scale(${2.2 - 1.2 * Math.min(1, ls)}) rotate(${(1 - Math.min(1, ls)) * -18}deg)`, opacity: Math.min(1, ls * 2), ...sans(size * 0.42, 800), color: INK }}>{letter}</div>
      )}
    </div>
  );
};
const Book: React.FC<{ w?: number; color?: string; children?: React.ReactNode }> = ({ w = 300, color = INK, children }) => (
  <div style={{ position: "relative", width: w, height: w * 1.32 }}>
    <div style={{ position: "absolute", inset: 0, background: CREAM, borderRadius: 10, transform: "translate(10px, 10px)", border: `2.5px solid ${INK}` }} />
    <div style={{ position: "absolute", inset: 0, background: color, borderRadius: 10, border: `2.5px solid ${INK}`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 22, background: "rgba(255,255,255,.14)" }} />
      {children}
    </div>
  </div>
);
/* An arc gauge from 10:00 (left) to 12:00 (right), drawn as a half ring in four chapter colors. */
const Gauge: React.FC<{ t: number; at: number; split: number; r?: number }> = ({ t, at, split, r = 300 }) => {
  const draw = ez(t, at, at + 0.9, Easing.inOut(Easing.cubic));
  const len = Math.PI * r;
  const cols = [TEAL, GREEN, GOLD, CORAL];
  return (
    <svg width={2 * r + 80} height={r + 80} viewBox={`${-r - 40} ${-r - 40} ${2 * r + 80} ${r + 80}`}>
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={LINE} strokeWidth={34} />
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={TEAL} strokeWidth={34} strokeDasharray={`${len * draw} ${len}`} strokeLinecap="butt" opacity={t < split ? 1 : 0} />
      {cols.map((c, i) => {
        const s = sp(t, split + i * 0.18, SNAP);
        if (s <= 0) return null;
        const a0 = Math.PI * (1 - i / 4), a1 = Math.PI * (1 - (i + 1) / 4);
        const mid = (a0 + a1) / 2;
        const x0 = -Math.cos(a0 - Math.PI) * r, y0 = -Math.sin(a0) * r, x1 = -Math.cos(a1 - Math.PI) * r, y1 = -Math.sin(a1) * r;
        return (
          <g key={i} transform={`translate(${Math.cos(mid) * 6 * Math.min(1, s)} ${-Math.sin(mid) * 6 * Math.min(1, s)})`}>
            <path d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={c} strokeWidth={34 + 10 * Math.max(0, s - 1)} strokeLinecap="butt" />
            <text x={Math.cos(mid) * (r + 54)} y={-Math.sin(mid) * (r + 54) + 8} textAnchor="middle" style={{ font: `500 22px ${MONO}`, letterSpacing: "0.1em", fill: INK, opacity: Math.min(1, s) }}>0{i + 1}</text>
          </g>
        );
      })}
      <text x={-r} y={46} textAnchor="middle" style={{ font: `500 20px ${MONO}`, letterSpacing: "0.12em", fill: DIM }}>10:00</text>
      <text x={r} y={46} textAnchor="middle" style={{ font: `500 20px ${MONO}`, letterSpacing: "0.12em", fill: DIM }}>12:00</text>
    </svg>
  );
};
const Clock: React.FC<{ t: number; at: number; from: number; to: number; dur?: number; r?: number; glow?: boolean }> = ({ t, at, from, to, dur = 0.6, r = 160, glow }) => {
  const h = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: Easing.inOut(Easing.cubic) }); // hours, 12 = top
  const hourA = (h % 12) * 30, minA = (h % 1) * 360;
  const done = t >= at + dur;
  return (
    <svg width={2 * r + 20} height={2 * r + 20} viewBox={`${-r - 10} ${-r - 10} ${2 * r + 20} ${2 * r + 20}`}>
      <circle r={r} fill="#fff" stroke={INK} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r + 12} x2={0} y2={-r + (i % 3 === 0 ? 34 : 24)} stroke={i === 0 && glow && done ? TEAL : INK} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={12} x2={0} y2={-r * 0.52} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${hourA})`} />
      <line x1={0} y1={14} x2={0} y2={-r * 0.78} stroke={TEAL} strokeWidth={6} strokeLinecap="round" transform={`rotate(${minA})`} />
      <circle r={9} fill={INK} />
      {glow && done && <circle cy={-r + 22} r={16 + 10 * Math.abs(Math.sin((t - at - dur) * 6))} fill="none" stroke={TEAL} strokeWidth={3} opacity={Math.max(0, 1 - (t - at - dur) * 0.9)} />}
    </svg>
  );
};
const Beaker: React.FC<{ color: string; level: number; t: number; w?: number }> = ({ color, level, t, w = 120 }) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 100 130">
    <path d="M30 6 V44 L8 108 a10 10 0 0 0 9 14 H83 a10 10 0 0 0 9 -14 L70 44 V6" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M${30 - (100 - level * 100) * 0.2} ${122 - level * 78} H${70 + (100 - level * 100) * 0.2} L89 112 a6 6 0 0 1 -6 6 H17 a6 6 0 0 1 -6 -6 Z`} fill={color} opacity={0.9} />
    {[0, 1, 2].map((i) => { const p = ((t * 0.6 + i * 0.37) % 1); return <circle key={i} cx={38 + i * 12 + 4 * Math.sin(t * 3 + i)} cy={116 - p * 60} r={3 + i} fill="#fff" opacity={0.8 * (1 - p)} />; })}
    <line x1={22} y1={6} x2={78} y2={6} stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </svg>
);
const Envelope: React.FC<{ open: number; w?: number }> = ({ open, w = 520 }) => {
  const h = w * 0.62;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: GOLD, borderRadius: 16, border: `3px solid ${INK}` }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h * 0.55, transformOrigin: "50% 0", transform: `rotateX(${open * 180}deg)`, backfaceVisibility: "hidden" }}>
        <svg width={w} height={h * 0.55} viewBox="0 0 100 34" preserveAspectRatio="none"><path d="M1 1 L50 33 L99 1 Z" fill="#F7CF8E" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" /></svg>
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={w} height={h} viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M1 61 L40 30 M99 61 L60 30" fill="none" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" /></svg>
    </div>
  );
};
const Plane: React.FC<{ size?: number; color?: string }> = ({ size = 54, color = INK }) => (
  <svg width={size} height={size} viewBox="0 0 54 54"><path d="M4 27 L50 8 L36 46 L26 31 Z" fill={color} /><path d="M26 31 L50 8" stroke="#fff" strokeWidth={3} /></svg>
);
const Pin: React.FC<{ color: string; size?: number }> = ({ color, size = 64 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 64 84"><path d="M32 82 C14 54 4 42 4 30 a28 28 0 0 1 56 0 C60 42 50 54 32 82 Z" fill={color} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><circle cx={32} cy={30} r={11} fill="#fff" /></svg>
);
/* Seven signal icons, outline style, each a different stroke color. */
const SignalIcon: React.FC<{ i: number; size?: number }> = ({ i, size = 96 }) => {
  const c = [TEAL, GREEN, CORAL, GOLD, PINK, TEAL, GREEN][i];
  const p = { fill: "none", stroke: c, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {i === 0 && <g><circle cx={50} cy={50} r={10} fill={c} /><circle cx={50} cy={50} r={26} {...p} /><circle cx={50} cy={50} r={42} {...p} opacity={0.5} /></g>}
      {i === 1 && <g><path d="M22 78 C22 40 50 22 80 22 C80 56 56 78 22 78 Z" {...p} /><path d="M22 78 L62 38" {...p} /></g>}
      {i === 2 && <g><path d="M62 18 A34 34 0 1 0 82 56 A26 26 0 0 1 62 18 Z" {...p} /><circle cx={78} cy={22} r={4} fill={c} /><circle cx={88} cy={38} r={3} fill={c} /></g>}
      {i === 3 && <g><circle cx={50} cy={30} r={14} {...p} /><path d="M24 82 V66 a26 26 0 0 1 52 0 V82" {...p} /><circle cx={78} cy={26} r={9} {...p} /><path d="M70 50 a14 14 0 0 1 22 10" {...p} /></g>}
      {i === 4 && <g><circle cx={50} cy={50} r={36} {...p} /><path d="M14 50 H86 M50 14 C34 30 34 70 50 86 C66 70 66 30 50 14" {...p} /></g>}
      {i === 5 && <g><path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42 Z" {...p} /><circle cx={78} cy={20} r={4} fill={c} /></g>}
      {i === 6 && <g><path d="M10 40 C25 20 40 20 50 40 S75 60 90 40" {...p} /><path d="M10 64 C25 44 40 44 50 64 S75 84 90 64" {...p} opacity={0.6} /></g>}
    </svg>
  );
};
const Avatar: React.FC<{ color: string; size?: number }> = ({ color, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><circle cx={22} cy={22} r={21} fill={color} /><circle cx={22} cy={17} r={7} fill="#fff" /><path d="M8 38 a14 14 0 0 1 28 0" fill="#fff" /></svg>
);
const Shield: React.FC<{ size?: number; color?: string; draw: number }> = ({ size = 420, color = TEAL, draw }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115"><path d="M50 4 L92 20 V58 C92 84 72 102 50 111 C28 102 8 84 8 58 V20 Z" fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeDasharray="330" strokeDashoffset={330 * (1 - draw)} /></svg>
);

/* ======================================================================
   Scenes. Every time comes from the voice (tw) or from lines.json (lineAt).
   ====================================================================== */

/* 0. The burn: a flame on the right jitters; an ice wave sweeps it away on "burn." */
const SceneBurn: React.FC = () => {
  const t = useT();
  const burn = tw("burn");
  const sweep = ez(t, burn - 0.05, burn + 0.55, Easing.inOut(Easing.cubic));
  const gone = sp(t, burn + 0.32, SNAP);
  const out = 3.25;
  const e = exitP(t, out, 0.3);
  return (
    <Scene from={0} to={out + 0.01}>
      <Kick at={0.25} out={out} style={{ left: L, top: 112 }}>TheraBreath × The Flavor Factory</Kick>
      <Say text="TheraBreath took away *the burn.*" after={lineAt("burn")} out={out} size={92} style={{ left: L, top: 400, width: 900 }} />
      <div style={{ position: "absolute", left: 1180, top: 330, transform: `scale(${sp(t, 0.35, BOUNCE) * (1 - Math.min(1, gone)) * (1 - e)})`, transformOrigin: "50% 100%" }}>
        <Flame t={t} size={420} />
      </div>
      {sweep > 0 && sweep < 1 && (
        <div style={{ position: "absolute", left: -600 + sweep * 2400, top: 250, opacity: 0.95 }}>
          <Wave width={700} color={ICE} amp={26} h={560} period={260} phase={t * 6} />
        </div>
      )}
      {gone > 0 && <Pop at={burn + 0.32} out={out} x={1330} y={480} rot={120}><Snowflake size={130} /></Pop>}
    </Scene>
  );
};

/* 1. The want: a crowd pops in on "more people"; every one of them gets a little teal bubble on "want it." */
const SceneWant: React.FC = () => {
  const t = useT();
  const from = 3.25, out = 7.0;
  const people = tw("people"), want = tw("want");
  const cols = 6, rows = 3;
  return (
    <Scene from={from} to={out}>
      <Say text="Now, let’s give more people / a reason to *want it.*" after={lineAt("want")} out={out} size={78} style={{ left: L, top: 330, width: 820 }} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const at = people - 0.1 + (c + r) * 0.05 + rnd(i) * 0.05;
        const col = PALETTE[(i * 7) % 5];
        const w = sp(t, want + 0.1 + rnd(i, 3) * 0.6, SNAP);
        return (
          <Pop key={i} at={at} out={out - 0.1 + rnd(i, 2) * 0.1} x={1010 + c * 142} y={250 + r * 190} rot={-20 + rnd(i, 1) * 40} origin="50% 100%">
            <div style={{ position: "relative" }}>
              <Person color={col} size={86} />
              {w > 0 && (
                <div style={{ position: "absolute", left: 58, top: -40, transform: `scale(${w})`, transformOrigin: "0 100%", background: TEAL, color: "#fff", borderRadius: "16px 16px 16px 3px", padding: "6px 13px", ...sans(24, 800) }}>
                  <span style={{ color: "#fff" }}>!</span>
                </div>
              )}
            </div>
          </Pop>
        );
      })}
    </Scene>
  );
};

/* 2. The math: 100 houses. 65 take mouthwash, 14 take TheraBreath, 86 wave hello. */
const ORDER = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
const MW = new Set(ORDER.slice(0, 65));
const TB = new Set(ORDER.slice(0, 14));
const GX = 1200, GY = 240, CELL = 58;
const SceneMath: React.FC = () => {
  const t = useT();
  const from = 7.0, to = 21.7;
  const n65 = tw("sixty-five"), n14 = tw("fourteen"), n86 = tw("eighty-six"), hello = tw("hello"), fl = tw("flavor", 0);
  const helloHouse = ORDER[3];
  const hc = helloHouse % 10, hr = Math.floor(helloHouse / 10);
  const bx = GX + hc * CELL + 44, by = GY + hr * CELL - 10;
  const wipeAt = 20.7;
  const countsOut = fl - 0.15;
  return (
    <Scene from={from} to={to}>
      <Say text="Here’s the math." after={lineAt("math")} out={countsOut} size={72} style={{ left: L, top: 150 }} />
      {/* counters and their labels */}
      <Num at={n65} out={n14 - 0.05} to={65} x={L} y={300} color={TEAL} />
      <Num at={n14} out={n86 - 0.05} to={14} dur={0.6} x={L} y={300} color={TEAL} />
      <Num at={n86} out={countsOut} to={86} dur={0.8} x={L} y={300} color={CORAL} />
      <Slide at={n65 + 0.2} out={n14 - 0.05} x={L} y={560} dy={30}><div style={{ ...sans(38, 500), color: INK, width: 900 }}>of every 100 American homes<br />have mouthwash</div></Slide>
      <Slide at={n14 + 0.2} out={n86 - 0.05} x={L} y={560} dy={30}><div style={{ ...sans(38, 500), color: INK, width: 900 }}>have TheraBreath</div></Slide>
      <Slide at={n86 + 0.2} out={countsOut} x={L} y={560} dy={30}><div style={{ ...sans(38, 500), color: INK, width: 900 }}>haven’t been introduced yet</div></Slide>
      <Kick at={n65 + 0.6} out={countsOut} size={15} style={{ left: L, top: 960, letterSpacing: "0.12em" }}>Source: Church & Dwight Q2 2026 earnings call, July 31, 2026 · 86 = 100 minus 14</Kick>
      {/* the hello line replaces the counters */}
      <Say text="Flavor is how we say *hello.*" after={lineAt("hello")} out={to} size={84} style={{ left: L, top: 400, width: 900 }} />
      {/* the grid */}
      {Array.from({ length: 100 }, (_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const at = 7.25 + (c + r) * 0.045;
        const isMW = MW.has(i), isTB = TB.has(i);
        const wave = (c + r) / 18;
        const mw = ez(t, n65 + wave * 1.1, n65 + wave * 1.1 + 0.25);
        const tb = isTB ? sp(t, n14 + 0.05 + rnd(i, 5) * 0.5, SNAP) : 0;
        const wob = !isTB && t > n86 && t < n86 + 2.6 ? Math.sin((t - n86) * 14 + rnd(i) * 6) * 7 * Math.max(0, 1 - (t - n86) / 2.6) : 0;
        const fill = isTB && tb > 0 ? TEAL : isMW ? `rgba(191,233,242,${mw})` : "rgba(255,255,255,0)";
        const s = sp(t, at, POP);
        return (
          <div key={i} style={{ position: "absolute", left: GX + c * CELL, top: GY + r * CELL, transform: `scale(${Math.min(1.25, s) * (isTB ? 1 + 0.25 * Math.max(0, tb - 1) : 1)}) rotate(${wob}deg)`, transformOrigin: "50% 80%", opacity: Math.min(1, s * 3) }}>
            <House fill={fill} dot={isTB && tb > 0.4} size={50} stroke={isTB && tb > 0 ? TEAL : INK} />
          </div>
        );
      })}
      {/* question marks over a few of the 86 */}
      {[7, 23, 41, 58, 76, 92].map((k, j) => {
        const i = ORDER[99 - k];
        const c = i % 10, r = Math.floor(i / 10);
        return (
          <Pop key={k} at={n86 + 0.3 + j * 0.12} out={hello - 0.1} x={GX + c * CELL + 30} y={GY + r * CELL - 26} rot={-25} origin="20% 100%">
            <div style={{ background: CORAL, color: "#fff", borderRadius: "14px 14px 14px 3px", padding: "2px 12px", ...sans(30, 800) }}><span style={{ color: "#fff" }}>?</span></div>
          </Pop>
        );
      })}
      {/* hello */}
      <Pop at={hello} out={to} x={bx} y={by} rot={-30} origin="10% 100%">
        <div style={{ background: TEAL, color: "#fff", borderRadius: "22px 22px 22px 4px", padding: "10px 22px", ...sans(40, 800), boxShadow: "0 10px 30px rgba(11,27,43,.18)" }}><span style={{ color: "#fff" }}>Hello!</span></div>
      </Pop>
      {Array.from({ length: 46 }, (_, i) => {
        const a0 = hello + 0.04;
        if (t < a0) return null;
        const ang = rnd(i, 7) * Math.PI * 2, v = 260 + rnd(i, 8) * 520, dt = t - a0;
        const x = bx + 40 + Math.cos(ang) * v * dt * 0.9, y = by + 10 + Math.sin(ang) * v * dt * 0.7 + 520 * dt * dt;
        const o = Math.max(0, 1 - dt / 1.6);
        const sz = 10 + rnd(i, 9) * 14;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz * (rnd(i, 10) > 0.5 ? 1 : 0.55), borderRadius: rnd(i, 10) > 0.5 ? "50%" : 3, background: PALETTE[i % 6], opacity: o, transform: `rotate(${dt * 400 * (rnd(i, 11) - 0.5)}deg)` }} />;
      })}
      <WipeOut at={wipeAt} x={bx + 60} y={by + 30} color={TEAL} />
    </Scene>
  );
};

/* 3. Norco: a hop across the map, and a little flavor lab at the far end. */
const SceneNorco: React.FC = () => {
  const t = useT();
  const from = 20.9, to = 25.0;
  const july = tw("july"), norco = tw("norco"), make = tw("make");
  const x0 = 330, x1 = 1590, y = 640;
  const fly = ez(t, july + 0.1, norco + 0.05, Easing.inOut(Easing.cubic));
  const px = x0 + (x1 - x0) * fly, py = y - Math.sin(fly * Math.PI) * 260;
  const ang = Math.atan2(-Math.cos(fly * Math.PI) * 260 * Math.PI, x1 - x0) * (180 / Math.PI);
  const drop = ez(t, make - 0.05, make + 0.3, Easing.in(Easing.quad));
  const splash = sp(t, make + 0.3, SNAP);
  return (
    <Scene from={from} to={to} wipe={{ x: 1400, y: 520 }}>
      <Say text="In July, you came to Norco / and watched us make *flavor.*" after={lineAt("norco")} out={to} size={66} style={{ left: L, top: 130, width: 1100 }} />
      <Kick at={july} out={to} style={{ right: L, top: 136 }}>July 2026</Kick>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y - 520} ${x1} ${y}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="2 16" strokeLinecap="round" opacity={ez(t, from + 0.3, from + 0.8)} />
      </svg>
      <Pop at={from + 0.2} out={to} x={x0 - 32} y={y - 84} origin="50% 100%"><Pin color={GOLD} /></Pop>
      <Kick at={from + 0.4} out={to} style={{ left: x0 - 120, top: y + 16, width: 240, textAlign: "center" }}>New Jersey</Kick>
      <Pop at={from + 0.35} out={to} x={x1 - 32} y={y - 84} origin="50% 100%"><div style={{ transform: `translateY(${-18 * Math.max(0, sp(t, norco, BOUNCE) - 1) * 4}px)` }}><Pin color={TEAL} /></div></Pop>
      <Kick at={from + 0.55} out={to} style={{ left: x1 - 160, top: y + 16, width: 320, textAlign: "center" }}>Norco, California</Kick>
      {fly > 0 && fly < 1 && <div style={{ position: "absolute", left: px - 27, top: py - 27, transform: `rotate(${ang}deg)` }}><Plane /></div>}
      {/* the lab card */}
      <Pop at={norco + 0.15} out={to} x={1060} y={720} rot={4} origin="80% 0%">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, background: "#fff", border: `3px solid ${INK}`, borderRadius: 22, padding: "26px 34px 18px", boxShadow: "0 14px 40px rgba(11,27,43,.14)" }}>
          <Beaker color={GREEN} level={0.5} t={t} w={96} />
          <div style={{ position: "relative" }}>
            <Beaker color={ICE} level={0.35 + splash * 0.08} t={t + 2} w={110} />
            {drop > 0 && drop < 1 && <div style={{ position: "absolute", left: 47, top: -180 + drop * 230, width: 16, height: 22, borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", background: GOLD }} />}
            {splash > 0 && <div style={{ position: "absolute", left: 55 - splash * 40, top: 70 - splash * 14, width: splash * 80, height: splash * 28, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: Math.max(0, 1.4 - splash) }} />}
          </div>
          <Beaker color={GOLD} level={0.62} t={t + 4} w={96} />
        </div>
      </Pop>
      <Pop at={norco + 0.25} out={to} x={1118} y={470} rot={-10} origin="50% 100%">
        <svg width={120} height={260} viewBox="0 0 60 130" style={{ transform: `translateY(${t > make - 0.4 && t < make ? Math.sin((t - make + 0.4) * 16) * 4 : 0}px)` }}>
          <rect x={22} y={2} width={16} height={24} rx={6} fill={CORAL} stroke={INK} strokeWidth={2.5} />
          <rect x={25} y={26} width={10} height={86} rx={4} fill="#fff" stroke={INK} strokeWidth={2.5} />
          <path d="M26 112 L30 126 L34 112 Z" fill={INK} />
          <rect x={27} y={60 + drop * 40} width={6} height={50 - drop * 40} fill={GOLD} />
        </svg>
      </Pop>
    </Scene>
  );
};

/* 4. The ask: an envelope opens, the letter rises, and two highlighters find the two goals. */
const SceneAsk: React.FC = () => {
  const t = useT();
  const from = 25.0, to = 34.8;
  const ross = tw("ross"), more = tw("more", 1), loyal = tw("loyal"), attract = tw("attract"), franchise = tw("franchise");
  const open = ez(t, ross + 0.25, ross + 0.65, Easing.inOut(Easing.cubic));
  const rise = sp(t, more - 0.2, SOFT);
  const envGone = ez(t, more + 0.3, more + 0.8, Easing.in(Easing.cubic));
  const cardOut = 34.55;
  const ce = exitP(t, cardOut, 0.3);
  return (
    <Scene from={from} to={to}>
      <Say text="Then Ross asked for *more:*" after={lineAt("ross")} out={more + 0.15} size={64} style={{ left: L, top: 140 }} />
      {envGone < 1 && (
        <div style={{ position: "absolute", left: 700, top: 330 + (1 - sp(t, from + 0.05, SOFT)) * 600 + envGone * 700, opacity: 1 - envGone, perspective: 900 }}>
          <Envelope open={open} />
        </div>
      )}
      {rise > 0 && ce < 1 && (
        <div style={{ position: "absolute", left: 260, top: 250 + (1 - Math.min(1, rise)) * 520 + ce * 120, width: 1400, transform: `scale(${0.55 + 0.45 * Math.min(1, rise) - ce * 0.15})`, transformOrigin: "50% 100%", opacity: Math.min(1, rise * 3) * (1 - ce), background: "#fff", border: `3px solid ${INK}`, borderRadius: 24, padding: "54px 70px 46px", boxShadow: "0 24px 60px rgba(11,27,43,.16)" }}>
          <div style={{ ...mono(18), marginBottom: 28 }}>The ask · September 18, 2026</div>
          <div style={{ position: "relative", minHeight: 390 }}>
            <Say text="new flavor experiences that ^strengthen your appeal with loyal users,^ and ~attract new consumers~ to the franchise." after={lineAt("ask")} size={58} style={{ left: 0, top: 0, width: 1110 }} hiAt={[loyal + 0.1, attract + 0.1]} hiColors={["rgba(191,233,242,.95)", "rgba(244,184,96,.75)"]} />
          </div>
          <div style={{ ...mono(16), color: DIM, opacity: ez(t, franchise + 0.9, franchise + 1.3), letterSpacing: "0.12em" }}>Ross Conroy · Church & Dwight Oral Care R&D · Workshop invitation</div>
          <Pop at={loyal + 0.55} x={1160} y={10} rot={25}><svg width={110} height={110} viewBox="0 0 100 100"><path d="M50 88 C20 66 8 50 8 34 a20 20 0 0 1 42 -10 a20 20 0 0 1 42 10 C92 50 80 66 50 88 Z" fill={ICE} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><path d="M34 50 L46 62 L68 38" fill="none" stroke={TEAL} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg></Pop>
          <Pop at={attract + 0.55} x={1160} y={150} rot={-25}><svg width={110} height={110} viewBox="0 0 100 100"><circle cx={42} cy={34} r={16} fill={GOLD} stroke={INK} strokeWidth={3} /><path d="M12 90 V76 a30 30 0 0 1 60 0 V90 Z" fill={GOLD} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><circle cx={78} cy={26} r={17} fill={CORAL} stroke={INK} strokeWidth={3} /><path d="M78 17 V35 M69 26 H87" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></svg></Pop>
        </div>
      )}
    </Scene>
  );
};

/* 5. The day: a calendar flips to November 9, a two-hour gauge draws, splits into four chapters, and one Playbook drops in. */
const SceneDay: React.FC = () => {
  const t = useT();
  const from = 34.8, to = 41.0;
  const nov = tw("november"), two = tw("two"), four = tw("four"), one = tw("one"), pb = tw("playbook");
  const flip = sp(t, nov + 0.15, SNAP);
  const bookS = sp(t, one, BOUNCE);
  const wipeAt = 40.0;
  return (
    <Scene from={from} to={to}>
      <Say text="So: November ninth." after={lineAt("day")} out={wipeAt + 0.5} size={72} style={{ left: L, top: 120 }} />
      <Say text="Two hours. / Four chapters. / One Playbook." after={two - 0.02} out={wipeAt + 0.5} size={56} style={{ left: L, top: 760, width: 700 }} />
      {/* calendar */}
      <Pop at={from + 0.15} out={wipeAt + 0.5} x={L + 20} y={300} rot={-6} origin="50% 0%">
        <div style={{ width: 340, borderRadius: 22, border: `3px solid ${INK}`, overflow: "hidden", background: "#fff", boxShadow: "0 18px 44px rgba(11,27,43,.14)" }}>
          <div style={{ background: CORAL, padding: "16px 0", textAlign: "center", ...mono(22), color: "#fff", letterSpacing: "0.28em" }}>November</div>
          <div style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center", perspective: 700 }}>
            <div style={{ ...sans(190, 800), letterSpacing: "-0.06em", transform: `rotateX(${(1 - Math.min(1, flip)) * -95}deg)`, transformOrigin: "50% 0%", opacity: flip > 0 ? 1 : 0 }}>9</div>
          </div>
          <div style={{ borderTop: `2px solid ${LINE}`, padding: "14px 0", textAlign: "center", ...mono(15), letterSpacing: "0.14em" }}>Monday · 10:00 AM to noon</div>
        </div>
      </Pop>
      {/* gauge */}
      <div style={{ position: "absolute", left: 760, top: 300, opacity: ez(t, two - 0.1, two + 0.3) * (1 - exitP(t, wipeAt + 0.5, 0.3)) }}>
        <Gauge t={t} at={two} split={four} r={300} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...sans(64, 700), opacity: ez(t, two + 0.5, two + 0.8) }}>2 hours</div>
      </div>
      {/* the playbook */}
      {bookS > 0 && (
        <div style={{ position: "absolute", left: 1010, top: 690 - (1 - Math.min(1, bookS)) * 600, transform: `scale(${1 - exitP(t, wipeAt + 0.5, 0.3)}) rotate(${(1 - Math.min(1, bookS)) * 14}deg)`, transformOrigin: "50% 100%" }}>
          <Book w={120} color={INK}><div style={{ position: "absolute", left: 32, top: 22, right: 10, ...serif(17, 400), color: CREAM }}>The Flavor Playbook</div></Book>
        </div>
      )}
      <Kick at={pb + 0.3} out={wipeAt + 0.5} style={{ left: 1150, top: 760 }}>One Playbook, by noon</Kick>
      <WipeOut at={wipeAt} x={540} y={300} color={TEAL} />
    </Scene>
  );
};

/* A chapter header: mono kicker, then the chapter name in big serif. */
const Chapter: React.FC<{ n: string; name: string; at: number; nameAt: number; out: number }> = ({ n, name, at, nameAt, out }) => (
  <>
    <Kick at={at} out={out} size={22} style={{ left: L, top: 120 }}>Chapter {n}</Kick>
    <Say text={name} after={nameAt} out={out} size={120} weight={300} style={{ left: L, top: 160 }} />
  </>
);

/* 6. Signals: seven tiles, three checks. */
const SceneSignals: React.FC = () => {
  const t = useT();
  const from = 40.2, to = 45.1;
  const seven = tw("seven"), three = tw("three");
  const x0 = 222, size = 180, gap = 36;
  const picks = [1, 3, 5];
  return (
    <Scene from={from} to={to} wipe={{ x: 540, y: 300 }}>
      <Chapter n="one" name="Signals." at={tw("chapter")} nameAt={tw("signals")} out={to} />
      {Array.from({ length: 7 }, (_, i) => {
        const picked = picks.indexOf(i);
        const ck = picked >= 0 ? sp(t, three - 0.1 + picked * 0.2, SNAP) : 0;
        const dim = picked < 0 ? 1 - 0.5 * ez(t, three + 0.3, three + 0.7) : 1;
        return (
          <Pop key={i} at={seven + i * 0.07} out={to - 0.05} x={x0 + i * (size + gap)} y={470} rot={-12 + (i % 2) * 24} origin="50% 100%">
            <div style={{ width: size, height: size, borderRadius: 28, background: "#fff", border: `3px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: dim, boxShadow: "0 12px 30px rgba(11,27,43,.1)", position: "relative", transform: `translateY(${picked >= 0 ? -12 * Math.min(1, ck) : 0}px)` }}>
              <SignalIcon i={i} size={104} />
              <div style={{ position: "absolute", left: 14, top: 12, ...mono(15), color: DIM }}>0{i + 1}</div>
              {ck > 0 && <div style={{ position: "absolute", right: -22, top: -22, transform: `scale(${2 - Math.min(1, ck)}) rotate(${(1 - Math.min(1, ck)) * -30}deg)`, opacity: Math.min(1, ck * 2) }}><Check size={64} /></div>}
            </div>
          </Pop>
        );
      })}
      <Say text="Seven of them. You vote for *three.*" after={seven} out={to} size={56} style={{ left: L, top: 820 }} />
    </Scene>
  );
};

/* 7. Flavor School: a thermometer drops and frosts; a flavor dot drops into a bottle and a shield draws around it. */
const SceneSchool: React.FC = () => {
  const t = useT();
  const from = 45.1, to = 51.3;
  const cooling = tw("cooling"), survives = tw("survives"), formula = tw("formula");
  const lvl = interpolate(t, [cooling, cooling + 0.9], [0.78, 0.22], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cold = ez(t, cooling + 0.3, cooling + 0.9);
  const drop = ez(t, survives - 0.25, survives + 0.1, Easing.in(Easing.quad));
  const ring = sp(t, survives + 0.1, SNAP);
  const shield = ez(t, survives + 0.35, formula + 0.3, Easing.inOut(Easing.cubic));
  const wipeAt = 50.3;
  const mix = (a: string, b: string, p: number) => (p < 0.5 ? a : b);
  return (
    <Scene from={from} to={to}>
      <Kick at={tw("then", 1)} out={wipeAt + 0.5} size={22} style={{ left: L, top: 120 }}>Then</Kick>
      <Say text="Flavor School." after={tw("flavor", 3)} out={wipeAt + 0.5} size={120} style={{ left: L, top: 160 }} />
      {/* thermometer */}
      <Pop at={from + 0.3} out={wipeAt + 0.5} x={330} y={380} origin="50% 100%">
        <svg width={140} height={520} viewBox="0 0 70 260">
          <rect x={23} y={6} width={24} height={200} rx={12} fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={35} cy={226} r={28} fill={mix(CORAL, TEAL, cold)} stroke={INK} strokeWidth={3} />
          <rect x={29} y={16 + (1 - lvl) * 182} width={12} height={lvl * 182 + 10} rx={6} fill={mix(CORAL, TEAL, cold)} />
          <circle cx={35} cy={226} r={16} fill={mix(CORAL, TEAL, cold)} />
          {[40, 80, 120, 160].map((y) => <line key={y} x1={50} y1={y} x2={58} y2={y} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />)}
        </svg>
      </Pop>
      {[[220, 430, 60], [520, 520, 80], [240, 700, 50], [540, 760, 64], [430, 330, 44]].map(([x, y, s], i) => (
        <Pop key={i} at={cooling + 0.35 + i * 0.11} out={wipeAt + 0.5} x={x} y={y} rot={160}><div style={{ transform: `rotate(${(t - cooling) * 40 * (i % 2 ? 1 : -1)}deg)` }}><Snowflake size={s} color={i % 2 ? TEAL : ICE} /></div></Pop>
      ))}
      <Kick at={cooling} out={wipeAt + 0.5} size={20} color={INK} style={{ left: 250, top: 930 }}>How cooling works</Kick>
      {/* bottle */}
      <Pop at={from + 0.45} out={wipeAt + 0.5} x={1240} y={370} origin="50% 100%">
        <div style={{ position: "relative", width: 300, height: 560 }}>
          <svg width={300} height={560} viewBox="0 0 150 280">
            <rect x={56} y={4} width={38} height={30} rx={6} fill={TEAL} stroke={INK} strokeWidth={3} />
            <path d="M58 34 V60 C30 70 22 90 22 120 V254 a14 14 0 0 0 14 14 H114 a14 14 0 0 0 14 -14 V120 C128 90 120 70 92 60 V34 Z" fill="#fff" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <path d="M28 150 V254 a8 8 0 0 0 8 8 H114 a8 8 0 0 0 8 -8 V150 Z" fill={ICE} />
            {ring > 0 && <circle cx={75} cy={205} r={10 + Math.min(1.6, ring) * 34} fill="none" stroke={GOLD} strokeWidth={3} opacity={Math.max(0, 1.3 - ring * 0.8)} />}
            {ring > 0 && <circle cx={75} cy={205} r={12} fill={GOLD} />}
            {drop > 0 && drop < 1 && <ellipse cx={75} cy={-30 + drop * 232} rx={9} ry={12} fill={GOLD} />}
          </svg>
          <div style={{ position: "absolute", left: -60, top: -40 }}><Shield size={420} draw={shield} /></div>
        </div>
      </Pop>
      <Kick at={survives} out={wipeAt + 0.5} size={20} color={INK} style={{ left: 1150, top: 930 }}>How flavor survives inside your formula</Kick>
      <WipeOut at={wipeAt} x={1390} y={640} color={GREEN} />
    </Scene>
  );
};

/* 8. Territories: four platform blooms, no names. */
const BLOOMS: string[][] = [[GREEN, "#8FC9A6", "#C9E6D3"], [GOLD, "#F7CF8E", "#FBE6BF"], [ICE, "#DCF3F8", "#FFFFFF"], [CORAL, PINK, "#F4A6B5"]];
const SceneTerritories: React.FC = () => {
  const t = useT();
  const from = 50.5, to = 55.3;
  const four = tw("four", 1), blind = tw("blind");
  return (
    <Scene from={from} to={to} wipe={{ x: 1390, y: 640 }}>
      <Chapter n="two" name="Territories." at={tw("chapter", 1)} nameAt={tw("territories")} out={to} />
      {BLOOMS.map((cs, i) => {
        const cx = 420 + i * 360, cy = 600;
        const q = sp(t, blind + 0.05 + i * 0.08, SNAP);
        return (
          <Pop key={i} at={four + i * 0.1} out={to - 0.05} x={cx - 130} y={cy - 130} rot={30}>
            <div style={{ position: "relative", width: 260, height: 260 }}>
              {cs.map((c, k) => {
                const a = t * 0.7 + i + (k * Math.PI * 2) / 3;
                return <div key={k} style={{ position: "absolute", left: 130 + Math.cos(a) * 44 - 82, top: 130 + Math.sin(a) * 44 - 82, width: 164, height: 164, borderRadius: "50%", background: c, border: `3px solid ${INK}`, mixBlendMode: "normal" }} />;
              })}
              {q > 0 && <div style={{ position: "absolute", left: 96, top: 96, width: 68, height: 68, borderRadius: "50%", background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...sans(40, 800), transform: `scale(${q})` }}><span style={{ color: "#fff" }}>?</span></div>}
            </div>
            <div style={{ ...mono(18), textAlign: "center", marginTop: 26 }}>Platform {i + 1}</div>
          </Pop>
        );
      })}
      <Say text="Four platforms, and a *blind* tasting." after={four} out={to} size={56} style={{ left: L, top: 880 }} />
    </Scene>
  );
};

/* 9. Four cups, four letters, no names. */
const SceneCups: React.FC = () => {
  const t = useT();
  const from = 55.3, to = 59.9;
  const cups = tw("cups"), letters = tw("letters"), names = tw("names"), tasted = tw("tasted");
  const wipeAt = 58.9;
  return (
    <Scene from={from} to={to}>
      {["A", "B", "C", "D"].map((ch, i) => {
        const cx = 420 + i * 360;
        const tag = sp(t, names + 0.05 + i * 0.07, SNAP);
        const wob = t > tasted && t < tasted + 0.8 ? Math.sin((t - tasted - i * 0.08) * 22) * 6 * Math.max(0, 1 - (t - tasted) / 0.8) : 0;
        return (
          <React.Fragment key={ch}>
            <Slide at={cups - 0.2 + i * 0.08} out={wipeAt + 0.6} x={cx - 125} y={420} dy={420} cfg={POP}>
              <div style={{ transform: `rotate(${wob}deg)`, transformOrigin: "50% 100%" }}><Cup t={t} size={250} letter={ch} letterAt={letters - 0.05 + i * 0.1} /></div>
            </Slide>
            {tag > 0 && (
              <div style={{ position: "absolute", left: cx - 120, top: 322, width: 240, transform: `scale(${tag}) rotate(${(1 - Math.min(1, tag)) * 10}deg)`, transformOrigin: "50% 100%", opacity: 1 - exitP(t, wipeAt + 0.6, 0.3) }}>
                <div style={{ background: "#fff", border: `3px solid ${INK}`, borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width={22} height={26} viewBox="0 0 22 26"><rect x={2} y={11} width={18} height={13} rx={3} fill={INK} /><path d="M6 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke={INK} strokeWidth={3} /></svg>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: `repeating-linear-gradient(90deg, ${LINE} 0 10px, transparent 10px 16px)` }} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      <Say text="Four cups, four letters, *no names* until you’ve tasted." after={lineAt("cups")} out={wipeAt + 0.6} size={56} style={{ left: L, top: 880, width: 1500 }} />
      <Kick at={from + 0.2} out={wipeAt + 0.6} style={{ left: L, top: 120 }}>The blind tasting</Kick>
      <WipeOut at={wipeAt} x={960} y={560} color={GOLD} />
    </Scene>
  );
};

/* 10. Concepts: build, tune on The Bench, pitch, vote. */
const Panel: React.FC<{ at: number; out: number; i: number; title: string; children: React.ReactNode }> = ({ at, out, i, title, children }) => (
  <Pop at={at} out={out} x={150 + i * 420} y={440} rot={-6 + (i % 2) * 12} origin="50% 100%">
    <div style={{ width: 370, height: 330, background: "#fff", border: `3px solid ${INK}`, borderRadius: 26, position: "relative", overflow: "hidden", boxShadow: "0 14px 36px rgba(11,27,43,.1)" }}>
      {children}
      <div style={{ position: "absolute", left: 22, bottom: 16, ...mono(16), color: INK }}>{title}</div>
    </div>
  </Pop>
);
const SceneConcepts: React.FC = () => {
  const t = useT();
  const from = 59.1, to = 65.1;
  const two = tw("two", 2), tune = tw("tune"), pitch = tw("pitch"), vote = tw("vote", 1);
  const blocks = [GREEN, GOLD, CORAL];
  return (
    <Scene from={from} to={to} wipe={{ x: 960, y: 560 }}>
      <Chapter n="three" name="Concepts." at={tw("chapter", 2)} nameAt={tw("concepts")} out={to} />
      <Panel at={two} out={to - 0.05} i={0} title="Two teams build">
        {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 24 + k * 34, top: 120 + (k % 2) * 30 }}><Person color={TEAL} size={44} /></div>)}
        {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", right: 24 + k * 34, top: 120 + (k % 2) * 30 }}><Person color={GOLD} size={44} /></div>)}
        {blocks.map((c, k) => { const s = sp(t, two + 0.4 + k * 0.18, BOUNCE); return <div key={k} style={{ position: "absolute", left: 150, top: 230 - k * 50 - (1 - Math.min(1, s)) * 240, width: 70, height: 44, borderRadius: 8, background: c, border: `3px solid ${INK}`, opacity: s > 0 ? 1 : 0 }} />; })}
      </Panel>
      <Panel at={tune} out={to - 0.05} i={1} title="Tune on The Bench">
        {[0.2, 0.7, 0.45].map((target, k) => { const s = sp(t, tune + 0.3 + k * 0.15, SOFT); const p = 0.5 + (target - 0.5) * Math.min(1.2, s); return (
          <div key={k} style={{ position: "absolute", left: 30, top: 60 + k * 58, width: 310 }}>
            <div style={{ height: 8, borderRadius: 4, background: LINE }} /><div style={{ position: "absolute", left: 0, top: 0, height: 8, borderRadius: 4, width: `${p * 100}%`, background: [TEAL, GOLD, CORAL][k] }} />
            <div style={{ position: "absolute", left: `calc(${p * 100}% - 16px)`, top: -12, width: 32, height: 32, borderRadius: "50%", background: "#fff", border: `3px solid ${INK}` }} />
          </div>
        ); })}
        <svg style={{ position: "absolute", left: 230, top: 215 }} width={100} height={100} viewBox="0 0 100 100"><circle cx={50} cy={50} r={40} fill="#fff" stroke={INK} strokeWidth={3} /><line x1={50} y1={50} x2={50} y2={16} stroke={CORAL} strokeWidth={6} strokeLinecap="round" transform={`rotate(${-120 + 200 * Math.min(1.1, sp(t, tune + 0.5, SOFT))} 50 50)`} /><circle cx={50} cy={50} r={6} fill={INK} /></svg>
      </Panel>
      <Panel at={pitch} out={to - 0.05} i={2} title="Pitch">
        <div style={{ position: "absolute", left: 40, top: 56, width: 290, height: 190, background: ICE, borderRadius: "26px 26px 26px 6px", border: `3px solid ${INK}` }}>
          {[0.5, 0.85, 0.65].map((h, k) => <div key={k} style={{ position: "absolute", left: 50 + k * 70, bottom: 30, width: 40, height: 120 * h * Math.min(1, sp(t, pitch + 0.25 + k * 0.12, POP)), borderRadius: 8, background: [TEAL, GOLD, CORAL][k], border: `3px solid ${INK}` }} />)}
        </div>
      </Panel>
      <Panel at={vote} out={to - 0.05} i={3} title="Vote">
        {[0, 1].map((j) => { const fill = ez(t, vote + 0.3, vote + 1.1); const h = (j === 0 ? 0.72 : 0.42) * fill; return (
          <div key={j} style={{ position: "absolute", left: 60 + j * 150, top: 70, width: 110, height: 190, border: `3px solid ${INK}`, borderTop: `3px dashed ${INK}`, borderRadius: "10px 10px 22px 22px", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${h * 100}%`, background: j === 0 ? TEAL : GOLD }} />
          </div>
        ); })}
        {Array.from({ length: 10 }, (_, k) => { const a0 = vote + 0.2 + k * 0.08; if (t < a0 || t > a0 + 0.5) return null; const p = (t - a0) / 0.5; const j = k % 3 === 2 ? 1 : 0; return <div key={k} style={{ position: "absolute", left: 100 + j * 150 + (rnd(k) - 0.5) * 60, top: 20 + p * p * 160, width: 18, height: 18, borderRadius: "50%", background: j === 0 ? TEAL : GOLD, border: `2px solid ${INK}` }} />; })}
        <Pop at={vote + 1.0} x={125} y={30} rot={-30}><Check size={56} /></Pop>
      </Panel>
      <Say text="Two teams build, tune on The Bench, pitch, and *vote.*" after={two} out={to} size={52} style={{ left: L, top: 880, width: 1500 }} />
    </Scene>
  );
};

/* 11. Pipeline: three lanes fill with cards, then owners and dates. */
const SceneLanes: React.FC = () => {
  const t = useT();
  const from = 65.1, to = 71.4;
  const lanes = [{ name: "Now", color: TEAL, at: tw("now", 1), cards: 3 }, { name: "Next", color: GOLD, at: tw("next"), cards: 2 }, { name: "Later", color: CORAL, at: tw("later"), cards: 2 }];
  const owners = tw("owners"), dates = tw("dates");
  const wipeAt = 70.4;
  const out = wipeAt + 0.5;
  return (
    <Scene from={from} to={to}>
      <Chapter n="four" name="Pipeline." at={tw("chapter", 3)} nameAt={tw("pipeline")} out={out} />
      {lanes.map((ln, i) => (
        <React.Fragment key={ln.name}>
          <Slide at={ln.at} out={out} x={760 + i * 380} y={330} dy={-60} cfg={POP}>
            <div style={{ width: 340, padding: "12px 0", borderRadius: 999, background: ln.color, textAlign: "center", ...sans(30, 800), color: "#fff", border: `3px solid ${INK}` }}>{ln.name}</div>
          </Slide>
          {Array.from({ length: ln.cards }, (_, k) => {
            const ow = sp(t, owners + 0.05 + (i * 3 + k) * 0.06, SNAP), dt = sp(t, dates + 0.05 + (i * 3 + k) * 0.06, SNAP);
            return (
              <Slide key={k} at={ln.at + 0.15 + k * 0.1} out={out} x={760 + i * 380} y={420 + k * 130} dy={-200} cfg={BOUNCE}>
                <div style={{ width: 340, height: 104, background: "#fff", border: `3px solid ${INK}`, borderRadius: 18, position: "relative", boxShadow: "0 10px 26px rgba(11,27,43,.08)" }}>
                  <div style={{ position: "absolute", left: 22, top: 24, width: 170, height: 14, borderRadius: 7, background: LINE }} />
                  <div style={{ position: "absolute", left: 22, top: 50, width: 110, height: 14, borderRadius: 7, background: LINE }} />
                  {ow > 0 && <div style={{ position: "absolute", right: 70, top: 28, transform: `scale(${ow})` }}><Avatar color={[GREEN, PINK, TEAL, GOLD, CORAL][(i * 3 + k) % 5]} size={48} /></div>}
                  {dt > 0 && <div style={{ position: "absolute", right: 14, top: 30, transform: `scale(${dt})`, transformOrigin: "100% 50%" }}><svg width={44} height={44} viewBox="0 0 44 44"><rect x={4} y={8} width={36} height={32} rx={6} fill={ICE} stroke={INK} strokeWidth={3} /><line x1={4} y1={18} x2={40} y2={18} stroke={INK} strokeWidth={3} /><line x1={14} y1={4} x2={14} y2={12} stroke={INK} strokeWidth={3} strokeLinecap="round" /><line x1={30} y1={4} x2={30} y2={12} stroke={INK} strokeWidth={3} strokeLinecap="round" /><line x1={12} y1={30} x2={32} y2={30} stroke={INK} strokeWidth={3} strokeLinecap="round" /></svg></div>}
                </div>
              </Slide>
            );
          })}
        </React.Fragment>
      ))}
      <Say text="Now, next, later. / With *owners and dates.*" after={tw("now", 1)} out={out} size={56} style={{ left: L, top: 420, width: 560 }} />
      <WipeOut at={wipeAt} x={930} y={360} color={INK} />
    </Scene>
  );
};

/* 12. By noon: the clock strikes twelve, pages fly in and become the Playbook, two names get signed. */
const SceneNoon: React.FC = () => {
  const t = useT();
  const from = 70.6, to = 75.7;
  const noon = tw("noon"), pbk = tw("playbook", 1), names = tw("names", 1);
  const pages = sp(t, pbk - 0.1, SOFT);
  const snap = sp(t, pbk + 0.55, SNAP);
  const out = 75.55;
  return (
    <Scene from={from} to={to} wipe={{ x: 930, y: 360 }}>
      <Say text="And by noon, / a Flavor Playbook, / with *your names* on the cover." after={lineAt("noon")} out={out} size={64} style={{ left: L, top: 150, width: 860 }} />
      <Pop at={from + 0.1} out={pbk + 0.6} x={1240} y={200} origin="50% 50%"><Clock t={t} at={noon - 0.15} from={11.85} to={12} dur={0.55} r={170} glow /></Pop>
      {/* pages */}
      {Array.from({ length: 6 }, (_, i) => {
        if (pages <= 0) return null;
        const sx = [-300, 2100, -200, 2200, 900, 1000][i], sy = [-200, -300, 1200, 1100, -300, 1300][i];
        const tx = 1110 + (rnd(i) - 0.5) * 30, ty = 420 + (rnd(i, 1) - 0.5) * 30;
        const p = Math.min(1, pages);
        const rot = (1 - Math.min(1, snap)) * (rnd(i, 2) - 0.5) * 40;
        return <div key={i} style={{ position: "absolute", left: sx + (tx - sx) * p, top: sy + (ty - sy) * p, width: 300, height: 396, borderRadius: 10, background: "#fff", border: `2.5px solid ${INK}`, transform: `rotate(${rot}deg)`, opacity: snap > 0.9 ? 0 : 1 }}>
          {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", left: 36, top: 60 + k * 40, width: 200 - k * 30, height: 12, borderRadius: 6, background: LINE }} />)}
        </div>;
      })}
      {snap > 0 && (
        <div style={{ position: "absolute", left: 1110, top: 420, transform: `scale(${Math.min(1.08, snap)}) scale(${1 - exitP(t, out, 0.3)})`, transformOrigin: "50% 50%" }}>
          <Book w={300} color={INK}>
            <div style={{ position: "absolute", left: 44, top: 34, ...mono(12), color: "rgba(251,250,247,.7)" }}>The Future of Freshness</div>
            <div style={{ position: "absolute", left: 44, top: 64, right: 24, ...serif(40, 400), color: CREAM }}>The Flavor Playbook</div>
            <div style={{ position: "absolute", left: 44, top: 196, ...mono(12), color: "rgba(251,250,247,.7)" }}>Co-authors</div>
            {[0, 1, 2, 3].map((k) => {
              const s = sp(t, names + k * 0.12, SNAP);
              const sig = k < 2 ? ez(t, names + 0.5 + k * 0.5, names + 1.0 + k * 0.5, Easing.inOut(Easing.cubic)) : 0;
              return (
                <div key={k} style={{ position: "absolute", left: 44, top: 232 + k * 36, width: 210 * Math.min(1, s), height: 2, background: "rgba(251,250,247,.5)" }}>
                  {sig > 0 && <svg style={{ position: "absolute", left: 4, top: -22 }} width={180} height={28} viewBox="0 0 180 28"><path d="M2 20 C14 2 22 2 30 18 C38 30 44 6 56 10 C70 16 74 24 90 12 C104 2 112 22 130 14 C146 8 156 20 176 10" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" strokeDasharray="260" strokeDashoffset={260 * (1 - sig)} /></svg>}
                </div>
              );
            })}
          </Book>
        </div>
      )}
    </Scene>
  );
};

/* 13. The title, a confetti of flavor, and the end card. */
const SceneTitle: React.FC = () => {
  const t = useT();
  const from = 75.6, to = 87;
  const title = tw("future");
  const end = 79.6;
  const outA = ez(t, 85.6, 87, Easing.in(Easing.quad));
  return (
    <Scene from={from} to={to}>
      {Array.from({ length: 70 }, (_, i) => {
        const a0 = title - 0.3 + rnd(i, 3) * 1.6;
        if (t < a0) return null;
        const dt = t - a0;
        const x = 60 + rnd(i) * 1800 + Math.sin(dt * 3 + i) * 40, y = -40 + dt * (220 + rnd(i, 1) * 260);
        if (y > 1140) return null;
        const sz = 12 + rnd(i, 2) * 18;
        const o = Math.max(0, 1 - ez(t, end + 0.2, end + 1.2));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: rnd(i, 4) > 0.5 ? sz : sz * 0.5, borderRadius: rnd(i, 4) > 0.5 ? "50%" : 3, background: PALETTE[i % 6], transform: `rotate(${dt * 300 * (rnd(i, 5) - 0.5)}deg)`, opacity: o }} />;
      })}
      <Say text="The Future of *Freshness.*" after={lineAt("title")} size={150} align="center" style={{ left: 0, right: 0, top: 350, transform: `translateY(${-ez(t, end, end + 0.8) * 70}px)` }} />
      <Say text="*Let’s build it together.*" after={lineAt("together")} size={58} align="center" style={{ left: 0, right: 0, top: 560, transform: `translateY(${-ez(t, end, end + 0.8) * 70}px)` }} />
      <Slide at={end} x={0} y={740} dy={40} style={{ right: 0, textAlign: "center" }}>
        <div style={{ ...mono(19), color: DIM, letterSpacing: "0.16em" }}>Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET · Princeton, New Jersey</div>
      </Slide>
      <Slide at={end + 0.15} x={0} y={806} dy={60} style={{ right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, background: "#fff", padding: "16px 36px", borderRadius: 16, border: `3px solid ${INK}`, boxShadow: "0 16px 40px rgba(11,27,43,.12)" }}>
          <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 52 }} />
          <span style={{ font: `300 30px ${SANS}`, color: "rgba(11,27,43,.45)" }}>×</span>
          <Img src={staticFile("img/tff-logo.png")} style={{ height: 50 }} />
        </div>
      </Slide>
      <AbsoluteFill style={{ background: BG, opacity: outA }} />
    </Scene>
  );
};

export const FutureOfFreshnessV4: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: SANS, color: INK }}>
      <SceneBurn />
      <SceneWant />
      <SceneMath />
      <SceneNorco />
      <SceneAsk />
      <SceneDay />
      <SceneSignals />
      <SceneSchool />
      <SceneTerritories />
      <SceneCups />
      <SceneConcepts />
      <SceneLanes />
      <SceneNoon />
      <SceneTitle />
    </AbsoluteFill>
  );
};

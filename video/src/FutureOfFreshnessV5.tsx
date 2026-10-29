import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import takeBrief from "../public/fof5/take_brief.json";
import takeSite from "../public/fof5/take_site.json";

/* The Future of Freshness, V5: the pre-brief intro (about 80 seconds).
   V4's drawn world and footage windows, rebuilt around what an attendee needs before November 9: why we're meeting (the
   household gap, July in Norco, Ross's goal in his words), what the morning is (Monday, 10 to noon, the Darwin room, his
   four objectives, a working session), what they'll do (pick three trends, taste four blind samples in their own bases,
   score on their phone), what we'll leave with (up to three directions, each with an owner and a next sample, written up
   as The Flavor Playbook), and what to do now (the four quick questions, and bring a phone). Two endings from one take:
   `brief` points at the questions on the pre-brief page, `site` points at the pre-brief itself.
   Every time comes from the voice: scripts/fof5_layout.py turns the take and its transcript into public/fof5/take_*.json,
   which this file, the mix (scripts/fof5_mix.py) and the captions all read. Blind: no sample names or ingredients. */

const FPS = 30;
const f = (t: number) => Math.round(t * FPS);
type Ending = "brief" | "site";
type Take = { ending: string; duration: number; lines: { id: string; src0: number; src1: number; at: number; end: number }[]; words: { k: string; text: string; t0: number; t1: number; line: string }[] };
const TAKES: Record<Ending, Take> = { brief: takeBrief as Take, site: takeSite as Take };
export const fof5Frames = (ending: Ending) => f(TAKES[ending].duration);
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
const DIM = "rgba(11,27,43,.68)";
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
  const handle = delayRender("fof5 fonts");
  const faces = [
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Geist Mono", `url(${staticFile("fonts/GeistMono-Variable.woff2")})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle)).catch(() => continueRender(handle));
};

/* ---------- Timing: the voice, word by word, in film seconds ----------
   The take for this render is set once per frame by the root, before any scene renders (one composition per render). */
let TK: Take = TAKES.brief;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const lineAt = (id: string) => { const ln = TK.lines.find((l) => l.id === id); if (!ln) throw new Error("no line " + id); return ln.at; };
const lineEnd = (id: string) => { const ln = TK.lines.find((l) => l.id === id); if (!ln) throw new Error("no line " + id); return ln.end; };
/* tw("word", after): film time of the first time the voice says it at or after `after` (seconds). */
const tw = (q: string, after = 0) => {
  const x = TK.words.find((w) => w.k === norm(q) && w.t0 >= after - 0.05);
  if (!x) throw new Error("the voice never says " + q + " after " + after);
  return x.t0;
};
/* Word times for a sentence on screen: the first token is matched at or after `after`, the rest follow in order. */
const wordTimes = (keys: string[], after: number, stagger = 0.12) => {
  const W = TK.words;
  const out: number[] = [];
  let i = W.findIndex((x) => x.t0 >= after - 0.05 && x.k === keys[0]);
  let last = after;
  for (const n of keys) {
    if (!n) { out.push(last); continue; }
    if (i >= 0 && i < W.length && W[i].k === n) { last = W[i].t0; i++; }
    else { const j = W.findIndex((x, k) => k > i && k < i + 4 && x.k === n); if (j >= 0) { last = W[j].t0; i = j + 1; } else last = last + stagger; }
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

const Pop: React.FC<{ at: number; out?: number; x: number; y: number; rot?: number; cfg?: Cfg; origin?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, out, x, y, rot = 0, cfg = POP, origin = "50% 50%", style, children }) => {
  const t = useT();
  if (t < at) return null;
  const e = exitP(t, out);
  if (e >= 1) return null;
  const s = sp(t, at, cfg) * (1 - e);
  return <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${(1 - Math.min(1, s)) * rot}deg)`, transformOrigin: origin, opacity: Math.min(1, s * 4), ...style }}>{children}</div>;
};
const Slide: React.FC<{ at: number; out?: number; x: number; y: number; dx?: number; dy?: number; cfg?: Cfg; style?: React.CSSProperties; children: React.ReactNode }> = ({ at, out, x, y, dx = 0, dy = 60, cfg = SOFT, style, children }) => {
  const t = useT();
  if (t < at) return null;
  const e = exitP(t, out, 0.3);
  if (e >= 1) return null;
  const s = sp(t, at, cfg);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(${dx * (1 - s) - dx * 0.6 * e}px, ${dy * (1 - s) - dy * 0.8 * e}px)`, opacity: Math.min(1, s * 2.5) * (1 - e), ...style }}>{children}</div>;
};

/* ---------- Type ---------- */
const serif = (size: number, weight = 300): React.CSSProperties => ({ font: `${weight} ${size}px/1.08 ${SERIF}`, fontVariationSettings: '"opsz" 72', letterSpacing: "-0.025em", color: INK });
const sans = (size: number, weight = 500): React.CSSProperties => ({ font: `${weight} ${size}px/1.15 ${SANS}`, letterSpacing: "-0.02em", color: INK });
const mono = (size: number): React.CSSProperties => ({ font: `500 ${size}px/1.2 ${MONO}`, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM });

/* Say: a sentence whose words rise into place as the voice says them. *word* sets italic in the accent color; ^group^
   and ~group~ mark phrases a highlighter sweeps under at hiAt[0] and hiAt[1]; "/" breaks the line; "9|ninth" shows 9
   where the voice says "ninth". */
type Tok = { w: string; k: string; it: boolean; hi: number; br: boolean };
const tokenize = (text: string): Tok[] => {
  let it = false, hi = 0;
  return text.split(" ").map((raw) => {
    if (raw === "/") return { w: "", k: "", it, hi, br: true };
    const [shown, said] = raw.split("|");
    let w = shown;
    if (w.startsWith("*")) { it = true; w = w.slice(1); }
    if (w.startsWith("^")) { hi = 1; w = w.slice(1); }
    if (w.startsWith("~")) { hi = 2; w = w.slice(1); }
    const clean = w.replace(/[*^~]/g, "");
    const tok = { w: clean, k: norm(said ?? clean), it, hi, br: false };
    if (/\*[.,:;!?”]*$/.test(w)) it = false;
    if (/[\^~][.,:;!?”]*$/.test(w)) hi = 0;
    return tok;
  });
};
const Say: React.FC<{ text: string; after: number; out?: number; size?: number; weight?: number; style?: React.CSSProperties; align?: "left" | "center"; accent?: string; hiAt?: number[]; hiColors?: string[]; width?: number; color?: string; ghost?: number }> = ({ text, after, out, size = 64, weight = 300, style, align = "left", accent = TEAL, hiAt = [], hiColors = [ICE, GOLD], width, color, ghost = 0 }) => {
  const t = useT();
  if (t < after - 0.05 && !ghost) return null;
  const toks = tokenize(text);
  const times = wordTimes(toks.map((x) => x.k), after);
  const e = exitP(t, out, 0.3);
  if (e >= 1) return null;
  return (
    <div style={{ position: "absolute", ...serif(size, weight), ...(color ? { color } : {}), textAlign: align, width, opacity: 1 - e, transform: `translateY(${-e * 26}px)`, ...style }}>
      {toks.map((tk, i) => {
        if (tk.br) return <br key={i} />;
        const t0 = times[i];
        const s = sp(t, t0, SNAP);
        if (s <= 0) return <React.Fragment key={i}><span style={{ opacity: ghost }}>{tk.w}</span>{" "}</React.Fragment>;
        const hp = tk.hi ? ez(t, hiAt[tk.hi - 1] ?? 1e9, (hiAt[tk.hi - 1] ?? 1e9) + 0.55, Easing.inOut(Easing.cubic)) : 0;
        const inner: React.CSSProperties = {
          display: "inline-block", transform: `translateY(${ghost ? 0 : (1 - Math.min(1, s)) * 0.32}em)`, opacity: ghost + (1 - ghost) * Math.min(1, s * 3),
          fontStyle: tk.it ? "italic" : undefined, color: tk.it ? accent : undefined,
          backgroundImage: tk.hi ? `linear-gradient(${hiColors[tk.hi - 1]}, ${hiColors[tk.hi - 1]})` : undefined, backgroundRepeat: "no-repeat", backgroundSize: `${hp * 100}% 42%`, backgroundPosition: "0 78%", padding: tk.hi ? "0 0.06em" : undefined, margin: tk.hi ? "0 -0.06em" : undefined,
        };
        return <React.Fragment key={i}><span style={inner}>{tk.w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};
const Kick: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; size?: number; color?: string }> = ({ at, out, children, style, size = 22, color = DIM }) => {
  const t = useT();
  const a = ez(t, at, at + 0.5);
  const e = exitP(t, out, 0.25);
  if (a <= 0 || e >= 1) return null;
  return <div style={{ position: "absolute", ...mono(size), color, letterSpacing: `${0.16 + (1 - a) * 0.2}em`, opacity: a * (1 - e), whiteSpace: "nowrap", ...style }}>{children}</div>;
};
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

/* Wipes: a colored disc grows from (x, y) over the outgoing scene, and the next scene (opaque) opens through a circle
   from the same point a beat later, so the color reads as a ring passing through rather than a held frame. */
const WipeOut: React.FC<{ at: number; x: number; y: number; color: string }> = ({ at, x, y, color }) => {
  const t = useT();
  if (t < at || t > at + 1.0) return null;
  const r = interpolate(t, [at, at + 0.42], [0, 2300], { ...clamp, easing: Easing.in(Easing.quad) });
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: color }} />;
};
const wipeIn = (t: number, at: number, x: number, y: number): React.CSSProperties => {
  if (t > at + 0.7) return { background: BG };
  const r = interpolate(t, [at + 0.12, at + 0.62], [0, 2300], { ...clamp, easing: Easing.out(Easing.quad) });
  return { clipPath: `circle(${r}px at ${x}px ${y}px)`, background: BG };
};
const Scene: React.FC<{ from: number; to: number; wipe?: { x: number; y: number }; children: React.ReactNode }> = ({ from, to, wipe, children }) => {
  const t = useT();
  if (t < from || t >= to) return null;
  return <AbsoluteFill style={wipe ? wipeIn(t, from, wipe.x, wipe.y) : undefined}>{children}</AbsoluteFill>;
};

/* ---------- Glyphs ---------- */
const STROKE = 3;
const House: React.FC<{ fill: string; stroke?: string; dot?: boolean; size?: number }> = ({ fill, stroke = INK, dot, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M6 19 L20 7 L34 19 V34 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 Z" fill={fill} stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M3 20 L20 5 L37 20" fill="none" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    {dot && <circle cx={20} cy={26} r={4.2} fill="#fff" />}
  </svg>
);
const Person: React.FC<{ color: string; size?: number }> = ({ color, size = 64 }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 64 80"><circle cx={32} cy={20} r={14} fill={color} /><path d="M10 78 V60 a22 22 0 0 1 44 0 V78 Z" fill={color} /></svg>
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
      {letter && ls > 0 && <div style={{ position: "absolute", left: "50%", top: "58%", transform: `translate(-50%, -50%) scale(${2.2 - 1.2 * Math.min(1, ls)}) rotate(${(1 - Math.min(1, ls)) * -18}deg)`, opacity: Math.min(1, ls * 2), ...sans(size * 0.42, 800), color: INK }}>{letter}</div>}
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
/* An arc from 10:00 (left) to 12:00 (right) that draws, then splits into Ross's four objectives. */
const Gauge: React.FC<{ t: number; at: number; split: number; r?: number }> = ({ t, at, split, r = 280 }) => {
  const draw = ez(t, at, at + 0.9, Easing.inOut(Easing.cubic));
  const len = Math.PI * r;
  const cols = [TEAL, GREEN, GOLD, CORAL];
  return (
    <svg width={2 * r + 140} height={r + 140} viewBox={`${-r - 70} ${-r - 60} ${2 * r + 140} ${r + 140}`}>
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={LINE} strokeWidth={34} />
      <path d={`M${-r} 0 A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke={TEAL} strokeWidth={34} strokeDasharray={`${len * draw} ${len}`} opacity={t < split ? 1 : 0} />
      {cols.map((c, i) => {
        const s = sp(t, split + i * 0.16, SNAP);
        if (s <= 0) return null;
        const a0 = Math.PI * (1 - i / 4), a1 = Math.PI * (1 - (i + 1) / 4);
        const mid = (a0 + a1) / 2;
        const x0 = -Math.cos(a0 - Math.PI) * r, y0 = -Math.sin(a0) * r, x1 = -Math.cos(a1 - Math.PI) * r, y1 = -Math.sin(a1) * r;
        return (
          <g key={i} transform={`translate(${Math.cos(mid) * 6 * Math.min(1, s)} ${-Math.sin(mid) * 6 * Math.min(1, s)})`}>
            <path d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={c} strokeWidth={34 + 10 * Math.max(0, s - 1)} />
            <text x={Math.cos(mid) * (r + 58)} y={-Math.sin(mid) * (r + 58) + 9} textAnchor="middle" style={{ font: `600 26px ${MONO}`, letterSpacing: "0.08em", fill: INK, opacity: Math.min(1, s) }}>0{i + 1}</text>
          </g>
        );
      })}
      <text x={-r} y={52} textAnchor="middle" style={{ font: `500 24px ${MONO}`, letterSpacing: "0.1em", fill: DIM }}>10:00</text>
      <text x={r} y={52} textAnchor="middle" style={{ font: `500 24px ${MONO}`, letterSpacing: "0.1em", fill: DIM }}>12:00</text>
    </svg>
  );
};
const Clock: React.FC<{ t: number; at: number; from: number; to: number; dur?: number; r?: number; glow?: boolean }> = ({ t, at, from, to, dur = 0.6, r = 160, glow }) => {
  const h = interpolate(t, [at, at + dur], [from, to], { ...clamp, easing: Easing.inOut(Easing.cubic) });
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
/* The seven trends of the pre-brief and the morning (SIGNALS in final/src/lib/content.ts), one glyph each: milder
   mouthwash, warm spice, fruit growing up, botanicals, dessert, how it feels, dry mouth. */
const TRENDS = ["Milder", "Warm spice", "Grown-up fruit", "Botanicals", "Dessert", "How it feels", "Dry mouth"];
const SignalIcon: React.FC<{ i: number; size?: number }> = ({ i, size = 96 }) => {
  const c = [TEAL, CORAL, PINK, GREEN, GOLD, TEAL, CORAL][i];
  const p = { fill: "none", stroke: c, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {i === 0 && <g>{[0, 1, 2, 3].map((k) => <rect key={k} x={14 + k * 20} y={70 - k * 16} width={13} height={18 + k * 16} rx={4} fill={k === 0 ? c : "none"} stroke={c} strokeWidth={5} opacity={k === 0 ? 1 : 0.45} />)}</g>}
      {i === 1 && <g>{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <ellipse key={a} cx={50} cy={27} rx={8} ry={17} {...p} strokeWidth={5} transform={`rotate(${a} 50 50)`} />)}<circle cx={50} cy={50} r={5} fill={c} /></g>}
      {i === 2 && <g><path d="M50 32 C30 20 14 34 18 56 C22 78 38 90 50 84 C62 90 78 78 82 56 C86 34 70 20 50 32 Z" {...p} /><path d="M50 32 C50 22 54 14 60 10" {...p} /><path d="M54 22 C62 14 74 16 78 22 C70 28 60 28 54 22 Z" {...p} /></g>}
      {i === 3 && <g><path d="M22 78 C22 40 50 22 80 22 C80 56 56 78 22 78 Z" {...p} /><path d="M22 78 L62 38" {...p} /></g>}
      {i === 4 && <g><path d="M30 50 L50 92 L70 50" {...p} /><path d="M38 66 L58 58 M44 78 L62 68" {...p} opacity={0.6} /><path d="M26 50 C22 34 34 22 50 22 C66 22 78 34 74 50 Z" {...p} /><circle cx={50} cy={14} r={5} fill={c} /></g>}
      {i === 5 && <g><path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42 Z" {...p} /><circle cx={80} cy={20} r={4} fill={c} /><circle cx={20} cy={80} r={3} fill={c} /></g>}
      {i === 6 && <g><path d="M50 12 C38 32 24 46 24 62 a26 26 0 0 0 52 0 C76 46 62 32 50 12 Z" {...p} /><path d="M18 88 L82 22" {...p} /></g>}
    </svg>
  );
};
const Avatar: React.FC<{ color: string; size?: number }> = ({ color, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44"><circle cx={22} cy={22} r={21} fill={color} /><circle cx={22} cy={17} r={7} fill="#fff" /><path d="M8 38 a14 14 0 0 1 28 0" fill="#fff" /></svg>
);
const Lock: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = INK }) => (
  <svg width={size} height={size * 1.18} viewBox="0 0 22 26"><rect x={2} y={11} width={18} height={13} rx={3} fill={color} /><path d="M6 11 V8 a5 5 0 0 1 10 0 V11" fill="none" stroke={color} strokeWidth={3} /></svg>
);
/* A phone with one sample's score: five dots that fill as the thumb taps. */
const Phone: React.FC<{ t: number; tapAt: number; score?: number; w?: number; label?: string; join?: boolean }> = ({ t, tapAt, score = 4, w = 250, label = "Sample A", join }) => {
  const h = w * 2.02;
  if (join) return (
    <div style={{ position: "relative", width: w, height: h, background: INK, borderRadius: w * 0.16, padding: w * 0.05, boxShadow: "0 24px 60px rgba(11,27,43,.28)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", background: CREAM, borderRadius: w * 0.12, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: 12, width: 64, height: 16, marginLeft: -32, borderRadius: 8, background: INK }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 64, textAlign: "center", ...mono(14), color: DIM }}>On the day</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", ...sans(28, 700) }}>Scan to join</div>
        <div style={{ position: "absolute", left: "50%", top: 150, marginLeft: -70, width: 140, height: 140, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, opacity: ez(t, tapAt, tapAt + 0.4) }}>
          {Array.from({ length: 49 }, (_, k) => { const r = Math.floor(k / 7), c = k % 7; const finder = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2); return <div key={k} style={{ background: finder || rnd(k, 3) > 0.5 ? INK : "transparent", borderRadius: 2 }} />; })}
        </div>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 30, height: 54, borderRadius: 14, background: t > tapAt + 0.7 ? TEAL : LINE, display: "flex", alignItems: "center", justifyContent: "center", ...sans(22, 700) }}><span style={{ color: "#fff" }}>Joined</span></div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: w, height: h, background: INK, borderRadius: w * 0.16, padding: w * 0.05, boxShadow: "0 24px 60px rgba(11,27,43,.28)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", background: CREAM, borderRadius: w * 0.12, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: 12, width: 64, height: 16, marginLeft: -32, borderRadius: 8, background: INK }} />
        <div style={{ position: "absolute", left: 22, top: 62, ...mono(15), color: DIM }}>Blind tasting</div>
        <div style={{ position: "absolute", left: 22, top: 90, ...sans(34, 700) }}>{label}</div>
        <div style={{ position: "absolute", left: 22, right: 22, top: 170, display: "flex", justifyContent: "space-between" }}>
          {Array.from({ length: 5 }, (_, k) => {
            const on = k < score ? sp(t, tapAt + k * 0.11, SNAP) : 0;
            return <div key={k} style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${INK}`, background: on > 0 ? TEAL : "#fff", transform: `scale(${1 + 0.25 * Math.max(0, on - 1) * 4})` }} />;
          })}
        </div>
        <div style={{ position: "absolute", left: 22, right: 22, top: 216, display: "flex", justifyContent: "space-between", ...mono(13) }}><span>1</span><span>5</span></div>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 30, height: 54, borderRadius: 14, background: t > tapAt + 0.7 ? TEAL : LINE, display: "flex", alignItems: "center", justifyContent: "center", ...sans(22, 700), color: "#fff" }}><span style={{ color: "#fff" }}>Send</span></div>
      </div>
    </div>
  );
};

/* Clip: a window of real footage (the V2 and V3 generated shots), started at `at` so its own clock runs from there. */
const Clip: React.FC<{ at: number; dir?: "fof2" | "fof3"; name: string; start?: number; dur?: number; style?: React.CSSProperties }> = ({ at, dir = "fof2", name, start = 0, dur = 4, style }) => (
  <Sequence from={f(at)} durationInFrames={f(dur)} layout="none">
    <OffthreadVideo src={staticFile(`${dir}/clips/${name}.mp4`)} muted startFrom={f(start)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />
  </Sequence>
);
const Window: React.FC<{ at: number; out?: number; x: number; y: number; w: number; h: number; r?: number | string; rot?: number; tint?: string; origin?: string; children: React.ReactNode }> = ({ at, out, x, y, w, h, r = 26, rot = 0, tint, origin = "50% 50%", children }) => (
  <Pop at={at} out={out} x={x} y={y} rot={rot} origin={origin}>
    <div style={{ position: "relative", width: w, height: h, borderRadius: r, overflow: "hidden", border: `3px solid ${INK}`, background: INK, boxShadow: "0 16px 40px rgba(11,27,43,.16)" }}>
      {children}
      {tint && <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "screen" }} />}
    </div>
  </Pop>
);
const wavePath = (width: number, h: number, amp: number, period: number, phase: number) => {
  const pts: string[] = [];
  for (let x = 0; x <= width; x += 10) pts.push(`${x} ${(h / 2 + amp * Math.sin((x / period) * Math.PI * 2 + phase)).toFixed(1)}`);
  return `M${pts.join(" L")} L${width} ${h} L0 ${h} Z`;
};

/* ======================================================================
   Scenes. Every time comes from the voice (tw, lineAt, lineEnd).
   ====================================================================== */

/* 0. The burn: a flame jitters; an ice wave sweeps it away on "burn". */
const SceneBurn: React.FC = () => {
  const t = useT();
  const burn = tw("burn");
  const out = lineAt("want") + 0.05;
  const sweep = ez(t, burn - 0.05, burn + 0.55, Easing.inOut(Easing.cubic));
  const gone = sp(t, burn + 0.32, SNAP);
  const e = exitP(t, out, 0.3);
  return (
    <Scene from={0} to={out + 0.01}>
      <Kick at={0.2} out={out} style={{ left: L, top: 112 }}>TheraBreath × The Flavor Factory</Kick>
      <Say text="TheraBreath took *the burn* / out of mouthwash." after={lineAt("burn")} out={out} size={88} style={{ left: L, top: 380, width: 1000 }} />
      <div style={{ position: "absolute", left: 1220, top: 330, transform: `scale(${sp(t, 0.3, BOUNCE) * (1 - Math.min(1, gone)) * (1 - e)})`, transformOrigin: "50% 100%" }}><Flame t={t} size={400} /></div>
      {sweep > 0 && sweep < 1 && (
        <div style={{ position: "absolute", left: -600 + sweep * 2400, top: 250, width: 700, height: 560, clipPath: `path("${wavePath(700, 560, 26, 260, t * 6)}")` }}>
          <Clip at={burn - 0.05} name="iceburst" start={0.1} dur={0.7} />
          <div style={{ position: "absolute", inset: 0, background: ICE, opacity: 0.35, mixBlendMode: "screen" }} />
        </div>
      )}
      {gone > 0 && <Pop at={burn + 0.32} out={out} x={1320} y={440} rot={120}><div style={{ transform: `rotate(${(t - burn) * 18}deg)` }}><Snowflake size={200} /></div></Pop>}
      {gone > 0 && [[1250, 380, 0], [1560, 420, 1], [1290, 690, 2], [1580, 650, 3], [1440, 330, 4]].map(([x, y, k]) => {
        const a = burn + 0.45 + k * 0.09;
        const tw8 = 0.8 + 0.2 * Math.sin((t - a) * 7 + k);
        return <Pop key={k} at={a} out={out} x={x} y={y} rot={90}><div style={{ transform: `scale(${tw8})` }}><svg width={58} height={58} viewBox="0 0 100 100"><path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z" fill={k % 2 ? GOLD : TEAL} /></svg></div></Pop>;
      })}
    </Scene>
  );
};

/* 1. The want: a crowd pops in on "people"; on "want it" a heart pops over each one and floats up. */
const Heart: React.FC<{ color: string; size?: number }> = ({ color, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M50 88 C20 66 8 50 8 34 a20 20 0 0 1 42 -10 a20 20 0 0 1 42 10 C92 50 80 66 50 88 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></svg>
);
const SceneWant: React.FC = () => {
  const t = useT();
  const from = lineAt("want") - 0.1, out = lineAt("m65") - 0.15;
  const people = tw("people", from), want = tw("want", from);
  const cols = 6, rows = 3;
  return (
    <Scene from={from} to={out}>
      <Say text="The next job is giving / more people a reason / to *want it.*" after={lineAt("want")} out={out} size={78} style={{ left: L, top: 320, width: 860 }} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const at = people - 0.1 + (c + r) * 0.05 + rnd(i) * 0.05;
        const ha = want + 0.1 + rnd(i, 3) * 0.6;
        const w = sp(t, ha, SNAP);
        const rise = Math.max(0, t - ha);
        const bob = Math.sin(t * 3.2 + rnd(i, 7) * 6) * 4;
        return (
          <Pop key={i} at={at} out={out - 0.1 + rnd(i, 2) * 0.1} x={1010 + c * 142} y={250 + r * 190} rot={-20 + rnd(i, 1) * 40} origin="50% 100%">
            <div style={{ position: "relative", transform: `translateY(${w > 0 ? -6 * Math.sin(Math.min(1, rise / 0.3) * Math.PI) : bob * 0.4}px)` }}>
              <Person color={PALETTE[(i * 7) % 5]} size={86} />
              {w > 0 && <div style={{ position: "absolute", left: 40, top: -46 - rise * 34, transform: `scale(${w}) rotate(${Math.sin(rise * 4 + i) * 10}deg)`, transformOrigin: "50% 100%", opacity: Math.max(0, 1 - Math.max(0, rise - 1.1) * 1.5) }}><Heart color={[CORAL, PINK, GOLD, TEAL][i % 4]} size={42} /></div>}
            </div>
          </Pop>
        );
      })}
    </Scene>
  );
};

/* 2. The math: 100 houses. 65 buy mouthwash, 14 buy TheraBreath, 86 don't yet. */
const ORDER = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
const MW = new Set(ORDER.slice(0, 65));
const TB = new Set(ORDER.slice(0, 14));
const GX = 1200, GY = 240, CELL = 58;
const SceneMath: React.FC = () => {
  const t = useT();
  const from = lineAt("m65") - 0.3;
  const n65 = tw("sixtyfive", from), n14 = tw("fourteen", from), n86 = tw("eightysix", from);
  const wipeAt = lineAt("norco") - 0.6;
  const to = wipeAt + 0.5;
  const hh = ORDER[3];
  const bx = GX + (hh % 10) * CELL + 25, by = GY + Math.floor(hh / 10) * CELL + 25;
  return (
    <Scene from={from} to={to}>
      <Kick at={from} out={wipeAt + 0.4} style={{ left: L, top: 150 }}>Out of every 100 US households</Kick>
      <Num at={n65} out={n14 - 0.05} to={65} x={L} y={260} color={TEAL} />
      <Num at={n14} out={n86 - 0.05} to={14} dur={0.6} x={L} y={260} color={TEAL} />
      <Num at={n86} out={wipeAt + 0.4} to={86} dur={0.8} x={L} y={260} color={CORAL} />
      <Slide at={n65 + 0.2} out={n14 - 0.05} x={L} y={520} dy={30}><div style={{ ...sans(42, 500), width: 900 }}>buy mouthwash</div></Slide>
      <Slide at={n14 + 0.2} out={n86 - 0.05} x={L} y={520} dy={30}><div style={{ ...sans(42, 500), width: 900 }}>buy TheraBreath</div></Slide>
      <Slide at={n86 + 0.2} out={wipeAt + 0.4} x={L} y={520} dy={30}><div style={{ ...sans(42, 500), width: 900 }}>don’t buy it <span style={{ fontStyle: "italic", fontFamily: SERIF, fontWeight: 400, color: CORAL }}>yet</span></div></Slide>
      <Kick at={n65 + 0.6} out={wipeAt + 0.4} size={20} style={{ left: L, top: 940, letterSpacing: "0.1em" }}>Source: Church & Dwight Q2 2026 earnings call, July 31, 2026 · 86 = 100 minus 14</Kick>
      {Array.from({ length: 100 }, (_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const at = from + 0.05 + (c + r) * 0.04;
        const isMW = MW.has(i), isTB = TB.has(i);
        const wave = (c + r) / 18;
        const mw = ez(t, n65 + wave * 1.1, n65 + wave * 1.1 + 0.25);
        const tb = isTB ? sp(t, n14 + 0.05 + rnd(i, 5) * 0.5, SNAP) : 0;
        const wob = !isTB && t > n86 && t < n86 + 2.6 ? Math.sin((t - n86) * 14 + rnd(i) * 6) * 7 * Math.max(0, 1 - (t - n86) / 2.6) : 0;
        /* three clear states: empty, buys mouthwash (a mid blue that reads on the paper), buys TheraBreath (teal with a
           dot); on "eighty-six" every home but the 14 takes a coral outline, so 14 against 86 reads at a glance */
        const fill = isTB && tb > 0 ? TEAL : isMW ? `rgba(124,196,216,${mw})` : "#FBFAF7";
        const not = !isTB && t > n86 + wave * 0.5;
        const s = sp(t, at, POP);
        const pulse = i === hh && t > wipeAt - 0.4 ? 1 + 0.35 * Math.sin(Math.min(1, (t - wipeAt + 0.4) / 0.4) * Math.PI) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: GX + c * CELL, top: GY + r * CELL, transform: `scale(${Math.min(1.25, s) * pulse * (isTB ? 1 + 0.25 * Math.max(0, tb - 1) : 1)}) rotate(${wob}deg)`, transformOrigin: "50% 80%", opacity: Math.min(1, s * 3) }}>
            <House fill={fill} dot={isTB && tb > 0.4} size={50} stroke={isTB && tb > 0 ? TEAL : not ? CORAL : INK} />
          </div>
        );
      })}
      {[7, 23, 41, 58, 76, 92].map((k, j) => {
        const i = ORDER[99 - k];
        return (
          <Pop key={k} at={n86 + 0.3 + j * 0.12} out={wipeAt + 0.1} x={GX + (i % 10) * CELL + 30} y={GY + Math.floor(i / 10) * CELL - 26} rot={-25} origin="20% 100%">
            <div style={{ background: CORAL, borderRadius: "14px 14px 14px 3px", padding: "2px 12px", ...sans(30, 800) }}><span style={{ color: "#fff" }}>?</span></div>
          </Pop>
        );
      })}
      <WipeOut at={wipeAt} x={bx} y={by} color={TEAL} />
    </Scene>
  );
};

/* 3. Norco: a hop west across the map (New Jersey on the right, California on the left, as on any map), then the map
   zooms into Norco and opens on the lab, where a drop of flavor falls on "make" and bursts on "flavor". */
const SceneNorco: React.FC = () => {
  const t = useT();
  const from = lineAt("norco") - 0.5;
  const to = lineAt("ross") - 0.02;
  const july = tw("july", from), norco = tw("norco", from), make = tw("make", from), flavor = tw("flavor", make);
  const x0 = 1560, x1 = 420, y = 640; // New Jersey (east) to Norco (west)
  const fly = ez(t, july + 0.1, norco + 0.05, Easing.inOut(Easing.cubic));
  const px = x0 + (x1 - x0) * fly, py = y - Math.sin(fly * Math.PI) * 260;
  const ang = Math.atan2(-Math.cos(fly * Math.PI) * 260 * Math.PI, x1 - x0) * (180 / Math.PI);
  /* the zoom: the map grows about the Norco pin and fades while the lab opens in a circle from the same point */
  const zoomAt = Math.min(norco + 0.3, make - 0.9);
  const zoom = ez(t, zoomAt, zoomAt + 0.75, Easing.inOut(Easing.cubic));
  const WX = 300, WY = 330, WW = 1240, WH = 640;
  const reveal = interpolate(t, [zoomAt + 0.05, zoomAt + 0.8], [0, 1500], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const tipX = 1380, tipY = 380; // the pipette's tip, over the lab
  const drop = ez(t, make - 0.05, make + 0.3, Easing.in(Easing.quad));
  const splash = sp(t, make + 0.3, SNAP);
  const burstAt = Math.max(flavor - 0.05, make + 0.28);
  const burst = ez(t, burstAt, burstAt + 0.7, Easing.out(Easing.cubic));
  const landY = 470;
  const e = exitP(t, to, 0.2);
  return (
    <Scene from={from} to={to} wipe={{ x: GX + (ORDER[3] % 10) * CELL + 25, y: GY + Math.floor(ORDER[3] / 10) * CELL + 25 }}>
      <Say text="In July, you came out to Norco / and watched us make *flavor.*" after={lineAt("norco")} out={to} size={66} style={{ left: L, top: 130, width: 1200 }} />
      <Kick at={from + 0.3} out={to} style={{ right: L, top: 140 }}>July 2026</Kick>
      {zoom < 1 && (
        <AbsoluteFill style={{ transform: `scale(${1 + 2.2 * zoom})`, transformOrigin: `${x1}px ${y}px`, opacity: Math.max(0, 1 - zoom * 1.7) }}>
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y - 520} ${x1} ${y}`} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="2 16" strokeLinecap="round" opacity={ez(t, from + 0.3, from + 0.8)} />
          </svg>
          <Pop at={from + 0.2} x={x0 - 32} y={y - 84} origin="50% 100%"><Pin color={GOLD} /></Pop>
          <Kick at={from + 0.4} style={{ left: x0 - 140, top: y + 16, width: 280, textAlign: "center" }}>New Jersey</Kick>
          <Pop at={from + 0.35} x={x1 - 32} y={y - 84} origin="50% 100%"><div style={{ transform: `translateY(${-18 * Math.max(0, sp(t, norco, BOUNCE) - 1) * 4}px)` }}><Pin color={TEAL} /></div></Pop>
          <Kick at={from + 0.55} style={{ left: x1 - 180, top: y + 16, width: 360, textAlign: "center" }}>Norco, California</Kick>
          {fly > 0 && fly < 1 && <div style={{ position: "absolute", left: px - 27, top: py - 27, transform: `rotate(${ang + 157.6}deg) scaleX(-1)` }}><Plane /></div>}
        </AbsoluteFill>
      )}
      {reveal > 0 && (
        <div style={{ position: "absolute", left: WX, top: WY, width: WW, height: WH, borderRadius: 28, overflow: "hidden", background: INK, clipPath: reveal < 1500 ? `circle(${reveal}px at ${x1 - WX}px ${y - WY}px)` : undefined, boxShadow: "0 20px 50px rgba(11,27,43,.18)", opacity: 1 - e }}>
          <Clip at={zoomAt} name="lab" start={0.3} dur={to - zoomAt + 0.1} style={{ transform: `scale(${1.25 - 0.17 * ez(t, zoomAt, to, Easing.out(Easing.quad))})` }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 28, border: `3px solid ${INK}`, opacity: ez(t, zoomAt + 0.6, zoomAt + 0.9) }} />
          {splash > 0 && [0, 1].map((k) => { const s = Math.max(0, splash - k * 0.25); return s > 0 && <div key={k} style={{ position: "absolute", left: tipX - WX - s * 70, top: landY - WY - s * 22, width: s * 140, height: s * 44, borderRadius: "50%", border: `3px solid ${GOLD}`, opacity: Math.max(0, 1.3 - s) }} />; })}
        </div>
      )}
      <Pop at={zoomAt + 0.5} out={to} x={tipX - 60} y={tipY - 250} rot={-10} origin="50% 100%">
        <svg width={120} height={260} viewBox="0 0 60 130" style={{ transform: `translateY(${t > make - 0.4 && t < make ? Math.sin((t - make + 0.4) * 16) * 4 : 0}px)` }}>
          <rect x={22} y={2} width={16} height={24} rx={6} fill={CORAL} stroke={INK} strokeWidth={2.5} />
          <rect x={25} y={26} width={10} height={86} rx={4} fill="#fff" stroke={INK} strokeWidth={2.5} />
          <path d="M26 112 L30 126 L34 112 Z" fill={INK} />
          <rect x={27} y={60 + drop * 40} width={6} height={50 - drop * 40} fill={GOLD} />
        </svg>
      </Pop>
      {drop > 0 && drop < 1 && <div style={{ position: "absolute", left: tipX - 13, top: tipY - 6 + drop * (landY - tipY), width: 26, height: 34, borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", background: GOLD, border: `3px solid ${INK}` }} />}
      {burst > 0 && burst < 1 && Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2 + rnd(k, 4) * 0.4, d = 90 + rnd(k, 6) * 120;
        return <div key={k} style={{ position: "absolute", left: tipX + Math.cos(a) * d * burst - 15, top: landY + Math.sin(a) * d * burst * 0.75 - 15 - 60 * Math.sin(burst * Math.PI), width: 30, height: 30, borderRadius: k % 3 ? "50%" : 6, background: PALETTE[k % 5], border: `3px solid ${INK}`, transform: `rotate(${burst * 220}deg) scale(${1 - burst * burst * 0.7})` }} />;
      })}
    </Scene>
  );
};

/* 4. Ross's goal: the envelope opens on "goal", and the letter rises with his sentence, word for word, as she reads it.
   The two halves get the two highlighters and the two badges (loyal users, new consumers). */
const SceneGoal: React.FC = () => {
  const t = useT();
  const from = lineAt("ross") - 0.05;
  const goal = lineAt("goal");
  const wipeAt = lineAt("day") - 0.7;
  const to = wipeAt + 0.5;
  const open = ez(t, tw("goal", from) + 0.05, tw("goal", from) + 0.45, Easing.inOut(Easing.cubic));
  const rise = sp(t, goal - 0.3, SOFT);
  const envGone = ez(t, goal + 0.1, goal + 0.6, Easing.in(Easing.cubic));
  const strengthen = tw("strengthen", goal), create = tw("create", goal), loyal = tw("loyal", goal), franchise = tw("franchise", goal);
  const ce = exitP(t, wipeAt + 0.45, 0.3);
  return (
    <Scene from={from} to={to}>
      <Say text="Then Ross invited us to *Princeton,* / with this goal." after={lineAt("ross")} out={goal + 0.1} size={66} style={{ left: L, top: 140 }} />
      {envGone < 1 && (
        <div style={{ position: "absolute", left: 700, top: 400 + (1 - sp(t, from + 0.05, SOFT)) * 600 + envGone * 700, opacity: 1 - envGone, perspective: 900 }}>
          <Envelope open={open} />
          {/* the postmark lands on "Princeton" */}
          <Pop at={tw("princeton", from)} x={330} y={150} rot={-40} cfg={SNAP}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, transform: "rotate(-10deg)" }}>
              <div style={{ width: 150, height: 150, borderRadius: "50%", border: `4px solid ${CORAL}`, boxShadow: `inset 0 0 0 6px #fff, inset 0 0 0 9px ${CORAL}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.35)" }}>
                <div style={{ ...mono(17), color: CORAL, letterSpacing: "0.12em" }}>Princeton</div>
                <div style={{ ...mono(13), color: CORAL, marginTop: 6, letterSpacing: "0.12em" }}>New Jersey</div>
              </div>
              <svg width={90} height={60} viewBox="0 0 90 60">{[12, 30, 48].map((y) => <path key={y} d={`M0 ${y} q11 -8 22 0 t22 0 t22 0 t22 0`} fill="none" stroke={CORAL} strokeWidth={4} strokeLinecap="round" />)}</svg>
            </div>
          </Pop>
        </div>
      )}
      {rise > 0 && ce < 1 && (
        <div style={{ position: "absolute", left: 190, top: 262 + (1 - Math.min(1, rise)) * 560, width: 1540, transform: `scale(${(0.6 + 0.4 * Math.min(1, rise)) * (1 + 0.035 * ez(t, goal + 0.4, wipeAt, Easing.inOut(Easing.quad)))})`, transformOrigin: "50% 60%", opacity: Math.min(1, rise * 3) * (1 - ce), background: "#fff", border: `3px solid ${INK}`, borderRadius: 24, padding: "48px 70px 44px", boxShadow: "0 24px 60px rgba(11,27,43,.16)" }}>
          <div style={{ ...mono(20), marginBottom: 26 }}>Ross Conroy’s invitation · September 18, 2026</div>
          <div style={{ position: "relative", minHeight: 372 }}>
            <Say text="“Our goal, as R&D, is to drive incremental growth through flavor innovation by identifying and developing new flavor experiences that both ^strengthen our appeal with existing loyal users^ and ~create opportunities to attract new consumers to the franchise.”~" after={goal} ghost={0.2} size={56} weight={350} style={{ left: 0, top: 0, width: 1250 }} hiAt={[strengthen + 0.1, create + 0.1]} hiColors={["rgba(191,233,242,.95)", "rgba(244,184,96,.75)"]} />
          </div>
          <div style={{ ...mono(18), opacity: ez(t, goal + 0.6, goal + 1.1), letterSpacing: "0.1em" }}>Ross Conroy · Church & Dwight Oral Care R&D</div>
          <Pop at={loyal + 0.4} x={1300} y={130} rot={25}><svg width={110} height={110} viewBox="0 0 100 100"><path d="M50 88 C20 66 8 50 8 34 a20 20 0 0 1 42 -10 a20 20 0 0 1 42 10 C92 50 80 66 50 88 Z" fill={ICE} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><path d="M34 50 L46 62 L68 38" fill="none" stroke={TEAL} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg></Pop>
          <Pop at={franchise + 0.2} x={1300} y={280} rot={-25}><svg width={110} height={110} viewBox="0 0 100 100"><circle cx={42} cy={34} r={16} fill={GOLD} stroke={INK} strokeWidth={3} /><path d="M12 90 V76 a30 30 0 0 1 60 0 V90 Z" fill={GOLD} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><circle cx={78} cy={26} r={17} fill={CORAL} stroke={INK} strokeWidth={3} /><path d="M78 17 V35 M69 26 H87" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></svg></Pop>
        </div>
      )}
      <WipeOut at={wipeAt} x={960} y={560} color={GOLD} />
    </Scene>
  );
};

/* 5. The day: November 9 on the calendar, the Darwin room on the door, 10:00 to 12:00 split into Ross's four objectives,
   and a conversation, not a presentation. */
const SceneDay: React.FC = () => {
  const t = useT();
  const from = lineAt("day") - 0.6;
  const nov = tw("november", from), ten = tw("ten", from), darwin = tw("darwin", from), four = tw("four", from);
  const pitch = lineAt("pitch"), working = tw("working", pitch);
  const wipeAt = lineAt("trends") - 0.65;
  const to = wipeAt + 0.5;
  /* the calendar counts the days from the 1st as the scene opens, faster and faster, and lands on the 9 as she says
     "ninth" (each page lifts off over the top; flip k ends at r0 + span * sqrt((k + 1) / 8)) */
  const ninth = tw("ninth", nov);
  const r0 = from + 0.45, span = ninth - r0;
  const flipEnd = (k: number) => r0 + span * Math.sqrt((k + 1) / 8);
  const o = wipeAt + 0.45;
  return (
    <Scene from={from} to={to} wipe={{ x: 960, y: 560 }}>
      <Say text="So on Monday, *November 9*,|ninth / from 10|ten to noon in the *Darwin room,*" after={lineAt("day")} out={o} size={62} style={{ left: L, top: 110, width: 1600 }} />
      <Pop at={from + 0.2} out={o} x={L + 20} y={330} rot={-6} origin="50% 0%">
        <div style={{ width: 330, borderRadius: 22, border: `3px solid ${INK}`, overflow: "hidden", background: "#fff", boxShadow: "0 18px 44px rgba(11,27,43,.14)" }}>
          <div style={{ background: CORAL, padding: "16px 0", textAlign: "center", ...mono(22), color: "#fff", letterSpacing: "0.28em" }}>November</div>
          <div style={{ position: "relative", height: 220, perspective: 700 }}>
            {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((d) => {
              const end = d === 9 ? 0 : flipEnd(d - 1), start = d === 1 ? r0 : flipEnd(d - 2);
              const p = d === 9 ? 0 : ez(t, Math.max(start, end - 0.22), end, Easing.in(Easing.quad));
              if (p >= 1) return null;
              const land = d === 9 && t > ninth ? 1 + 0.08 * Math.sin(Math.min(1, (t - ninth) / 0.3) * Math.PI) : 1;
              return <div key={d} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", zIndex: 10 - d, transform: `rotateX(${p * 100}deg) scale(${land})`, transformOrigin: "50% 0%", opacity: 1 - p * 0.6, ...sans(184, 800), letterSpacing: "-0.06em", color: d === 9 ? INK : "rgba(11,27,43,.35)" }}>{d}</div>;
            })}
          </div>
          <div style={{ borderTop: `2px solid ${LINE}`, padding: "14px 0", textAlign: "center", ...mono(18), color: INK, letterSpacing: "0.12em" }}><span style={{ opacity: ez(t, ninth - 0.05, ninth + 0.35) }}>Monday, 2026</span></div>
        </div>
      </Pop>
      <div style={{ position: "absolute", left: 580, top: 320, opacity: ez(t, ten - 0.1, ten + 0.3) * (1 - exitP(t, o, 0.3)) }}>
        <Gauge t={t} at={ten} split={four} r={270} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", ...sans(56, 700), opacity: ez(t, ten + 0.4, ten + 0.8) }}>10 to noon</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 292, textAlign: "center", ...mono(20), color: INK, opacity: ez(t, four + 0.5, four + 0.9) }}>Ross’s four objectives</div>
      </div>
      <Pop at={darwin} out={o} x={1400} y={350} rot={8} origin="50% 0%">
        <div style={{ width: 400, background: "#fff", border: `3px solid ${INK}`, borderRadius: 20, padding: "22px 30px 26px", boxShadow: "0 18px 44px rgba(11,27,43,.14)" }}>
          <div style={{ ...mono(18) }}>Room</div>
          <div style={{ ...sans(64, 750), letterSpacing: "-0.03em", marginTop: 4 }}>Darwin</div>
          <div style={{ ...mono(16), color: INK, marginTop: 10, letterSpacing: "0.08em", lineHeight: 1.45 }}>Church & Dwight<br />Princeton, New Jersey</div>
        </div>
      </Pop>
      <Say text="We’ll work through his *four objectives* together. / It’s a *working session,* not a pitch." after={tw("well", lineAt("day"))} out={o} size={54} style={{ left: L, top: 790, width: 1300 }} />
      {[[1450, 720, TEAL, 0], [1640, 790, GOLD, 1], [1480, 870, CORAL, 2], [1690, 900, GREEN, 3]].map(([x, y, c, k]) => (
        <Pop key={k as number} at={working + (k as number) * 0.14} out={o} x={x as number} y={y as number} rot={(k as number) % 2 ? 20 : -20} origin={(k as number) % 2 ? "100% 100%" : "0% 100%"}>
          <div style={{ width: 150, height: 70, borderRadius: (k as number) % 2 ? "26px 26px 4px 26px" : "26px 26px 26px 4px", background: c as string, border: `3px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {[0, 1, 2].map((d) => <div key={d} style={{ width: 12, height: 12, borderRadius: "50%", background: INK, opacity: 0.4 + 0.6 * Math.abs(Math.sin((t - working) * 5 + d)) }} />)}
          </div>
        </Pop>
      ))}
      <WipeOut at={wipeAt} x={L + 185} y={500} color={TEAL} />
    </Scene>
  );
};

/* 6. What you'll do: pick three of the seven trends, then four blind cups in their own bases, scored on a phone. */
const GLASS = [0.145, 0.365, 0.59, 0.81];
const SceneDo: React.FC = () => {
  const t = useT();
  const from = lineAt("trends") - 0.6;
  const three = tw("three", from), most = tw("most", from);
  const then = tw("then", most), four = tw("four", then), samples = tw("samples", then), fresh = tw("fresh", then), kids = tw("kids", then);
  const blind = lineAt("blind"), blindW = tw("blind", blind), score = tw("score", blind), phone = tw("phone", blind);
  const wipeAt = lineAt("noon") - 0.65;
  const to = wipeAt + 0.5;
  const o = wipeAt + 0.45;
  const tilesOut = then + 0.2;
  const size = 206, gap = 32, x0 = (1920 - 7 * size - 6 * gap) / 2;
  const picks = [0, 3, 5];
  const cupsShift = ez(t, blindW - 0.2, blindW + 0.4);
  return (
    <Scene from={from} to={to} wipe={{ x: L + 185, y: 500 }}>
      <Kick at={from + 0.15} out={then - 0.05} style={{ left: L, top: 92 }}>Part 1 · Seven trends</Kick>
      <Say text="You’ll pick the *three trends* / that matter most," after={lineAt("trends")} out={then - 0.05} size={66} style={{ left: L, top: 150, width: 1400 }} />
      {Array.from({ length: 7 }, (_, i) => {
        const pk = picks.indexOf(i);
        const ck = pk >= 0 ? sp(t, three + pk * 0.16, SNAP) : 0;
        const dim = pk < 0 ? 1 - 0.5 * ez(t, most, most + 0.4) : 1;
        return (
          <Pop key={i} at={from + 0.2 + i * 0.07} out={tilesOut} x={x0 + i * (size + gap)} y={470} rot={-12 + (i % 2) * 24} origin="50% 100%">
            <div style={{ opacity: dim, transform: `translateY(${pk >= 0 ? -14 * Math.min(1, ck) : 0}px)` }}>
              <div style={{ width: size, height: size, borderRadius: 30, background: "#fff", border: `3px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(11,27,43,.1)", position: "relative" }}>
                <SignalIcon i={i} size={112} />
                <div style={{ position: "absolute", left: 16, top: 14, ...mono(16), color: DIM }}>0{i + 1}</div>
                {ck > 0 && <div style={{ position: "absolute", right: -22, top: -22, transform: `scale(${2 - Math.min(1, ck)}) rotate(${(1 - Math.min(1, ck)) * -30}deg)`, opacity: Math.min(1, ck * 2) }}><Check size={64} /></div>}
              </div>
              <div style={{ marginTop: 18, width: size, textAlign: "center", ...sans(24, 600) }}>{TRENDS[i]}</div>
            </div>
          </Pop>
        );
      })}
      <Say text="then taste *four samples* we made / in your Fresh Breath and Kids bases." after={then} out={blindW - 0.15} size={66} style={{ left: L, top: 150, width: 1500 }} />
      {/* the drawn cups, with their bases */}
      {["A", "B", "C", "D"].map((ch, i) => (
        <Slide key={ch} at={four - 0.1 + i * 0.08} out={blindW - 0.05} x={420 + i * 360 - 125} y={430} dy={420} cfg={POP}>
          <div style={{ transform: `scale(${1 - 0.1 * cupsShift})` }}><Cup t={t} size={250} letter={ch} letterAt={samples + i * 0.1} /></div>
        </Slide>
      ))}
      {[[0, fresh, "Fresh Breath base", TEAL], [1, kids, "Kids base", CORAL]].map(([k, at, label, c]) => (
        <Slide key={k as number} at={at as number} out={blindW - 0.05} x={420 + (k as number) * 720 - 160} y={735} dy={40}>
          <div style={{ width: 680 - 360 + 300, textAlign: "center" }}>
            <div style={{ height: 14, borderLeft: `3px solid ${c}`, borderRight: `3px solid ${c}`, borderBottom: `3px solid ${c}`, borderRadius: "0 0 10px 10px", margin: "0 40px" }} />
            <div style={{ ...mono(22), color: INK, marginTop: 14 }}>{label as string}</div>
          </div>
        </Slide>
      ))}
      {/* blind: the real cups, four letters and four locked name tags */}
      <Window at={blindW - 0.2} out={o} x={120} y={250 - 40 * ez(t, score - 0.2, score + 0.4)} w={1180} h={470} r={28}>
        <Clip at={blindW - 0.2} name="cups" start={0.3} dur={4.6} />
        {GLASS.map((g, i) => {
          const s = sp(t, blindW + 0.15 + i * 0.08, SNAP);
          return (
            <div key={i} style={{ position: "absolute", left: `calc(${g * 100}% - 58px)`, top: 26, width: 116, transform: `scale(${s})`, transformOrigin: "50% 100%" }}>
              <div style={{ background: "#fff", border: `3px solid ${INK}`, borderRadius: 14, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <Lock />
                <div style={{ ...sans(30, 800) }}>{"ABCD"[i]}</div>
              </div>
            </div>
          );
        })}
        {[[0.255, "Fresh Breath base", TEAL], [0.7, "Kids base", CORAL]].map(([cx, label, c], k) => (
          <div key={k} style={{ position: "absolute", left: `calc(${(cx as number) * 100}% - 230px)`, bottom: 22, width: 460, textAlign: "center", opacity: ez(t, blindW + 0.4 + k * 0.15, blindW + 0.8 + k * 0.15) }}>
            <span style={{ display: "inline-block", background: c as string, borderRadius: 999, padding: "8px 20px", ...mono(20), color: "#fff" }}><span style={{ color: "#fff" }}>{label as string}</span></span>
          </div>
        ))}
      </Window>
      <Slide at={score - 0.25} out={o} x={1420} y={150} dy={520} cfg={POP}><Phone t={t} tapAt={phone + 0.05} w={260} /></Slide>
      <Say text="They’re *blind,* and you’ll score them / on your phone." after={blind} out={o} size={58} style={{ left: L, top: 800, width: 1250 }} />
      <WipeOut at={wipeAt} x={1550} y={420} color={GOLD} />
    </Scene>
  );
};

/* 7. By noon: three directions, each with an owner and a next sample, gathered into The Flavor Playbook and sent out. */
const SceneNoon: React.FC = () => {
  const t = useT();
  const from = lineAt("noon") - 0.6;
  const noon = tw("noon", from), three = tw("three", from), owner = tw("owner", from), sample = tw("sample", from);
  const and = tw("and", sample), everyone = tw("everyone", sample), writeup = tw("writeup", sample), pb = tw("playbook", sample);
  const wipeAt = lineAt("ask") - 0.65;
  const to = wipeAt + 0.5;
  const o = wipeAt + 0.45;
  const gather = ez(t, writeup - 0.1, writeup + 0.45, Easing.inOut(Easing.cubic));
  const book = sp(t, writeup + 0.35, SNAP);
  const bx = 1060, by = 420;
  return (
    <Scene from={from} to={to} wipe={{ x: 1550, y: 420 }}>
      <Say text="By noon, we’d like to agree on / up to *three directions,* / each with an owner and a next sample," after={lineAt("noon")} out={o} size={60} style={{ left: L, top: 210, width: 900, opacity: 1 - 0.62 * ez(t, and - 0.1, and + 0.3) }} />
      <Say text="and we’ll send everyone / the write-up, / *The Flavor Playbook.*" after={and} out={o} size={66} style={{ left: L, top: 500, width: 820 }} />
      <Pop at={from + 0.15} out={three} x={1230} y={250} origin="50% 50%"><Clock t={t} at={noon - 0.15} from={11.8} to={12} dur={0.55} r={170} glow /></Pop>
      {[0, 1, 2].map((k) => {
        const s = sp(t, three + k * 0.12, BOUNCE);
        if (s <= 0 || book > 0.95) return null;
        const cx = 980 + k * 300, cy = 400;
        const gx = cx + (bx + 60 - cx) * gather, gy = cy + (by + 40 - cy) * gather;
        const ow = sp(t, owner + k * 0.1, SNAP), sm = sp(t, sample + k * 0.1, SNAP);
        return (
          <div key={k} style={{ position: "absolute", left: gx, top: gy, transform: `scale(${Math.min(1.05, s) * (1 - 0.4 * gather)}) rotate(${(k - 1) * 4 * (1 - gather)}deg)`, transformOrigin: "50% 0%" }}>
            <div style={{ width: 260, height: 340, background: "#fff", border: `3px solid ${INK}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 36px rgba(11,27,43,.12)", position: "relative" }}>
              <div style={{ height: 14, background: [TEAL, GOLD, CORAL][k] }} />
              <div style={{ position: "absolute", left: 24, top: 36, ...mono(18), color: INK }}>Direction 0{k + 1}</div>
              <div style={{ position: "absolute", left: 24, top: 80, width: 180, height: 14, borderRadius: 7, background: LINE }} />
              <div style={{ position: "absolute", left: 24, top: 106, width: 120, height: 14, borderRadius: 7, background: LINE }} />
              {ow > 0 && <div style={{ position: "absolute", left: 24, top: 160, display: "flex", alignItems: "center", gap: 12, transform: `scale(${ow})`, transformOrigin: "0 50%" }}><Avatar color={[GREEN, PINK, TEAL][k]} size={50} /><span style={{ ...mono(16), color: INK }}>Owner</span></div>}
              {sm > 0 && <div style={{ position: "absolute", left: 24, top: 236, display: "flex", alignItems: "center", gap: 12, transform: `scale(${sm})`, transformOrigin: "0 50%" }}><div style={{ width: 50, display: "flex", justifyContent: "center" }}><Cup t={t} size={44} /></div><span style={{ ...mono(16), color: INK }}>Next sample</span></div>}
            </div>
          </div>
        );
      })}
      {book > 0 && (
        <div style={{ position: "absolute", left: bx, top: by, transform: `scale(${Math.min(1.06, book)})`, transformOrigin: "50% 50%" }}>
          <Book w={300} color={INK}>
            <div style={{ position: "absolute", left: 44, top: 34, ...mono(14), color: "rgba(251,250,247,.78)" }}>The Future of Freshness</div>
            <div style={{ position: "absolute", left: 44, top: 70, right: 24, ...serif(44, 400), color: CREAM }}>The Flavor Playbook</div>
            {[0, 1, 2].map((k) => <div key={k} style={{ position: "absolute", left: 44, top: 230 + k * 34, width: 200 - k * 30, height: 10, borderRadius: 5, background: "rgba(251,250,247,.3)" }} />)}
          </Book>
        </div>
      )}
      {Array.from({ length: 8 }, (_, k) => {
        const ax = 1460 + (k % 4) * 100, ay = 480 + Math.floor(k / 4) * 120;
        const s = sp(t, everyone + k * 0.05, SNAP);
        const a0 = pb + 0.35 + k * 0.07, p = ez(t, a0, a0 + 0.6, Easing.inOut(Easing.cubic));
        const sx = bx + 300, sy = by + 150;
        const px = sx + (ax - sx) * p, py = sy + (ay - sy) * p - Math.sin(p * Math.PI) * 120;
        return (
          <React.Fragment key={k}>
            <Pop at={everyone + k * 0.05} out={o} x={ax} y={ay} rot={20}><div style={{ transform: `scale(${t > a0 + 0.6 ? 1 + 0.15 * Math.max(0, Math.sin(Math.min(1, (t - a0 - 0.6) / 0.3) * Math.PI)) : 1})` }}><Avatar color={PALETTE[(k * 3) % 5]} size={64} /></div></Pop>
            {s > 0 && p > 0 && p < 1 && <div style={{ position: "absolute", left: px, top: py, transform: `rotate(${-20 + 40 * p}deg)` }}><Plane size={40} color={TEAL} /></div>}
          </React.Fragment>
        );
      })}
      <WipeOut at={wipeAt} x={bx + 150} y={by + 200} color={TEAL} />
    </Scene>
  );
};

/* 8. The ask: four quick questions, answers that open the morning on the room's screen, and a phone to bring. */
const QUESTIONS = [
  { n: "01", label: "Who to win next", c: TEAL },
  { n: "02", label: "The missing moment", c: GOLD },
  { n: "03", label: "One flavor you’d veto", c: CORAL },
  { n: "04", label: "Your freshness", c: GREEN },
];
const QIcon: React.FC<{ i: number }> = ({ i }) => {
  const c = QUESTIONS[i].c;
  const p = { fill: "none", stroke: c, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={84} height={84} viewBox="0 0 100 100">
      {i === 0 && <g><circle cx={50} cy={34} r={16} {...p} /><path d="M20 86 V76 a30 30 0 0 1 60 0 V86" {...p} /></g>}
      {i === 1 && <g><circle cx={50} cy={50} r={20} {...p} />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={50} y1={14} x2={50} y2={22} {...p} transform={`rotate(${a} 50 50)`} />)}</g>}
      {i === 2 && <g><circle cx={50} cy={50} r={34} {...p} /><path d="M26 74 L74 26" {...p} /></g>}
      {i === 3 && <g>{[28, 50, 72].map((y, k) => <g key={y}><line x1={16} y1={y} x2={84} y2={y} {...p} /><circle cx={[36, 64, 46][k]} cy={y} r={8} fill="#fff" stroke={c} strokeWidth={6} /></g>)}</g>}
    </svg>
  );
};
const SceneAsk: React.FC<{ ending: Ending }> = ({ ending }) => {
  const t = useT();
  const from = lineAt("ask") - 0.6;
  const ask = lineAt("ask"), quick = Math.min(tw("answer", ask), ask + 0.5), because = tw("because", ask), answers = tw("answers", because), morning = tw("morning", because);
  const phoneL = lineAt("phone"), phoneW = tw("phone", phoneL);
  const wipeAt = lineAt("title") - 0.55;
  const to = wipeAt + 0.5;
  const o = wipeAt + 0.45;
  const toTv = ez(t, answers - 0.1, answers + 0.5, Easing.inOut(Easing.cubic));
  const tv = sp(t, answers - 0.4, SOFT); // the room's screen arrives as the cards head for it
  const where = ending === "brief" ? "on this page," : "in your pre-brief,";
  return (
    <Scene from={from} to={to} wipe={{ x: 1210, y: 560 }}>
      <Kick at={from + 0.2} out={o} style={{ left: L, top: 92 }}>Before November 9</Kick>
      <Say text={`Before you come, please answer the / *four quick questions* ${where}`} after={ask} out={because - 0.05} size={64} style={{ left: L, top: 150, width: 1600 }} />
      <Say text="because everyone’s answers / *open the morning.*" after={because} out={o} size={64} style={{ left: L, top: 150, width: 900 }} />
      {/* the room's screen, where the answers come up at 10:00 */}
      {tv > 0 && (
        <div style={{ position: "absolute", left: 820, top: 320, transform: `scale(${Math.min(1, tv) * (1 - exitP(t, o, 0.3))})`, transformOrigin: "50% 100%", opacity: Math.min(1, tv * 3) }}>
          <div style={{ width: 780, height: 440, background: INK, border: `3px solid ${INK}`, borderRadius: 22, position: "relative", overflow: "hidden", boxShadow: "0 24px 60px rgba(11,27,43,.22)" }}>
            <div style={{ position: "absolute", left: 40, top: 34, ...mono(18), color: "rgba(251,250,247,.7)" }}>10:00 · Your pre-brief answers</div>
            {[0.82, 0.56, 0.38, 0.66].map((h, k) => <div key={k} style={{ position: "absolute", left: 70 + k * 170, bottom: 50, width: 110, height: 260 * h * ez(t, morning + k * 0.1, morning + 0.6 + k * 0.1), borderRadius: 12, background: QUESTIONS[k].c }} />)}
          </div>
          <div style={{ width: 120, height: 60, margin: "0 auto", background: INK, clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)" }} />
        </div>
      )}
      {QUESTIONS.map((q, k) => {
        const s = sp(t, quick + k * 0.12, BOUNCE);
        if (s <= 0 || toTv >= 1) return null;
        const x = L + k * 430, y = 470;
        const tx = 890 + k * 170, ty = 480;
        return (
          <div key={k} style={{ position: "absolute", left: x + (tx - x) * toTv, top: y + (ty - y) * toTv, transform: `scale(${Math.min(1.05, s) * (1 - 0.75 * toTv)}) rotate(${(k % 2 ? 5 : -5) * (1 - Math.min(1, s))}deg)`, transformOrigin: "0 0", opacity: 1 - toTv * 0.6 }}>
            <div style={{ width: 380, height: 300, background: "#fff", border: `3px solid ${INK}`, borderRadius: 24, position: "relative", boxShadow: "0 14px 36px rgba(11,27,43,.1)" }}>
              <div style={{ position: "absolute", left: 26, top: 22, ...mono(20), color: INK }}>{q.n}</div>
              <div style={{ position: "absolute", right: 22, top: 18 }}><QIcon i={k} /></div>
              <div style={{ position: "absolute", left: 26, right: 26, bottom: 28, ...serif(46, 400) }}>{q.label}</div>
            </div>
          </div>
        );
      })}
      <Slide at={phoneW - 0.2} out={o} x={1560} y={270} dy={500} cfg={POP}>
        <div style={{ transform: `rotate(${6 * Math.sin(Math.max(0, t - phoneW) * 4) * Math.max(0, 1 - (t - phoneW) / 1.2)}deg)` }}><Phone t={t} tapAt={phoneW + 0.2} w={240} join /></div>
      </Slide>
      <Say text="And bring your *phone.*" after={phoneL} out={o} size={64} style={{ left: L, top: 820 }} />
      <Pop at={phoneW + 0.5} out={o} x={L} y={930} origin="0 50%">
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: `3px solid ${INK}`, borderRadius: 999, padding: "10px 26px 10px 14px" }}>
          <svg width={40} height={40} viewBox="0 0 40 40" style={{ transform: `translateY(${ending === "brief" ? 5 * Math.sin((t - phoneW) * 6) : 0}px)` }}>
            <circle cx={20} cy={20} r={19} fill={TEAL} />
            {ending === "brief" ? <path d="M20 10 V29 M12 21 L20 29 L28 21" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : <path d="M11 20 H28 M21 12 L29 20 L21 28" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          <span style={{ ...mono(20), color: INK }}>{ending === "brief" ? "The four questions are below" : "Open your pre-brief"}</span>
        </div>
      </Pop>
      <WipeOut at={wipeAt} x={1680} y={510} color={INK} />
    </Scene>
  );
};

/* 9. The title: the crown splash, The Future of Freshness, see you in Princeton, then the rings under the end card. */
const SceneTitle: React.FC = () => {
  const t = useT();
  const from = lineAt("title") - 0.5;
  const to = TK.duration;
  const end = lineEnd("see") + 0.35;
  const fresh = tw("freshness", from);
  const inA = ez(t, from, from + 0.45);
  const rings = ez(t, end + 0.3, end + 1.0);
  const outA = ez(t, to - 1.3, to, Easing.in(Easing.quad));
  const up = -ez(t, end, end + 0.8) * 70;
  const sweep = interpolate(t, [fresh + 0.9, fresh + 2.3], [-30, 130], clamp);
  return (
    <Scene from={from} to={to}>
      <AbsoluteFill style={{ background: "#04070B", opacity: inA }}>
        <Clip at={from} dir="fof3" name="crown_slow" start={0.9} dur={Math.min(8.6, end + 1.1 - from)} />
        {rings > 0 && <AbsoluteFill style={{ opacity: rings }}><Clip at={end + 0.3} dir="fof3" name="ripples_slow" start={0.6} dur={to - end} /></AbsoluteFill>}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,.5) 100%)" }} />
        {/* a soft pool of dark behind the words, so the splash and the rings never cut through them */}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 58% 30% at 50% 43%, rgba(4,7,11,.62), rgba(4,7,11,.28) 60%, rgba(4,7,11,0) 100%)", opacity: ez(t, lineAt("title") - 0.25, lineAt("title") + 0.5), transform: `translateY(${up}px)` }} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(4,7,11,.92), rgba(4,7,11,.55) 24%, rgba(4,7,11,0) 46%)", opacity: ez(t, end, end + 0.6) }} />
      </AbsoluteFill>
      <Say text="The Future of *Freshness.*" after={lineAt("title")} size={150} align="center" color={CREAM} accent={ICE} style={{ left: 0, right: 0, top: 340, transform: `translateY(${up}px)`, textShadow: "0 6px 40px rgba(0,0,0,.5)" }} />
      {sweep > -30 && sweep < 130 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 340, transform: `translateY(${up}px)`, textAlign: "center" }}>
          <div style={{ ...serif(150), color: "transparent", display: "inline-block", backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,.95) ${sweep}%, rgba(191,233,242,.9) ${sweep + 4}%, rgba(255,255,255,0) ${sweep + 14}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", whiteSpace: "nowrap" }}>The Future of <i>Freshness.</i></div>
        </div>
      )}
      <Say text="See you in *Princeton.*" after={lineAt("see")} size={62} align="center" color={CREAM} accent={ICE} style={{ left: 0, right: 0, top: 552, transform: `translateY(${up}px)`, textShadow: "0 4px 24px rgba(0,0,0,.5)" }} />
      <Slide at={end} x={0} y={724} dy={40} style={{ right: 0, textAlign: "center" }}>
        <div style={{ ...mono(24), color: "rgba(244,241,234,.9)", letterSpacing: "0.12em", lineHeight: 1.6 }}>Monday, November 9, 2026 · 10:00 AM to 12:00 PM ET<br />Darwin room · Church & Dwight · Princeton, New Jersey</div>
      </Slide>
      <Slide at={end + 0.15} x={0} y={846} dy={60} style={{ right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, background: "#fff", padding: "16px 36px", borderRadius: 16, boxShadow: "0 16px 50px rgba(0,0,0,.45)" }}>
          <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 52 }} />
          <span style={{ font: `300 30px ${SANS}`, color: "rgba(11,27,43,.45)" }}>×</span>
          <Img src={staticFile("img/tff-logo.png")} style={{ height: 50 }} />
        </div>
      </Slide>
      <AbsoluteFill style={{ background: "#04070B", opacity: outA }} />
    </Scene>
  );
};

export const FutureOfFreshnessV5: React.FC<{ ending: Ending }> = ({ ending }) => {
  loadFonts();
  TK = TAKES[ending];
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: SANS, color: INK }}>
      <SceneBurn />
      <SceneWant />
      <SceneMath />
      <SceneNorco />
      <SceneGoal />
      <SceneDay />
      <SceneDo />
      <SceneNoon />
      <SceneAsk ending={ending} />
      <SceneTitle />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* The Future of Freshness, V2: the opening film for the pre-brief and the site (77 seconds).
   Look: "Light through liquid, in the dark." Ink black, crystal liquids lit from behind, color earned.
   Type matches the site (Newsreader display, Geist Mono labels) but big and kinetic, cut to the score.
   Every line on screen is sourced in docs/fof/V2.md. Blind: no sample names or ingredients.
   Picture renders muted; scripts/fof2_mix.py builds the mix from the same timings. */

const FPS = 30;
const f = (t: number) => Math.round(t * FPS);
export const FOF2_FRAMES = f(77);

const BG = "#04070B";
const WHITE = "#F4F1EA";
const DIM = "rgba(244,241,234,.66)";
const ICE = "#BFE9F2";
const AQUA = "#6CC7DD";
const GOLD = "#F4B860";
const INK = "#0B1B2B";
const SPECTRUM = "linear-gradient(90deg, #BFE9F2, #F4B860, #E0407B, #8FAF97, #6CC7DD)";
const SERIF = '"Newsreader", Georgia, serif';
const SANS = '"Geist", system-ui, sans-serif';
const MONO = '"Geist Mono", ui-monospace, monospace';
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const L = 140;

let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded || typeof document === "undefined") return;
  fontsLoaded = true;
  const handle = delayRender("fof2 fonts");
  const faces = [
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Geist Mono", `url(${staticFile("fonts/GeistMono-Variable.woff2")})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle)).catch(() => continueRender(handle));
};

/* ---------- Picture timeline (film seconds) ---------- */
type Shot = { id: string; clip?: string; img?: string; from: number; to: number; start?: number; rate?: number; push?: number; x?: number; dim?: number };
const SHOTS: Shot[] = [
  { id: "drip", clip: "drip", from: 0, to: 3.0, start: 0.5, push: 0.04, x: 0 },
  { id: "crown", clip: "crown_k4", from: 3.0, to: 5.5, start: 0, push: 0.05, x: 0 },
  { id: "ice", clip: "iceburst", from: 5.5, to: 7.0, start: 0.1, push: 0.08, x: 0 },
  { id: "swirl", clip: "swirl", from: 7.0, to: 11.0, start: 0.3, push: 0.05, x: 4 },
  { id: "gap", clip: "dots_slow", from: 11.0, to: 20.0, start: 0, push: 0.03, x: 10, dim: 0.42 },
  { id: "dew", clip: "dewdrop", from: 20.0, to: 23.5, start: 0.5, push: 0.04, x: 10 },
  { id: "lab", clip: "lab", from: 23.5, to: 27.5, start: 0.3, push: 0.03, x: 10 },
  { id: "caustic", clip: "caustic_slow", from: 27.5, to: 36.0, start: 0, push: 0.04, x: 12 },
  { id: "prism", clip: "prism", from: 36.0, to: 40.0, start: 0, push: 0.04, x: 0 },
  { id: "frost", clip: "frost", from: 40.0, to: 42.0, start: 1.0, push: 0.05, x: 0 },
  { id: "bubbles", clip: "bubbles", from: 42.0, to: 44.0, start: 0.5, push: 0.05, x: 0 },
  { id: "herbs", clip: "herbs", from: 44.0, to: 45.5, start: 0.2, push: 0.06, x: 0 },
  { id: "citrus", clip: "citrus", from: 45.5, to: 47.0, start: 0.1, push: 0.06, x: 0 },
  { id: "cucumber", clip: "cucumber", from: 47.0, to: 48.5, start: 0.5, push: 0.06, x: 0 },
  { id: "spheres", clip: "spheres", from: 48.5, to: 50.0, start: 0.3, push: 0.06, x: 0 },
  { id: "cups", clip: "cups", from: 50.0, to: 54.0, start: 0.3, push: 0.0, x: 0 },
  { id: "bloom", clip: "bloom", from: 54.0, to: 58.0, start: 0.5, push: 0.04, x: 0 },
  { id: "vessels", clip: "vessels", from: 58.0, to: 62.0, start: 0, rate: 0.8, push: 0.02, x: 0 },
  { id: "book", img: "book.png", from: 62.0, to: 66.0, push: 0.05, x: 0 },
  { id: "finale", clip: "sphere_slow", from: 66.0, to: 77.0, start: 0, push: 0.06, x: 0 },
];

/* Scrims so white type always holds on bright footage. */
const SCRIM: Record<string, string> = {
  crown: "linear-gradient(90deg, rgba(4,7,11,.55), rgba(4,7,11,0) 50%)",
  lab: "linear-gradient(0deg, rgba(4,7,11,.86), rgba(4,7,11,.4) 38%, rgba(4,7,11,0) 62%)",
  caustic: "linear-gradient(90deg, rgba(4,7,11,.7), rgba(4,7,11,.3) 55%, rgba(4,7,11,0) 75%)",
  prism: "linear-gradient(180deg, rgba(4,7,11,.55), rgba(4,7,11,0) 50%)",
  frost: "linear-gradient(90deg, rgba(4,7,11,.86), rgba(4,7,11,.5) 45%, rgba(4,7,11,.1) 80%)",
  bubbles: "linear-gradient(90deg, rgba(4,7,11,.5), rgba(4,7,11,0) 50%)",
  herbs: "linear-gradient(0deg, rgba(4,7,11,.82), rgba(4,7,11,0) 50%), linear-gradient(180deg, rgba(4,7,11,.6), rgba(4,7,11,0) 22%)",
  citrus: "linear-gradient(0deg, rgba(4,7,11,.82), rgba(4,7,11,0) 50%), linear-gradient(180deg, rgba(4,7,11,.6), rgba(4,7,11,0) 22%)",
  cucumber: "linear-gradient(0deg, rgba(4,7,11,.82), rgba(4,7,11,0) 50%), linear-gradient(180deg, rgba(4,7,11,.6), rgba(4,7,11,0) 22%)",
  spheres: "linear-gradient(0deg, rgba(4,7,11,.82), rgba(4,7,11,0) 50%), linear-gradient(180deg, rgba(4,7,11,.6), rgba(4,7,11,0) 22%)",
  cups: "linear-gradient(180deg, rgba(4,7,11,.5), rgba(4,7,11,0) 30%), linear-gradient(0deg, rgba(4,7,11,.7), rgba(4,7,11,0) 22%)",
  bloom: "linear-gradient(270deg, rgba(4,7,11,.9), rgba(4,7,11,.6) 32%, rgba(4,7,11,0) 55%)",
  vessels: "linear-gradient(180deg, rgba(4,7,11,.7), rgba(4,7,11,0) 42%)",
  book: "linear-gradient(90deg, rgba(4,7,11,.5), rgba(4,7,11,0) 35%)",
};

const ShotLayer: React.FC<{ s: Shot }> = ({ s }) => {
  const xin = s.x ?? 8;
  const len = f(s.to) - f(s.from);
  return (
    <Sequence from={f(s.from) - xin} durationInFrames={len + xin} layout="none">
      <ShotBody s={s} xin={xin} len={len} />
    </Sequence>
  );
};
const ShotBody: React.FC<{ s: Shot; xin: number; len: number }> = ({ s, xin, len }) => {
  const fr = useCurrentFrame();
  const op = xin ? interpolate(fr, [0, xin], [0, 1], clamp) : 1;
  const scale = 1 + (s.push ?? 0.03) * ((fr - xin) / len);
  return (
    <AbsoluteFill style={{ opacity: op, background: BG }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, opacity: s.dim ?? 1 }}>
        {s.clip && <OffthreadVideo src={staticFile(`fof2/clips/${s.clip}.mp4`)} muted startFrom={Math.max(0, f(s.start ?? 0) - xin)} playbackRate={s.rate ?? 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />}
        {s.img && <Img src={staticFile(`fof2/img/${s.img}`)} style={{ width: 1920, height: 1080, objectFit: "cover" }} />}
        {s.id === "book" && <Cover />}
        {s.id === "swirl" && <Knockout />}
        {s.id === "cups" && <CupLights />}
      </AbsoluteFill>
      {SCRIM[s.id] && <AbsoluteFill style={{ background: SCRIM[s.id] }} />}
      {s.id === "gap" && <DotGrid />}
    </AbsoluteFill>
  );
};

/* ---------- Type ---------- */
const serif = (size: number, weight = 300): React.CSSProperties => ({ font: `${weight} ${size}px/1.02 ${SERIF}`, fontVariationSettings: '"opsz" 72', letterSpacing: "-0.03em", color: WHITE });

/* Kicker: mono label whose tracking settles as it fades in. */
const Kicker: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; color?: string; size?: number }> = ({ at, out, children, style, color = DIM, size = 24 }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(at), f(at) + 18], [0, 1], { ...clamp, easing: ease });
  const o = out === undefined ? 1 : interpolate(fr, [f(out) - 8, f(out)], [1, 0], clamp);
  if (a <= 0 || o <= 0) return null;
  return <div style={{ position: "absolute", font: `500 ${size}px ${MONO}`, textTransform: "uppercase", letterSpacing: `${0.24 + (1 - a) * 0.3}em`, color, opacity: a * o, whiteSpace: "nowrap", ...style }}>{children}</div>;
};

/* Words rise from behind a mask and come into focus, one by one. *word* sets italic; ^word^ sets the spectral highlight. */
type Tok = { w: string; it: boolean; hi: boolean; br: boolean };
const tokenize = (text: string): Tok[] => {
  let it = false, hi = false;
  return text.split(" ").map((raw) => {
    if (raw === "/") return { w: "", it, hi, br: true };
    let w = raw;
    const sIt = w.startsWith("*"), sHi = w.startsWith("^");
    if (sIt) { it = true; w = w.slice(1); }
    if (sHi) { hi = true; w = w.slice(1); }
    const tok = { w: w.replace(/[*^]/g, ""), it, hi, br: false };
    if (/\*[.,:;!?”]*$/.test(w)) it = false;
    if (/\^[.,:;!?”]*$/.test(w)) hi = false;
    return tok;
  });
};
const Words: React.FC<{ at: number; out?: number; text: string; size: number; weight?: number; stagger?: number; times?: number[]; style?: React.CSSProperties; color?: string; italicColor?: string; align?: "left" | "center"; punch?: boolean }> = ({ at, out, text, size, weight = 300, stagger = 0.07, times, style, color = WHITE, italicColor, align = "left", punch }) => {
  const fr = useCurrentFrame();
  if (fr < f(at) - 1) return null;
  const toks = tokenize(text);
  const exit = out === undefined ? 0 : interpolate(fr, [f(out) - 9, f(out)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (exit >= 1) return null;
  let k = 0;
  return (
    <div style={{ position: "absolute", ...serif(size, weight), color, textAlign: align, opacity: 1 - exit, filter: exit ? `blur(${exit * 10}px)` : undefined, transform: `translateY(${-exit * 30}px)`, ...style }}>
      {toks.map((t, i) => {
        if (t.br) return <br key={i} />;
        const t0 = times ? f(times[Math.min(k, times.length - 1)]) : f(at + k * stagger);
        k++;
        const a = interpolate(fr, [t0, t0 + 16], [0, 1], { ...clamp, easing: ease });
        const ab = punch ? interpolate(fr, [t0, t0 + 8], [1, 0], clamp) : 0;
        const inner: React.CSSProperties = {
          display: "inline-block", transform: `translateY(${(1 - a) * 108}%)`, filter: a < 1 ? `blur(${(1 - a) * 9}px)` : undefined,
          fontStyle: t.it ? "italic" : undefined, color: t.it && italicColor ? italicColor : undefined,
          textShadow: ab ? `${ab * 7}px 0 rgba(255,60,90,.75), ${-ab * 7}px 0 rgba(60,220,255,.75)` : undefined,
          ...(t.hi ? { backgroundImage: SPECTRUM, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}),
        };
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: "0.06em 0.05em 0.14em", margin: "-0.06em -0.05em -0.14em" }}>
              <span style={inner}>{t.w}</span>
            </span>{" "}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* A chromatic punch: the line snaps in with an RGB split that collapses in a few frames. */
const Punch: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, out, children, style }) => {
  const fr = useCurrentFrame();
  if (fr < f(at)) return null;
  const o = out === undefined ? 1 : interpolate(fr, [f(out) - 6, f(out)], [1, 0], clamp);
  if (o <= 0) return null;
  const a = interpolate(fr, [f(at), f(at) + 10], [0, 1], { ...clamp, easing: ease });
  const ab = interpolate(fr, [f(at), f(at) + 9], [1, 0], clamp);
  const sc = 1.06 - 0.06 * a;
  return <div style={{ position: "absolute", opacity: Math.min(1, a * 1.6) * o, transform: `scale(${sc})`, transformOrigin: "left bottom", textShadow: `${ab * 10}px 0 rgba(255,60,90,.7), ${-ab * 10}px 0 rgba(60,220,255,.7)`, ...style }}>{children}</div>;
};

/* A light sweep that crosses a title once, laid exactly over the title it lights. */
const Sweep: React.FC<{ at: number; dur?: number; children: React.ReactNode; style: React.CSSProperties; textStyle: React.CSSProperties }> = ({ at, dur = 1.4, children, style, textStyle }) => {
  const fr = useCurrentFrame();
  const p = interpolate(fr, [f(at), f(at + dur)], [-30, 130], clamp);
  if (p <= -30 || p >= 130) return null;
  return (
    <div style={{ position: "absolute", ...style }}>
      <div style={{ ...textStyle, display: "inline-block", backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${p - 12}%, rgba(255,255,255,.95) ${p}%, rgba(191,233,242,.9) ${p + 4}%, rgba(255,255,255,0) ${p + 14}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>{children}</div>
    </div>
  );
};

/* Huge outlined chapter numeral that fills with light. */
const Numeral: React.FC<{ at: number; out: number; n: string; style: React.CSSProperties }> = ({ at, out, n, style }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(at), f(at) + 14], [0, 1], { ...clamp, easing: ease });
  const fill = interpolate(fr, [f(at) + 4, f(at) + 30], [0, 1], { ...clamp, easing: ease });
  const o = interpolate(fr, [f(out) - 8, f(out)], [1, 0], clamp);
  if (a <= 0 || o <= 0) return null;
  return (
    <div style={{ position: "absolute", ...serif(230, 300), opacity: a * o, transform: `translateY(${(1 - a) * 30}px)`, WebkitTextStroke: "1.5px rgba(244,241,234,.8)", color: "transparent", backgroundImage: `linear-gradient(0deg, rgba(244,241,234,.95) ${fill * 100}%, rgba(244,241,234,0) ${fill * 100}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", ...style }}>{n}</div>
  );
};

/* ---------- The want: the swirl seen only through the word ---------- */
const Knockout: React.FC = () => {
  const fr = useCurrentFrame();
  const t = (s: number) => f(s - 7.0) + 4; // shot-local frames (shot starts at 7.0 with a 4-frame dissolve)
  const k = interpolate(fr, [t(8.45), t(8.85)], [0, 0.93], { ...clamp, easing: ease });
  const sc = interpolate(fr, [t(8.45), t(11.0)], [1.12, 1.0], { ...clamp, easing: ease });
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: k, mixBlendMode: "multiply", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ font: `italic 400 560px/1 ${SERIF}`, fontVariationSettings: '"opsz" 72', letterSpacing: "-0.05em", color: "#fff", transform: `scale(${sc}) translateY(-20px)` }}>want.</div>
    </AbsoluteFill>
  );
};

/* ---------- The gap: 100 drops, 65 lit, 14 glowing, 86 still to meet ---------- */
const GRID = { x: 1150, y: 236, step: 64, d: 46 };
const order = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => ((a * 37) % 101) - ((b * 37) % 101));
const LIT = new Set(order.slice(0, 65));
const TB = new Set(order.slice(0, 14));
const DotGrid: React.FC = () => {
  const fr = useCurrentFrame();
  const g = (s: number) => f(s - 11.0) + 10; // shot-local frames
  const appear = interpolate(fr, [g(11.1), g(11.8)], [0, 1], { ...clamp, easing: ease });
  const out = interpolate(fr, [g(19.6), g(20.0)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: appear * out }}>
      {Array.from({ length: 100 }, (_, i) => {
        const r = Math.floor(i / 10), c = i % 10;
        const rank = order.indexOf(i);
        const lit = LIT.has(i) ? interpolate(fr, [g(11.7) + rank * 1.05, g(11.7) + rank * 1.05 + 8], [0, 1], clamp) : 0;
        const tb = TB.has(i) ? interpolate(fr, [g(15.2) + rank * 1.6, g(15.2) + rank * 1.6 + 10], [0, 1], clamp) : 0;
        const meet = !TB.has(i) ? interpolate(fr, [g(18.2) + ((i * 13) % 17), g(18.2) + ((i * 13) % 17) + 10], [0, 1], clamp) : 0;
        const pulse = meet ? 0.5 + 0.5 * Math.sin((fr - g(18.2)) / 5 + i) : 0;
        const fade = interpolate(fr, [g(18.0), g(18.4)], [1, 0.25], clamp);
        return (
          <div key={i} style={{
            position: "absolute", left: GRID.x + c * GRID.step, top: GRID.y + r * GRID.step, width: GRID.d, height: GRID.d, borderRadius: "50%",
            border: `1.5px solid rgba(244,241,234,${0.22 + 0.35 * lit})`,
            background: tb ? `radial-gradient(circle at 35% 30%, rgba(255,255,255,.95), ${AQUA} 45%, rgba(108,199,221,.35) 80%)` : `radial-gradient(circle at 35% 30%, rgba(255,255,255,${0.9 * lit * (TB.has(i) ? 1 : fade)}), rgba(191,233,242,${0.28 * lit * (TB.has(i) ? 1 : fade)}) 45%, rgba(191,233,242,${0.06 * lit}) 80%)`,
            boxShadow: tb ? `0 0 ${26 * tb}px rgba(108,199,221,${0.85 * tb})` : meet ? `0 0 ${10 + 16 * pulse}px rgba(244,184,96,${0.55 * meet})` : undefined,
            outline: meet ? `1.5px solid rgba(244,184,96,${0.85 * meet})` : undefined, outlineOffset: 3,
            transform: `scale(${0.6 + 0.4 * appear + 0.08 * tb})`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
const Count: React.FC<{ at: number; to: number; dur: number }> = ({ at, to, dur }) => {
  const fr = useCurrentFrame();
  const v = Math.round(interpolate(fr, [f(at), f(at + dur)], [0, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return <>{v}</>;
};

/* ---------- Blind tasting: each cup's light comes up in turn ---------- */
const CUPS = [319, 731, 1171, 1597];
const CupLights: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill>
      {CUPS.map((x, i) => {
        const t0 = f(0.6 + i * 0.45);
        const a = interpolate(fr, [t0, t0 + 6, t0 + 30], [0, 1, 0.45], clamp);
        return <div key={i} style={{ position: "absolute", left: x - 180, top: 300, width: 360, height: 640, background: "radial-gradient(ellipse at 50% 50%, rgba(220,240,255,.45), rgba(220,240,255,0) 65%)", mixBlendMode: "screen", opacity: a }} />;
      })}
    </AbsoluteFill>
  );
};
const CupCodes: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <>
      {["A", "B", "C", "D"].map((c, i) => {
        const t0 = f(50.0 + 0.6 + i * 0.45);
        const a = interpolate(fr, [t0, t0 + 12], [0, 1], { ...clamp, easing: ease });
        const o = interpolate(fr, [f(53.9) - 6, f(53.9)], [1, 0], clamp);
        if (a <= 0 || o <= 0) return null;
        return <div key={c} style={{ position: "absolute", left: CUPS[i] - 60, width: 120, top: 772, textAlign: "center", font: `400 56px ${SERIF}`, fontVariationSettings: '"opsz" 72', color: WHITE, textShadow: "0 0 18px rgba(0,0,0,.95), 0 0 6px rgba(0,0,0,.9)", opacity: a * o, transform: `translateY(${(1 - a) * 16}px)` }}>{c}</div>;
      })}
    </>
  );
};

/* ---------- The Playbook cover, printed onto the book in the still (co-author lines left blank) ---------- */
const COVER = { x: 689, y: 114, w: 611, h: 839 };
const Cover: React.FC = () => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(0.3), f(0.9)], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: COVER.x, top: COVER.y, width: COVER.w, height: COVER.h, padding: "58px 52px", boxSizing: "border-box", color: INK, opacity: a, mixBlendMode: "multiply" }}>
      <div style={{ font: `500 13px ${MONO}`, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(11,27,43,.6)" }}>TheraBreath × The Flavor Factory</div>
      <div style={{ ...serif(62, 300), color: INK, marginTop: 64, letterSpacing: "-0.02em" }}>The TheraBreath<br /><i>Flavor Playbook</i></div>
      <div style={{ display: "inline-block", marginTop: 30, padding: "7px 15px", border: "1px solid rgba(11,27,43,.35)", borderRadius: 999, font: `500 15px ${MONO}`, letterSpacing: "0.1em" }}>v0.1</div>
      <div style={{ position: "absolute", left: 52, right: 52, top: 448, height: 2, background: SPECTRUM }} />
      <div style={{ position: "absolute", left: 52, top: 480, ...serif(26, 400), color: INK, fontStyle: "italic", letterSpacing: "-0.01em" }}>Co-authored November 9, 2026</div>
      <div style={{ position: "absolute", left: 52, top: 520, font: `500 12px ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(11,27,43,.55)" }}>Princeton, New Jersey</div>
      <div style={{ position: "absolute", left: 52, top: 598, font: `500 11px ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(11,27,43,.5)" }}>Co-authors</div>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const t0 = f(1.4) + i * 5;
        const w = interpolate(fr, [t0, t0 + 14], [0, 1], { ...clamp, easing: ease });
        return <div key={i} style={{ position: "absolute", left: 52 + (i % 2) * 262, top: 650 + Math.floor(i / 2) * 50, width: 230 * w, height: 1.5, background: "rgba(11,27,43,.5)" }} />;
      })}
    </div>
  );
};

/* ---------- Light: flashes and anamorphic streaks on the hits ---------- */
const FLASHES: [number, number][] = [[3.0, 0.35], [5.5, 0.55], [36.0, 0.95], [44.0, 0.3], [50.0, 0.25], [62.0, 0.3], [66.0, 0.7]];
const STREAKS: [number, number][] = [[3.0, 600], [11.0, 540], [36.0, 640], [44.0, 900], [58.0, 300], [66.0, 520]];
const Light: React.FC = () => {
  const fr = useCurrentFrame();
  const flash = Math.max(0, ...FLASHES.map(([t, k]) => k * interpolate(fr, [f(t) - 1, f(t), f(t) + 8], [0, 1, 0], clamp)));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {STREAKS.map(([t, y], i) => {
        const p = interpolate(fr, [f(t) - 2, f(t) + 14], [0, 1], clamp);
        if (p <= 0 || p >= 1) return null;
        const o = Math.sin(p * Math.PI);
        return <div key={i} style={{ position: "absolute", left: -200 + p * 300, top: y - 3, width: 2300, height: 6, borderRadius: 6, background: "linear-gradient(90deg, rgba(191,233,242,0), rgba(220,245,255,.95) 50%, rgba(191,233,242,0))", filter: "blur(3px)", opacity: o, boxShadow: "0 0 40px 10px rgba(108,199,221,.35)", mixBlendMode: "screen" }} />;
      })}
      <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/* ---------- Everything said on screen (film seconds) ---------- */
const OnScreen: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Cold open */}
      <Kicker at={0.5} out={2.8} style={{ left: 0, right: 0, top: 760, textAlign: "center" }}>TheraBreath × The Flavor Factory</Kicker>

      {/* Thesis */}
      <Words at={3.3} out={5.5} text="TheraBreath took away / *the burn.*" size={128} times={[3.32, 3.95, 4.2, 4.55, 4.7]} style={{ left: L, top: 330 }} />
      <Words at={7.25} out={8.5} text="Now let's add the" size={96} times={[7.25, 7.95, 8.15, 8.3]} style={{ left: 0, right: 0, top: 160 }} align="center" />

      {/* The gap */}
      <Kicker at={11.3} out={17.9} style={{ left: L, top: 236 }}>The gap · Household penetration, US</Kicker>
      {fr >= f(11.5) && fr < f(17.9) && (
        <div style={{ position: "absolute", left: L, top: 270, opacity: interpolate(fr, [f(11.5), f(11.8), f(17.6), f(17.9)], [0, 1, 1, 0], clamp) }}>
          <div style={{ ...serif(230, 300), display: "flex", alignItems: "baseline", fontVariantNumeric: "tabular-nums" }}><Count at={11.6} to={65} dur={2.3} /><span style={{ fontSize: 110, marginLeft: 6 }}>%</span></div>
          <div style={{ font: `500 22px ${MONO}`, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginTop: 8 }}>Mouthwash is in 65 of every 100 US homes</div>
        </div>
      )}
      {fr >= f(15.1) && fr < f(17.9) && (
        <div style={{ position: "absolute", left: L, top: 590, opacity: interpolate(fr, [f(15.1), f(15.4), f(17.6), f(17.9)], [0, 1, 1, 0], clamp) }}>
          <div style={{ ...serif(230, 300), color: AQUA, display: "flex", alignItems: "baseline", fontVariantNumeric: "tabular-nums", textShadow: "0 0 40px rgba(108,199,221,.45)" }}><Count at={15.15} to={14} dur={0.9} /><span style={{ fontSize: 110, marginLeft: 6 }}>%</span></div>
          <div style={{ font: `500 22px ${MONO}`, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginTop: 8 }}>TheraBreath is in 14</div>
        </div>
      )}
      {fr >= f(18.1) && fr < f(19.9) && (
        <div style={{ position: "absolute", left: L, top: 300, opacity: interpolate(fr, [f(18.1), f(18.3), f(19.6), f(19.9)], [0, 1, 1, 0], clamp), transform: `scale(${interpolate(fr, [f(18.1), f(18.5)], [1.08, 1], { ...clamp, easing: ease })})`, transformOrigin: "left top" }}>
          <div style={{ ...serif(300, 300), color: GOLD, textShadow: "0 0 50px rgba(244,184,96,.35)" }}>86</div>
          <div style={{ ...serif(52, 300), width: 820, marginTop: 6 }}>of every 100 US households have <i>not met TheraBreath yet.</i></div>
        </div>
      )}
      <Kicker at={11.6} out={19.9} size={17} style={{ left: L, top: 980, letterSpacing: "0.14em" }}>Source: Church & Dwight Q2 2026 earnings call, July 31, 2026 · 86 = 100 minus 14</Kicker>

      <Words at={20.25} out={23.5} text="Flavor is how we / *introduce* ourselves." size={112} times={[20.25, 20.6, 20.75, 20.85, 21.2, 21.75]} style={{ left: L, top: 400 }} />

      {/* Norco */}
      <Kicker at={23.7} out={27.4} style={{ left: L, bottom: 330 }}>July 2026 · Norco, California</Kicker>
      <Words at={24.4} out={27.4} text="You came to see how / we *make flavor.*" size={104} stagger={0.12} style={{ left: L, bottom: 72 }} />

      {/* The ask */}
      <Kicker at={27.8} out={35.8} style={{ left: L, top: 200 }}>Your invitation</Kicker>
      <Words at={27.9} out={35.8} text="Now you've asked for more." size={92} times={[27.9, 28.15, 28.35, 28.55, 29.05]} style={{ left: L, top: 250 }} />
      <Words at={29.9} out={35.8} text="“strengthen our appeal with / ^existing loyal users^ and create / opportunities to ^attract new^ / ^consumers^ to the franchise.”" size={60} weight={300} stagger={0.2} style={{ left: L, top: 430, lineHeight: 1.18 }} />
      <Kicker at={34.4} out={35.8} size={17} style={{ left: L, top: 760, letterSpacing: "0.14em" }}>Ross Conroy · Church & Dwight Oral Care R&D · Workshop invitation, September 18, 2026</Kicker>

      {/* November 9 */}
      <Kicker at={36.2} out={37.9} style={{ left: L, top: 130 }}>Monday · Princeton, New Jersey</Kicker>
      <Punch at={36.05} out={37.9} style={{ left: L, top: 170 }}><div style={serif(230, 300)}>November <i>9</i></div></Punch>
      <Numeral at={38.0} out={39.95} n="01" style={{ left: L - 8, top: 50, lineHeight: 1.1 }} />
      <Kicker at={38.0} out={39.95} style={{ left: L + 300, top: 165 }} color={WHITE}>Signals</Kicker>
      <Words at={38.25} out={39.95} text="Seven signals shaping oral care." size={72} stagger={0.08} style={{ left: L, top: 300 }} />
      <Words at={39.0} out={39.95} text="*You pick three.*" size={72} italicColor={ICE} style={{ left: L, top: 382 }} />

      {/* Flavor School */}
      <Kicker at={40.05} out={43.95} style={{ left: L, top: 250 }}>Flavor School</Kicker>
      <Punch at={40.05} out={43.95} style={{ left: L, top: 290 }}><div style={serif(170, 300)}>Flavor School</div></Punch>
      <Words at={40.9} out={41.95} text="How cooling works." size={76} stagger={0.1} style={{ left: L, top: 520 }} />
      <Words at={42.15} out={43.95} text="How flavor survives *OXYD-8.*" size={76} stagger={0.1} italicColor={ICE} style={{ left: L, top: 520 }} />

      {/* Territories */}
      <Kicker at={44.1} out={49.95} style={{ left: L, top: 90 }} color={WHITE}>02 · Territories · Four platforms</Kicker>
      {[["01", "Plant-Powered Freshness", 44.0], ["02", "Global Brightness", 45.5], ["03", "Modern Clean", 47.0], ["04", "Next-Generation Kids", 48.5]].map(([n, name, t]) => (
        <React.Fragment key={n as string}>
          <Kicker at={(t as number) + 0.02} out={(t as number) + 1.48} style={{ left: L, bottom: 250 }} color={WHITE}>{`Platform ${n}`}</Kicker>
          <Punch at={(t as number) + 0.02} out={(t as number) + 1.48} style={{ left: L, bottom: 80 }}><div style={serif(140, 300)}>{name}</div></Punch>
        </React.Fragment>
      ))}

      {/* Blind tasting */}
      <Kicker at={50.15} out={53.95} style={{ left: 0, right: 0, top: 96, textAlign: "center" }}>Blind tasting · Samples A to D</Kicker>
      <Words at={50.25} out={53.95} text="Blind, *on purpose.*" size={104} stagger={0.1} align="center" style={{ left: 0, right: 0, top: 140 }} />
      <CupCodes />
      <Words at={52.3} out={53.95} text="Made in your Fresh Breath and Kids bases." size={46} stagger={0.05} align="center" style={{ left: 0, right: 0, bottom: 44, color: WHITE }} />

      {/* Concepts */}
      <Kicker at={54.1} out={57.95} style={{ left: 1230, top: 250 }} color={WHITE}>03 · Concepts</Kicker>
      <Words at={54.3} out={57.95} text="Two teams *build.*" size={88} times={[54.3, 54.55, 54.85]} style={{ left: 1230, top: 300, whiteSpace: "nowrap" }} />
      <Words at={55.6} out={57.95} text="Tune on *The Bench.*" size={68} stagger={0.12} italicColor={ICE} style={{ left: 1230, top: 425, whiteSpace: "nowrap" }} />
      <Words at={56.6} out={57.95} text="Pitch. / Vote." size={68} times={[56.6, 57.1]} style={{ left: 1230, top: 520 }} />

      {/* Pipeline */}
      <Kicker at={58.1} out={61.95} style={{ left: L, top: 90 }} color={WHITE}>04 · Pipeline</Kicker>
      <Punch at={59.83} out={61.95} style={{ left: L, top: 130 }}><div style={serif(150, 300)}>Now.</div></Punch>
      <Punch at={60.39} out={61.95} style={{ left: 660, top: 130 }}><div style={serif(150, 300)}>Next.</div></Punch>
      <Punch at={61.03} out={61.95} style={{ left: 1200, top: 130 }}><div style={{ ...serif(150, 300), fontStyle: "italic", color: ICE }}>Future.</div></Punch>
      <Words at={61.2} out={61.95} text="With owners and dates." size={44} stagger={0.05} style={{ left: 1205, top: 320, color: DIM }} />

      {/* By noon */}
      <Kicker at={62.15} out={65.9} style={{ left: L, top: 380 }} color={WHITE}>By noon</Kicker>
      <Words at={62.6} out={65.9} text="A Flavor Playbook, / with *your names* / on the cover." size={66} stagger={0.12} style={{ left: L, top: 430, width: 540 }} />

      {/* Finale */}
      {fr >= f(66.2) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, height: 360, background: "radial-gradient(ellipse at 50% 50%, rgba(4,7,11,.72), rgba(4,7,11,0) 70%)", opacity: interpolate(fr, [f(66.2), f(67.0)], [0, 1], clamp) }} />
      )}
      <Words at={66.35} text="The Future of *Freshness*" size={150} times={[66.35, 66.6, 66.8, 67.0]} align="center" style={{ left: 0, right: 0, top: 410 }} />
      <Sweep at={67.6} dur={1.5} style={{ left: 0, right: 0, top: 410, textAlign: "center" }} textStyle={serif(150, 300)}>The Future of <i>Freshness</i></Sweep>
      <Words at={70.3} text="*Let's build it together.*" size={58} stagger={0.12} italicColor={ICE} align="center" style={{ left: 0, right: 0, top: 600 }} />
      <EndCard />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(71.8), f(71.8) + 22], [0, 1], { ...clamp, easing: ease });
  if (a <= 0) return null;
  return (
    <>
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(4,7,11,.92), rgba(4,7,11,.6) 22%, rgba(4,7,11,0) 42%)", opacity: a }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
      <div style={{ font: `500 19px ${MONO}`, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM }}>Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET · Princeton, New Jersey</div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 34, background: "#fff", padding: "14px 34px", borderRadius: 14, boxShadow: "0 10px 40px rgba(0,0,0,.45)" }}>
        <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 52 }} />
        <span style={{ font: `300 30px ${SANS}`, color: "rgba(11,27,43,.45)" }}>×</span>
        <Img src={staticFile("img/tff-logo.png")} style={{ height: 50 }} />
      </div>
    </div>
    </>
  );
};

/* Grain and vignette tie the generated shots together. */
const Grade: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,.42) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="1920" height="1080"><filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={fr % 24} /></filter><rect width="1920" height="1080" filter="url(#g2)" /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FutureOfFreshnessV2: React.FC = () => {
  loadFonts();
  const fr = useCurrentFrame();
  const inA = interpolate(fr, [0, 10], [1, 0], clamp);
  const outA = interpolate(fr, [f(76.2), FOF2_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: SANS }}>
      {SHOTS.map((s) => <ShotLayer key={s.id} s={s} />)}
      <OnScreen />
      <Light />
      <Grade />
      <AbsoluteFill style={{ background: BG, opacity: Math.max(inA, outA) }} />
    </AbsoluteFill>
  );
};

/* ---------- Hero loop for the site and the pre-brief: the same footage, no words, seamless ---------- */
const LOOP: Shot[] = [
  { id: "l-drip", clip: "drip", from: 0, to: 2.6, start: 1.2, push: 0.03, x: 0 },
  { id: "l-crown", clip: "crown_k4", from: 2.6, to: 5.4, start: 0, push: 0.04, x: 6 },
  { id: "l-ice", clip: "iceburst", from: 5.4, to: 7.2, start: 0.1, push: 0.06, x: 6 },
  { id: "l-swirl", clip: "swirl", from: 7.2, to: 10.4, start: 0.3, push: 0.04, x: 12 },
  { id: "l-herbs", clip: "herbs", from: 10.4, to: 12.4, start: 0.2, push: 0.05, x: 12 },
  { id: "l-citrus", clip: "citrus", from: 12.4, to: 14.2, start: 0.1, push: 0.05, x: 12 },
  { id: "l-spheres", clip: "spheres", from: 14.2, to: 16.2, start: 0.3, push: 0.05, x: 12 },
  { id: "l-prism", clip: "prism", from: 16.2, to: 19.4, start: 0, push: 0.04, x: 12 },
  { id: "l-sphere", clip: "sphere_slow", from: 19.4, to: 24.0, start: 0.5, push: 0.04, x: 14 },
];
const LX = 18;
export const FOF2_LOOP_FRAMES = f(24.0);
export const FutureOfFreshnessV2Loop: React.FC = () => {
  const fr = useCurrentFrame();
  const back = interpolate(fr, [FOF2_LOOP_FRAMES - LX, FOF2_LOOP_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {LOOP.map((s) => <ShotLayer key={s.id} s={s} />)}
      {/* The last frames dissolve into the drip exactly where the loop begins, so the seam disappears. */}
      <Sequence from={FOF2_LOOP_FRAMES - LX} durationInFrames={LX} layout="none">
        <AbsoluteFill style={{ opacity: back }}>
          <OffthreadVideo src={staticFile("fof2/clips/drip.mp4")} muted startFrom={f(1.2) - LX} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>
      <Grade />
    </AbsoluteFill>
  );
};

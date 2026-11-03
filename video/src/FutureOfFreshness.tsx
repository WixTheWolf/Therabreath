import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* The Future of Freshness: the opening film for the pre-brief and the site (about 78 seconds).
   Look: "Clarity, refracted." Clear liquids, color only from light. Cloud Dancer white, deep ink for Flavor School.
   Type matches the site: Newsreader (display), Geist (text), Geist Mono (labels).
   Every line on screen is sourced in docs/fof/SCRIPT.md. Blind: no sample names or ingredients.
   Picture renders muted; the mix (scripts/fof_mix.py) is muxed afterwards from the same timings. */

const FPS = 30;
const f = (t: number) => Math.round(t * FPS);
export const FOF_FRAMES = f(78.5);

const INK = "#0B1B2B";
const CLOUD = "#F0EEE9";
const SERIF = '"Newsreader", Georgia, serif';
const SANS = '"Geist", system-ui, sans-serif';
const MONO = '"Geist Mono", ui-monospace, monospace';
const ease = Easing.bezier(0.2, 0.7, 0.1, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

let fontsLoaded = false;
const loadFonts = () => {
  if (fontsLoaded || typeof document === "undefined") return;
  fontsLoaded = true;
  const handle = delayRender("fof fonts");
  const faces = [
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Geist Mono", `url(${staticFile("fonts/GeistMono-Variable.woff2")})`, { weight: "100 900" }),
  ];
  Promise.all(faces.map((x) => x.load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(handle)).catch(() => continueRender(handle));
};

/* ---------- Picture timeline (seconds) ---------- */
type Kind = "video" | "glasses" | "quote" | "cover" | "finale";
type Shot = { id: string; kind: Kind; from: number; to: number; clip?: string; start?: number; rate?: number; push?: number; x?: number };
const X = 8; // default cross-dissolve, frames
const SHOTS: Shot[] = [
  { id: "drip", kind: "video", clip: "drip", from: 0, to: 3.6, start: 0.5, push: 0.03 },
  { id: "crown", kind: "video", clip: "crown", from: 3.6, to: 7.0, start: 0, push: 0.03, x: 0 },
  { id: "swirl", kind: "video", clip: "swirl", from: 7.0, to: 11.1, start: 0.4, push: 0.02 },
  { id: "glasses", kind: "glasses", from: 11.1, to: 18.9 },
  { id: "droplets", kind: "video", clip: "droplets", from: 18.9, to: 24.7, start: 0, rate: 0.87, push: 0.02 },
  { id: "lab", kind: "video", clip: "lab", from: 24.7, to: 29.0, start: 0.3, push: 0.015 },
  { id: "mintcube", kind: "video", clip: "mintcube", from: 29.0, to: 32.4, start: 0, push: 0.02 },
  { id: "quote", kind: "quote", from: 32.4, to: 37.9 },
  { id: "prism", kind: "video", clip: "prism", from: 37.9, to: 42.8, start: 0.1, push: 0.02 },
  { id: "frost", kind: "video", clip: "frost", from: 42.8, to: 45.4, start: 1.0, push: 0.03 },
  { id: "bubbles", kind: "video", clip: "bubbles", from: 45.4, to: 48.1, start: 0.5, push: 0.03, x: 6 },
  { id: "herbs", kind: "video", clip: "herbs", from: 48.1, to: 49.4, start: 0.5, push: 0.03, x: 4 },
  { id: "citrus", kind: "video", clip: "citrus", from: 49.4, to: 50.7, start: 0.5, push: 0.03, x: 4 },
  { id: "cucumber", kind: "video", clip: "cucumber", from: 50.7, to: 52.0, start: 0.8, push: 0.03, x: 4 },
  { id: "marbles", kind: "video", clip: "marbles", from: 52.0, to: 53.3, start: 0, push: 0.02, x: 4 },
  { id: "cups", kind: "video", clip: "cups", from: 53.3, to: 56.8, start: 0.5, push: 0 },
  { id: "hands", kind: "video", clip: "hands", from: 56.8, to: 60.5, start: 0.6, push: 0.02 },
  { id: "vessels", kind: "video", clip: "vessels", from: 60.5, to: 66.0, start: 0, rate: 0.92, push: 0.01 },
  { id: "book", kind: "video", clip: "book", from: 66.0, to: 68.1, start: 1.0, push: 0.02 },
  { id: "cover", kind: "cover", from: 68.1, to: 71.3 },
  { id: "finale", kind: "finale", from: 71.3, to: 78.5 },
];

/* ---------- Shared type ---------- */
const Rise: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ at, out, children, style, dur = 20 }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(at), f(at) + dur], [0, 1], { ...clamp, easing: ease });
  const o = out === undefined ? 1 : interpolate(fr, [f(out) - 10, f(out)], [1, 0], clamp);
  if (a <= 0 || o <= 0) return null;
  return <div style={{ position: "absolute", opacity: a * o, transform: `translateY(${(1 - a) * 18}px)`, filter: `blur(${(1 - a) * 6}px)`, ...style }}>{children}</div>;
};
const kicker = (color: string): React.CSSProperties => ({ font: `500 21px ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", color });
const serif = (size: number, color: string, weight = 300): React.CSSProperties => ({ font: `${weight} ${size}px/1.04 ${SERIF}`, fontVariationSettings: '"opsz" 72', letterSpacing: "-0.022em", color });

/* ---------- Shots ---------- */
const VideoShot: React.FC<{ s: Shot; len: number }> = ({ s, len }) => {
  const fr = useCurrentFrame();
  const scale = 1 + (s.push ?? 0.02) * (fr / len);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <OffthreadVideo src={staticFile(`fof/clips/${s.clip}.mp4`)} muted startFrom={f(s.start ?? 0)} playbackRate={s.rate ?? 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

/* Two glasses fill to exactly 65% and 14% of their inner height (measured from the stills: inner base y 847, rim y 204). */
const G = { base: 847.1, rim: 204.3, imgTop: -2.86, imgW: 1920, imgH: 1085.7 };
const GLASS = [
  { x: 1111, w: 222, target: 0.65, t0: 1.2, t1: 2.6, cx: 1222, label: "Mouthwash category" },
  { x: 1477, w: 217, target: 0.14, t0: 6.1, t1: 7.0, cx: 1586, label: "TheraBreath" },
];
const Glasses: React.FC<{ len: number }> = ({ len }) => {
  const fr = useCurrentFrame();
  const push = 1 + 0.03 * (fr / len);
  const inner = G.base - G.rim;
  return (
    <AbsoluteFill style={{ background: CLOUD }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "1400px 520px" }}>
        <Img src={staticFile("fof/img/glasses_empty.jpg")} style={{ position: "absolute", left: 0, top: G.imgTop, width: G.imgW, height: G.imgH }} />
        {GLASS.map((g) => {
          const p = interpolate(fr, [f(g.t0), f(g.t1)], [0, g.target], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
          if (p <= 0.002) return null;
          const top = G.base - inner * p;
          return (
            <React.Fragment key={g.x}>
              <div style={{ position: "absolute", left: g.x, top, width: g.w, height: G.base - top, overflow: "hidden" }}>
                <Img src={staticFile("fof/img/glasses_full.jpg")} style={{ position: "absolute", left: -g.x, top: G.imgTop - top, width: G.imgW, height: G.imgH }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(191,233,242,.22), rgba(191,233,242,.10) 40%, rgba(108,199,221,.12))" }} />
              </div>
              <div style={{ position: "absolute", left: g.x, top: top - 3, width: g.w, height: 7, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(11,27,43,.28) 45%, rgba(255,255,255,.85) 62%, rgba(255,255,255,0))", borderRadius: 4 }} />
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
      {GLASS.map((g) => {
        const v = interpolate(fr, [f(g.t0), f(g.t1)], [0, g.target * 100], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
        const a = interpolate(fr, [f(g.t0) - 8, f(g.t0) + 8], [0, 1], clamp);
        return (
          <div key={g.cx} style={{ position: "absolute", left: g.cx - 160, width: 320, top: 22, textAlign: "center", opacity: a }}>
            <div style={{ ...serif(118, INK), letterSpacing: "-0.04em" }}>{Math.round(v)}<span style={{ fontSize: 54, verticalAlign: "0.9em", marginLeft: 4 }}>%</span></div>
            <div style={{ ...kicker("rgba(11,27,43,.62)"), fontSize: 17, marginTop: 8 }}>{g.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* Ross's words, verbatim, with the source. */
const Quote: React.FC = () => {
  const fr = useCurrentFrame();
  const drift = fr / FPS;
  return (
    <AbsoluteFill style={{ background: CLOUD, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1400, height: 900, left: 700 + drift * 30, top: -200, borderRadius: "50%", filter: "blur(120px)", opacity: 0.55, background: "conic-gradient(from 200deg, rgba(191,233,242,.9), rgba(244,184,96,.45), rgba(224,64,123,.25), rgba(143,175,151,.5), rgba(191,233,242,.9))", transform: `rotate(${drift * 6}deg)` }} />
      <div style={{ position: "absolute", width: 900, height: 600, left: -200, top: 620 - drift * 18, borderRadius: "50%", filter: "blur(110px)", opacity: 0.35, background: "radial-gradient(circle, rgba(108,199,221,.8), rgba(240,238,233,0) 70%)" }} />
    </AbsoluteFill>
  );
};

/* The Playbook cover that assembles at the close: co-author lines are left blank because the room fills them in. */
const Cover: React.FC<{ len: number }> = ({ len }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 18], [0, 1], { ...clamp, easing: ease });
  const rot = interpolate(fr, [0, len], [-14, -6]);
  const lines = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ background: CLOUD, perspective: 2200 }}>
      <div style={{ position: "absolute", left: 1010, top: 110, width: 640, height: 860, transform: `rotateY(${rot}deg) rotateX(4deg) translateY(${(1 - a) * 40}px)`, opacity: a, background: "#FBFAF6", borderRadius: 6, boxShadow: "0 40px 90px rgba(11,27,43,.18), 0 6px 18px rgba(11,27,43,.08)", padding: "64px 58px", boxSizing: "border-box", color: INK }}>
        <div style={{ ...kicker("rgba(11,27,43,.55)"), fontSize: 15 }}>TheraBreath × The Flavor Factory</div>
        <div style={{ ...serif(70, INK), marginTop: 70 }}>The TheraBreath<br /><i>Flavor Playbook</i></div>
        <div style={{ display: "inline-block", marginTop: 34, padding: "8px 16px", border: "1px solid rgba(11,27,43,.3)", borderRadius: 999, font: `500 16px ${MONO}`, letterSpacing: "0.1em" }}>v0.1</div>
        <div style={{ position: "absolute", left: 58, right: 58, top: 470, height: 2, background: "linear-gradient(90deg, #BFE9F2, #F4B860, #E0407B, #8FAF97, #6CC7DD)" }} />
        <div style={{ position: "absolute", left: 58, top: 506, ...serif(28, INK, 400), fontStyle: "italic" }}>Co-authored November 9, 2026</div>
        <div style={{ position: "absolute", left: 58, top: 548, ...kicker("rgba(11,27,43,.5)"), fontSize: 14 }}>Princeton, New Jersey</div>
        <div style={{ position: "absolute", left: 58, top: 626, ...kicker("rgba(11,27,43,.5)"), fontSize: 13 }}>Co-authors</div>
        {lines.map((i) => {
          const t0 = f(0.5) + i * 6;
          const w = interpolate(fr, [t0, t0 + 14], [0, 1], { ...clamp, easing: ease });
          return <div key={i} style={{ position: "absolute", left: 58 + (i % 2) * 272, top: 680 + Math.floor(i / 2) * 52, width: 240 * w, height: 1.5, background: "rgba(11,27,43,.45)" }} />;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ len: number }> = ({ len }) => {
  const fr = useCurrentFrame();
  const push = 1 + 0.05 * (fr / len);
  return (
    <AbsoluteFill style={{ background: CLOUD }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <OffthreadVideo src={staticFile("fof/clips/sphere_slow.mp4")} muted style={{ width: 1920, height: 1080, objectFit: "cover" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- Words on screen (film seconds) ---------- */
const Words: React.FC = () => {
  const dark = "rgba(11,27,43,.62)";
  const L = 140;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Open and thesis */}
      <Rise at={0.5} out={3.4} style={{ left: L, bottom: 120 }}><div style={kicker(dark)}>TheraBreath × The Flavor Factory</div></Rise>
      <Rise at={1.65} out={5.0} style={{ left: L, top: 430, width: 900 }}><div style={serif(92, INK)}>TheraBreath took away the burn.</div></Rise>
      <Rise at={5.15} out={10.9} style={{ left: L, top: 430, width: 900 }}><div style={serif(92, INK)}>Now let&rsquo;s add the <i>want.</i></div></Rise>

      {/* The gap */}
      <Rise at={11.5} out={18.8} style={{ left: L, top: 400, width: 700 }}>
        <div style={kicker(dark)}>The gap · Household penetration</div>
        <div style={{ ...serif(46, INK), marginTop: 26, maxWidth: 640 }}>Mouthwash is in 65 of every 100 US homes. TheraBreath is in 14.</div>
      </Rise>
      <Rise at={12.0} out={18.8} style={{ left: L, bottom: 70 }}><div style={{ ...kicker("rgba(11,27,43,.5)"), fontSize: 16, letterSpacing: "0.08em", textTransform: "none" }}>Source: Church &amp; Dwight Q2 2026 earnings call, July 31, 2026</div></Rise>

      {/* 86 */}
      <Rise at={19.5} out={24.6} style={{ left: L, top: 330, width: 1000 }}><div style={{ ...serif(84, INK), textShadow: "0 2px 30px rgba(240,238,233,.9)" }}><span style={{ fontWeight: 400 }}>86</span> of every 100 US households have not met TheraBreath yet.</div></Rise>
      <Rise at={21.5} out={24.6} style={{ left: L, top: 640, width: 1000 }}><div style={{ ...serif(56, INK), fontStyle: "italic", textShadow: "0 2px 30px rgba(240,238,233,.9)" }}>Flavor is how we introduce ourselves.</div></Rise>

      {/* July */}
      <Rise at={25.0} out={28.9} style={{ left: L, bottom: 150 }}>
        <div style={{ ...kicker("rgba(255,255,255,.85)") }}>July 2026 · Norco, California</div>
        <div style={{ ...serif(76, "#fff"), marginTop: 18, textShadow: "0 4px 40px rgba(0,0,0,.35)" }}>You came to see who we are.</div>
      </Rise>

      {/* The brief */}
      <Rise at={29.5} out={32.4} style={{ left: L, top: 460 }}><div style={kicker(dark)}>Your brief</div><div style={{ ...serif(66, INK), marginTop: 20 }}>Now you&rsquo;ve asked for more.</div></Rise>
      <Rise at={32.55} out={37.85} style={{ left: L, top: 250 }}><div style={kicker(dark)}>New flavor experiences that both</div></Rise>
      <Rise at={32.75} out={37.85} style={{ left: L, top: 320, width: 1560 }}><div style={serif(74, INK)}>&ldquo;strengthen our appeal with existing loyal users</div></Rise>
      <Rise at={35.2} out={37.85} style={{ left: L, top: 425, width: 1560 }}><div style={serif(74, INK)}>and create opportunities to <i>attract new consumers</i> to the franchise.&rdquo;</div></Rise>
      <Rise at={35.9} out={37.85} style={{ left: L, top: 660 }}><div style={{ ...kicker("rgba(11,27,43,.55)"), fontSize: 17 }}>Ross Conroy · Church &amp; Dwight Oral Care R&amp;D · Workshop invitation, September 18, 2026</div></Rise>

      {/* November 9: Signals */}
      <Rise at={38.5} out={42.75} style={{ left: L, top: 690 }}><div style={kicker(dark)}>Monday, November 9 · Chapter 1 · Signals</div></Rise>
      <Rise at={40.1} out={42.75} style={{ left: L, top: 750, width: 1500 }}><div style={serif(84, INK)}>Seven signals shaping oral care.</div></Rise>
      <Rise at={41.3} out={42.75} style={{ left: L, top: 860 }}><div style={{ ...serif(48, INK), fontStyle: "italic" }}>You pick three.</div></Rise>

      {/* Flavor School */}
      <Rise at={43.0} out={48.0} style={{ left: L, top: 380 }}><div style={kicker("rgba(191,233,242,.9)")}>Flavor School</div></Rise>
      <Rise at={44.2} out={45.35} style={{ left: L, top: 440 }}><div style={serif(88, "#fff")}>How cooling works.</div></Rise>
      <Rise at={45.45} out={48.0} style={{ left: L, top: 440, width: 900 }}><div style={serif(88, "#fff")}>How flavor survives OXYD-8.</div></Rise>

      {/* Territories */}
      <Rise at={48.2} out={53.25} style={{ left: L, top: 120 }}><div style={{ ...kicker("rgba(255,255,255,.92)"), textShadow: "0 2px 18px rgba(0,0,0,.35)" }}>Chapter 2 · Territories · Four platforms</div></Rise>
      {[
        { at: 48.15, out: 49.4, n: "01", name: "Plant-Powered Freshness" },
        { at: 49.45, out: 50.7, n: "02", name: "Global Brightness" },
        { at: 50.75, out: 52.0, n: "03", name: "Modern Clean" },
        { at: 52.05, out: 53.25, n: "04", name: "Next-Generation Kids" },
      ].map((p) => (
        <Rise key={p.n} at={p.at} out={p.out} dur={10} style={{ left: L, bottom: 120 }}>
          <div style={{ ...kicker("rgba(255,255,255,.9)"), textShadow: "0 2px 14px rgba(0,0,0,.4)" }}>{p.n}</div>
          <div style={{ ...serif(96, "#fff"), marginTop: 10, textShadow: "0 4px 40px rgba(0,0,0,.45)" }}>{p.name}</div>
        </Rise>
      ))}

      {/* Blind tasting */}
      <Rise at={53.5} out={56.75} style={{ left: L, top: 130 }}><div style={kicker(dark)}>Blind tasting · Samples A to D</div></Rise>
      <CupCodes />
      <Rise at={55.0} out={56.75} style={{ left: L, top: 880, width: 1700 }}><div style={serif(54, INK)}>Made in your Fresh Breath and Kids bases.</div></Rise>

      {/* Concepts */}
      <Rise at={57.0} out={60.45} style={{ left: L, bottom: 200 }}><div style={{ ...kicker("rgba(255,255,255,.9)"), textShadow: "0 2px 14px rgba(0,0,0,.4)" }}>Chapter 3 · Concepts</div></Rise>
      <Rise at={57.7} out={60.45} style={{ left: L, bottom: 110, width: 1700 }}><div style={{ ...serif(64, "#fff"), whiteSpace: "nowrap", textShadow: "0 4px 40px rgba(0,0,0,.45)" }}>Two teams build. Tune on <i>The Bench.</i> Pitch. Vote.</div></Rise>

      {/* Pipeline */}
      <Rise at={60.8} out={65.95} style={{ left: L, top: 130 }}><div style={kicker(dark)}>Chapter 4 · Pipeline</div></Rise>
      {[{ t: 62.2, w: "Now", x: 0 }, { t: 62.8, w: "Next", x: 330 }, { t: 63.5, w: "Future", x: 660 }].map((h) => (
        <Rise key={h.w} at={h.t} out={65.95} dur={14} style={{ left: L + h.x, top: 190 }}><div style={serif(110, INK)}>{h.w}</div></Rise>
      ))}
      <Rise at={64.25} out={65.95} style={{ left: L, top: 340 }}><div style={{ ...serif(48, INK), fontStyle: "italic" }}>With owners and dates.</div></Rise>

      {/* By noon */}
      <Rise at={66.3} out={71.25} style={{ left: L, top: 420 }}><div style={kicker(dark)}>By noon</div></Rise>
      <Rise at={67.3} out={71.25} style={{ left: L, top: 480, width: 780 }}><div style={serif(80, INK)}>A Flavor Playbook with <i>your names</i> on the cover.</div></Rise>

      {/* Finale */}
      <Rise at={71.75} dur={26} style={{ left: 0, right: 0, top: 468, textAlign: "center" }}><div style={{ ...serif(124, INK), letterSpacing: "-0.035em" }}>The Future of Freshness</div></Rise>
      <Rise at={74.1} style={{ left: 0, right: 0, top: 622, textAlign: "center" }}><div style={{ ...serif(44, INK), fontStyle: "italic" }}>Let&rsquo;s build it together.</div></Rise>
      <EndCard />
    </AbsoluteFill>
  );
};

/* Codes ride under each cup (positions measured in the clip; the camera pushes in slightly). */
const CupCodes: React.FC = () => {
  const fr = useCurrentFrame();
  const t = interpolate(fr, [f(53.3), f(56.8)], [0, 1], clamp);
  const xs0 = [339, 753, 1161, 1569], xs1 = [315, 754, 1167, 1591];
  return (
    <>
      {"ABCD".split("").map((c, i) => {
        const x = xs0[i] + (xs1[i] - xs0[i]) * t;
        const a = interpolate(fr, [f(53.8 + i * 0.22), f(53.8 + i * 0.22) + 12], [0, 1], { ...clamp, easing: ease });
        const o = interpolate(fr, [f(56.75) - 8, f(56.75)], [1, 0], clamp);
        if (fr < f(53.3) || fr > f(56.8)) return null;
        return <div key={c} style={{ position: "absolute", left: x - 40, width: 80, top: 700 + (1 - a) * 14, textAlign: "center", opacity: a * o, font: `500 44px ${MONO}`, color: INK }}>{c}</div>;
      })}
    </>
  );
};

const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [f(75.3), f(75.3) + 22], [0, 1], { ...clamp, easing: ease });
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 878, display: "flex", flexDirection: "column", alignItems: "center", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
      <div style={{ ...kicker("rgba(11,27,43,.62)"), fontSize: 18, letterSpacing: "0.14em" }}>Monday, November 9, 2026 | 10:00 AM to 12:00 PM ET · Princeton, New Jersey</div>
      <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 34, background: "#fff", padding: "14px 34px", borderRadius: 14, boxShadow: "0 10px 30px rgba(11,27,43,.08)" }}>
        <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 52 }} />
        <span style={{ font: `300 30px ${SANS}`, color: "rgba(11,27,43,.45)" }}>×</span>
        <Img src={staticFile("img/tff-logo.png")} style={{ height: 50 }} />
      </div>
    </div>
  );
};

/* Ink shots get a gentle left scrim; bright photos get a soft lower scrim so white type holds. */
const SCRIM: Record<string, string> = {
  lab: "linear-gradient(0deg, rgba(10,16,24,.62), rgba(10,16,24,0) 55%)",
  herbs: "linear-gradient(0deg, rgba(8,20,16,.55), rgba(8,20,16,0) 50%), linear-gradient(180deg, rgba(8,20,16,.35), rgba(8,20,16,0) 25%)",
  citrus: "linear-gradient(0deg, rgba(40,40,10,.55), rgba(40,40,10,0) 50%), linear-gradient(180deg, rgba(20,30,40,.35), rgba(20,30,40,0) 25%)",
  cucumber: "linear-gradient(0deg, rgba(10,30,20,.55), rgba(10,30,20,0) 50%), linear-gradient(180deg, rgba(10,30,20,.35), rgba(10,30,20,0) 25%)",
  marbles: "linear-gradient(0deg, rgba(30,20,40,.55), rgba(30,20,40,0) 50%), linear-gradient(180deg, rgba(30,20,40,.35), rgba(30,20,40,0) 25%)",
  hands: "linear-gradient(0deg, rgba(20,14,8,.86), rgba(20,14,8,.55) 30%, rgba(20,14,8,0) 62%)",
  droplets: "linear-gradient(90deg, rgba(240,238,233,.78), rgba(240,238,233,.35) 55%, rgba(240,238,233,0) 80%)",
  prism: "linear-gradient(0deg, rgba(240,238,233,.7), rgba(240,238,233,0) 45%)",
  vessels: "linear-gradient(180deg, rgba(240,238,233,.8), rgba(240,238,233,0) 45%)",
  book: "linear-gradient(90deg, rgba(240,238,233,.85), rgba(240,238,233,0) 60%)",
  mintcube: "linear-gradient(90deg, rgba(240,238,233,.6), rgba(240,238,233,0) 55%)",
};

const ShotLayer: React.FC<{ s: Shot; i: number }> = ({ s, i }) => {
  const xin = i === 0 ? 0 : s.x ?? X;
  const len = f(s.to) - f(s.from);
  return (
    <Sequence from={f(s.from) - xin} durationInFrames={len + xin + X} layout="none">
      <Fade xin={xin}>
        {s.kind === "video" && <VideoShot s={s} len={len} />}
        {s.kind === "glasses" && <Glasses len={len} />}
        {s.kind === "quote" && <Quote />}
        {s.kind === "cover" && <Cover len={len} />}
        {s.kind === "finale" && <Finale len={len} />}
        {SCRIM[s.id] && <AbsoluteFill style={{ background: SCRIM[s.id] }} />}
      </Fade>
    </Sequence>
  );
};
const Fade: React.FC<{ xin: number; children: React.ReactNode }> = ({ xin, children }) => {
  const fr = useCurrentFrame();
  const op = xin ? interpolate(fr, [0, xin], [0, 1], clamp) : 1;
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

/* Film grain and a soft vignette tie the generated shots together. */
const Grade: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 62%, rgba(11,27,43,.16) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width="1920" height="1080"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={fr % 24} /></filter><rect width="1920" height="1080" filter="url(#g)" /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FutureOfFreshness: React.FC = () => {
  loadFonts();
  const fr = useCurrentFrame();
  const inA = interpolate(fr, [0, 14], [1, 0], clamp);
  const outA = interpolate(fr, [FOF_FRAMES - 20, FOF_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: CLOUD, fontFamily: SANS }}>
      {SHOTS.map((s, i) => <ShotLayer key={s.id} s={s} i={i} />)}
      <Words />
      <Grade />
      <AbsoluteFill style={{ background: CLOUD, opacity: Math.max(inA, outA) }} />
    </AbsoluteFill>
  );
};

/* ---------- Hero loop for the site and the pre-brief: the same footage, no words, seamless ---------- */
const LOOP: Shot[] = [
  { id: "drip", kind: "video", clip: "drip", from: 0, to: 2.6, start: 1.1, push: 0.02 },
  { id: "crown", kind: "video", clip: "crown", from: 2.6, to: 5.6, start: 0, push: 0.02 },
  { id: "swirl", kind: "video", clip: "swirl", from: 5.6, to: 8.6, start: 0.4, push: 0.02 },
  { id: "mintcube", kind: "video", clip: "mintcube", from: 8.6, to: 11.6, start: 0, push: 0.02 },
  { id: "prism", kind: "video", clip: "prism", from: 11.6, to: 14.6, start: 0.2, push: 0.02 },
  { id: "droplets", kind: "video", clip: "droplets", from: 14.6, to: 17.6, start: 0.3, push: 0.02 },
  { id: "cucumber", kind: "video", clip: "cucumber", from: 17.6, to: 20.6, start: 0.6, push: 0.02 },
  { id: "vessels", kind: "video", clip: "vessels", from: 20.6, to: 23.4, start: 0.5, push: 0.02 },
  { id: "sphere", kind: "video", clip: "sphere_slow", from: 23.4, to: 26.0, start: 0, push: 0.02 },
];
const LX = 18;
export const FOF_LOOP_FRAMES = f(26.0);
export const FutureOfFreshnessLoop: React.FC = () => {
  const fr = useCurrentFrame();
  const back = interpolate(fr, [FOF_LOOP_FRAMES - LX, FOF_LOOP_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: CLOUD }}>
      {LOOP.map((s, i) => {
        const xin = i === 0 ? 0 : LX;
        const len = f(s.to) - f(s.from);
        return (
          <Sequence key={s.id} from={f(s.from) - xin} durationInFrames={len + xin + LX} layout="none">
            <Fade xin={xin}><VideoShot s={s} len={len} /></Fade>
          </Sequence>
        );
      })}
      {/* The last LX frames dissolve into the drip exactly where the loop begins, so the seam disappears. */}
      <Sequence from={FOF_LOOP_FRAMES - LX} durationInFrames={LX} layout="none">
        <AbsoluteFill style={{ opacity: back }}>
          <OffthreadVideo src={staticFile("fof/clips/drip.mp4")} muted startFrom={f(1.1) - LX} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

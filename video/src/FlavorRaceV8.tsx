import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 8.
   Told the way Pixar tells a story: almost wordless, carried by picture and one continuous score.
   Cold open in The Flavor Factory command center: a go / no-go poll with one very long pause, then a big red button.
   Then a rocket. It raced the rival side by side, until the rival pulled ahead.
   So Flavor Control went looking for something new, from everywhere on Earth. Because of that, TheraBreath One
   found a new burn, the rival smoked out and fell behind, and the Flavor landed first. Then it came home to be tasted.
   A handful of radio lines, most of them jokes. No faces. Every hero shot is the locked bottle: white, short ribbed orange cap.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const MONUMENT = '"Archivo", "Arial Narrow", sans-serif'; // condensed theatrical titles
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const IVORY = "#F4EDE0";
const ease = Easing.bezier(0.2, 0.7, 0.1, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

let loaded = false;
const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  [
    new FontFace("Archivo", `url(${staticFile("fonts/archivo-normal-latin.woff2")})`, { weight: "100 900", stretch: "62% 125%" }),
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("JetBrains Mono", `url(${staticFile("fonts/jetbrainsmono-latin.woff2")})`, { weight: "400 800" }),
  ].forEach((ff) => document.fonts.add(ff));
};

type Seg =
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; rate?: number; x?: number }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "card"; lines: string[]; size?: number; slam?: boolean }
  | { id: string; dur: number; kind: "logos" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. FLAVOR CONTROL, 0400: go / no-go, one pause too long, and the big red button
  { id: "black0", dur: 0.6, kind: "black" },
  { id: "mcwide", dur: 3.4, kind: "clip", clip: "v_mc", from: 0.2, zoom: [1.0, 1.04] },
  { id: "room", dur: 1.8, kind: "clip", clip: "k/n21_glass", from: 2.5 },
  { id: "lean", dur: 3.0, kind: "clip", clip: "v_mc", from: 4.4, zoom: [1.04, 1.1] },
  { id: "flight", dur: 2.6, kind: "clip", clip: "k/n21_glass", from: 12.4, zoom: [1.0, 1.05] },
  { id: "palm", dur: 1.35, kind: "clip", clip: "k/n21_glass", from: 9.6 },
  { id: "button", dur: 0.6, kind: "clip", clip: "k/n02_mctense", from: 4.02, zoom: [1.0, 1.05] },
  { id: "pad", dur: 2.4, kind: "clip", clip: "w/s2_pad", from: 0.6 },
  { id: "tilt", dur: 5.4, kind: "clip", clip: "w/c1_tease", from: 5.2, zoom: [1.0, 1.04] },
  { id: "rival", dur: 2.6, kind: "clip", clip: "w/s2_pad", from: 3.15 },
  { id: "title", dur: 3.2, kind: "clip", clip: "v_reveal", from: 6.7 },
  // II. COUNTDOWN: machines only, faster and closer, then silence
  { id: "gauge", dur: 1.7, kind: "clip", clip: "k3a_ignite", from: 0.3, zoom: [1.04, 1.1] },
  { id: "caps", dur: 1.3, kind: "clip", clip: "k3a_ignite", from: 4.7, zoom: [1.04, 1.1] },
  { id: "cap", dur: 1.2, kind: "clip", clip: "v_cap", from: 8.3, zoom: [1.06, 1.12] },
  { id: "spark", dur: 1.2, kind: "clip", clip: "k/n18_nozzle", from: 0.45, zoom: [1.0, 1.08] },
  { id: "hush", dur: 0.45, kind: "black" },
  // III. LIFTOFF
  { id: "bell", dur: 2.1, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.25 },
  { id: "thunder", dur: 2.5, kind: "clip", clip: "w/s4_ignite", from: 0.3, shake: 0 },
  { id: "crowd", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 5.4 },
  { id: "lift", dur: 3.6, kind: "clip", clip: "s02_launch", from: 6.2, shake: 0 },
  { id: "breach", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 11.8 },
  { id: "climb", dur: 3.4, kind: "clip", clip: "v_clouds", from: 6.0, x: 0.6 },
  // IV. THE RACE: side by side, until the rival pulls ahead
  { id: "scale", dur: 2.3, kind: "clip", clip: "w/x_drift", from: 4.3, x: 0.8 },
  { id: "race", dur: 3.6, kind: "clip", clip: "w/c4_race", from: 0.5 },
  { id: "shoulder", dur: 3.6, kind: "clip", clip: "s03_orbit", from: 2.4 },
  { id: "pass", dur: 2.6, kind: "clip", clip: "w/s5_dog", from: 3.6 },
  // V. SOMETHING NEW, FROM EVERYWHERE
  { id: "hands", dur: 1.3, kind: "clip", clip: "w/s6_bland", from: 11.6 },
  { id: "fruit", dur: 1.4, kind: "clip", clip: "w/s6_bland", from: 9.4 },
  { id: "yuzu", dur: 1.8, kind: "clip", clip: "k/n08_yuzu", from: 2.4 },
  { id: "rose", dur: 1.2, kind: "clip", clip: "k/n05_rose", from: 0.6 },
  { id: "tea", dur: 1.1, kind: "clip", clip: "k/n06_tea", from: 1.2 },
  { id: "launchI", dur: 1.8, kind: "clip", clip: "v_ingr", from: 0.5 },
  { id: "circle", dur: 1.8, kind: "clip", clip: "k/n29_earth", from: 8.3 },
  { id: "ring", dur: 3.0, kind: "clip", clip: "k/n29_earth", from: 10.6, x: 0.3 },
  { id: "through", dur: 2.6, kind: "clip", clip: "w/x_globe", from: 2.2 },
  { id: "relight", dur: 1.4, kind: "clip", clip: "w/x_reentrypov", from: 9.7, zoom: [1.08, 1.0] },
  { id: "blast", dur: 1.9, kind: "clip", clip: "w/s8_teams", from: 10.4, shake: 0.1 },
  // VI. PLAN A SMOKES OUT AND FALLS BEHIND
  { id: "sputter", dur: 2.6, kind: "clip", clip: "w/s6_comp", from: 6.0, zoom: [1.0, 1.05] },
  { id: "smoke", dur: 3.6, kind: "clip", clip: "w/c5_comp", from: 0.3 },
  { id: "adrift", dur: 2.5, kind: "clip", clip: "w/s6_comp", from: 12.1 },
  { id: "bolt", dur: 2.0, kind: "clip", clip: "k/n23_bolt2", from: 9.4 },
  { id: "tomoon", dur: 2.4, kind: "clip", clip: "v_break", from: 7.1 },
  // VII. THE FLAVOR HAS LANDED
  { id: "approach", dur: 2.6, kind: "clip", clip: "v_moonfall", from: 0.6, x: 0.5 },
  { id: "land", dur: 4.2, kind: "clip", clip: "w/c7_flag", from: 0.0 },
  { id: "foot", dur: 1.8, kind: "clip", clip: "k/n14_dust", from: 3.8 },
  { id: "flag", dur: 6.2, kind: "clip", clip: "w/c7_flag", from: 6.0, zoom: [1.0, 1.05] },
  { id: "earthrise", dur: 5.6, kind: "clip", clip: "s08_earth", from: 3.4, x: 0.8 },
  // VIII. HOME
  { id: "liftoff", dur: 2.5, kind: "clip", clip: "w/s8_teams", from: 0.1, shake: 0.1 },
  { id: "homeward", dur: 2.1, kind: "clip", clip: "k/n27_home", from: 7.48 },
  { id: "reentry", dur: 2.75, kind: "clip", clip: "w/x_reentrypov", from: 0.1, shake: 0 },
  { id: "descent", dur: 2.95, kind: "clip", clip: "k/n11_nj1", from: 1.8 },
  { id: "touchhome", dur: 3.2, kind: "clip", clip: "s11_hq", from: 1.2 },
  { id: "hatch", dur: 3.2, kind: "clip", clip: "s12_hatch", from: 2.6, zoom: [1.0, 1.06] },
  { id: "tray", dur: 4.4, kind: "clip", clip: "s12b_tray", from: 0.6 },
  { id: "cups", dur: 3.0, kind: "clip", clip: "w/x_tray", from: 10.2 },
  { id: "end", dur: 4.6, kind: "end" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE8_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur + (sg.x || 0));
  const fade = sg.x ? interpolate(fr, [0, f(sg.x)], [0, 1], clamp) : 1;
  const [z0, z1] = sg.zoom || [1.0, 1.035];
  const z = interpolate(fr, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sg.shake !== undefined) {
    const k = fr - f(sg.shake + (sg.x || 0));
    const amp = k < 0 ? 0 : 16 * Math.exp(-k / 26);
    dx = Math.sin(k * 2.3) * amp; dy = Math.cos(k * 3.1) * amp;
  }
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${dx}px, ${dy}px) scale(${z})` }}>
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

// Monumental theatrical title: condensed, enormous, generous tracking
const Card: React.FC<{ lines: string[]; size?: number; dur: number; slam?: boolean }> = ({ lines, size = 220, dur, slam }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, slam ? 1 : 6, dur - (slam ? 3 : 6), dur], [0, 1, 1, 0], clamp);
  const sc = slam ? interpolate(fr, [0, 5], [1.12, 1], { ...clamp, easing: ease }) : interpolate(fr, [0, dur], [1.0, 1.035]);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a, transform: `scale(${sc})`, textAlign: "center", color: IVORY }}>
        {lines.map((l) => (
          <div key={l} style={{ font: `800 ${size}px/0.92 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Smaller in-picture title (over footage)
const Overlay: React.FC<{ text: string; dur: number; size?: number; y?: number; monument?: boolean }> = ({ text, dur, size = 46, y = 0, monument }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse 70% 34% at 50% ${50 + y / 10.8}%, rgba(0,0,0,${0.45 * a}), rgba(0,0,0,0))` }}>
      <div style={{ opacity: a, transform: `translateY(${y}px)`, color: IVORY, textAlign: "center", whiteSpace: "pre-line", ...(monument ? { font: `800 ${size}px/0.95 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.05em" } : { font: `500 ${size}px ${SANS}`, letterSpacing: "0.34em", paddingLeft: "0.34em" }), textShadow: "0 6px 40px rgba(0,0,0,.6)" }}>{text}</div>
    </AbsoluteFill>
  );
};

const TasteSign: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const rot = interpolate(fr, [6, 22], [88, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 190, perspective: 1400 }}>
      <div style={{ transform: `rotateY(${rot}deg)`, background: "#fff", color: "#0B2236", padding: "22px 54px 26px", borderRadius: 6, borderTop: "10px solid #F58025", boxShadow: "0 30px 80px rgba(0,0,0,.45)" }}>
        <div style={{ font: `700 64px ${SANS}`, letterSpacing: "0.06em" }}>WOULD YOU LIKE TO TASTE IT?</div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 2], [0, 1], clamp);
  const sc = interpolate(fr, [0, 7], [1.14, 1], { ...clamp, easing: ease });
  const b = interpolate(fr, [f(1.0), f(1.5)], [0, 1], clamp);
  const c = interpolate(fr, [f(1.8), f(2.3)], [0, 1], clamp);
  const out = interpolate(fr, [dur - f(0.7), dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", color: IVORY, opacity: out }}>
      <div style={{ opacity: a, transform: `scale(${sc})`, font: `800 236px/0.9 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>TASTE THE FUTURE.</div>
      <div style={{ opacity: b, display: "flex", alignItems: "center", justifyContent: "center", gap: 34, marginTop: 64, transform: `translateY(${(1 - b) * 24}px)` }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 58 }} /></div>
        <span style={{ font: `300 50px ${SANS}`, opacity: 0.7 }}>×</span>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/tff-logo.png")} style={{ height: 58 }} /></div>
      </div>
      <div style={{ opacity: c * 0.6, marginTop: 30, font: `500 22px ${SANS}`, letterSpacing: "0.5em", paddingLeft: "0.5em" }}>TWO TEAMS. ONE MISSION.</div>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ warm?: boolean }> = ({ warm }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ background: warm ? "#FFB060" : "#fff", opacity: interpolate(fr, [0, 2, 9], [0, 0.75, 0], clamp), mixBlendMode: "screen" }} />;
};

// Film grain + letterbox for a theatrical frame
const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  const seed = fr % 7;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} /></filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 118, background: "#000" }} />
    </AbsoluteFill>
  );
};

// Location super, bottom left, mono, like a mission log
const Super: React.FC<{ dur: number; a: string; b: string }> = ({ dur, a, b }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  const n = Math.floor(interpolate(fr, [4, 34], [0, a.length], clamp));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 160px 120px" }}>
      <div style={{ opacity: o, color: IVORY, textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>
        <div style={{ font: `600 30px ${MONO}`, letterSpacing: "0.32em" }}>{a.slice(0, n)}<span style={{ opacity: fr % 16 < 8 ? 1 : 0 }}>_</span></div>
        <div style={{ font: `500 20px ${MONO}`, letterSpacing: "0.4em", marginTop: 12, color: "#FF7A3D" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

// Two teams, one mission: the real logos, unaltered, on white plates
const Logos: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp);
  const up = interpolate(fr, [6, 18], [30, 0], { ...clamp, easing: ease });
  const plate: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: "18px 30px", display: "flex" };
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", opacity: a }}>
      <div style={{ font: `800 150px/0.95 ${MONUMENT}`, fontStretch: "68%", letterSpacing: "0.04em", color: IVORY, textAlign: "center" }}>TWO TEAMS.<br />ONE MISSION.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 56, transform: `translateY(${up}px)` }}>
        <div style={plate}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 64 }} /></div>
        <span style={{ font: `300 54px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
        <div style={plate}><Img src={staticFile("img/tff-logo.png")} style={{ height: 64 }} /></div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number; auto?: [number, number][] };
// A handful of lines, most of them jokes: the go / no-go poll, the count, the landing, the meaning,
// the rival's understatement, and the question everyone in the room is thinking
const VO: Cue[] = [
  { f: "v4_f_aroma", at: t("mcwide", 0.15), v: 1 },
  { f: "v4_r_aroma", at: t("room", 0.95), v: 0.95 },
  { f: "v4_f_sweet", at: t("lean", -0.15), v: 1.15 },
  { f: "v4_r_sweet", at: t("lean", 1.3), v: 1.35 },
  { f: "v4_f_goflavor", at: t("flight", 0.15), v: 1 },
  { f: "v4_n_count", at: t("gauge", 0.35), v: 1 },
  { f: "v4_c_ideal", at: t("adrift", 0.3), v: 1 },
  { f: "v4_t_landed", at: t("foot", -0.9), v: 1 },
  { f: "v4_f_together", at: t("earthrise", 0.7), v: 1 },
  { f: "v4_n_getsome", at: t("tray", 1.2), v: 1 },
  { f: "v4_f_guests", at: t("tray", 3.25), v: 1 },
];
const LEN: Record<string, number> = {
  v4_f_aroma: 4.04, v4_r_aroma: 0.4, v4_f_sweet: 1.34, v4_r_sweet: 1.62, v4_f_goflavor: 3.14, v4_n_count: 2.64,
  v4_c_ideal: 3.12, v4_t_landed: 3.94, v4_f_together: 5.74, v4_n_getsome: 1.8, v4_f_guests: 1.6,
};
const RADIO = VO.filter((c) => ["v4_f_goflavor", "v4_c_ideal", "v4_t_landed"].includes(c.f));

// Sound design: every effect has a tail or a fade, nothing starts or stops dead
const SFX: Cue[] = [
  // I. Flavor Control at 0400: room tone, relays, one heartbeat, the button
  { f: "amb", at: t("black0", 0.0), v: 0.24, len: 13.6, fadeIn: 0.6, fadeOut: 0.4 },
  { f: "x_tick", at: t("black0", 0.1), v: 0.16, len: 13, fadeIn: 1, fadeOut: 1 },
  { f: "beeps", at: t("mcwide", 0.4), v: 0.1, len: 3, fadeIn: 0.5, fadeOut: 1 },
  { f: "x4_heart", at: t("lean", 1.0), v: 0.55 },
  { f: "x4_switch", at: t("palm", 0.3), v: 0.5 },
  { f: "x4_switch", at: t("button", 0.12), v: 0.95 },
  // the pad
  { f: "x_flood", at: t("pad", 0.0), v: 0.9 },
  { f: "x_subboom", at: t("pad", 0.02), v: 0.45 },
  { f: "x_turbo", at: t("tilt"), v: 0.25, len: 8.5, fadeIn: 1.5, fadeOut: 2.5 },
  // II. countdown
  { f: "x4_switch", at: t("gauge", 0.15), v: 0.7 },
  ...[0, 1, 2].map((i) => ({ f: "x4_heart", at: t("gauge", 0.35 + i * 0.95), v: 0.75 })),
  { f: "x_tick", at: t("gauge"), v: 0.4, len: 5.2, fadeOut: 0.3 },
  { f: "x_static", at: t("spark", 0.2), v: 0.25, len: 1.0, fadeIn: 0.3, fadeOut: 0.2 },
  // III. liftoff
  { f: "ignite", at: t("bell"), v: 0.65, len: 7, fadeOut: 2.5 },
  { f: "x_subboom", at: t("bell", 0.15), v: 0.6 },
  { f: "x_crowd", at: t("crowd", -0.3), v: 0.45, len: 3.4, fadeIn: 0.3, fadeOut: 1.2 },
  { f: "ignite", at: t("lift"), v: 0.4, from: 2, len: 4.2, fadeIn: 0.3, fadeOut: 1.5 },
  { f: "flyby", at: t("breach", 0.2), v: 0.35 },
  { f: "x_space", at: t("climb", 0.6), v: 0.6, len: 6.4, fadeIn: 1.2, fadeOut: 1.5 },
  // IV. the race
  { f: "flyby", at: t("race", 0.4), v: 0.3 },
  { f: "flyby", at: t("pass", 0.1), v: 0.6 },
  { f: "x4_whoosh", at: t("pass", 1.6), v: 0.5 },
  // V. something new
  { f: "x4_clamp", at: t("hands", 0.5), v: 0.35 },
  { f: "x_breath", at: t("yuzu", 0.1), v: 0.3, len: 3, fadeOut: 1 },
  { f: "x4_whoosh", at: t("launchI", 0.0), v: 0.35 },
  { f: "x_space", at: t("circle"), v: 0.4, len: 6.5, fadeIn: 1, fadeOut: 1.5 },
  { f: "x4_refuel", at: t("relight", -0.3), v: 0.8 },
  { f: "ignite", at: t("relight", 0.15), v: 0.6, len: 3.2, fadeOut: 1.2 },
  { f: "x_subboom", at: t("relight", 0.2), v: 0.6 },
  { f: "flyby", at: t("blast", 0.0), v: 0.6 },
  // VI. plan A smokes out
  { f: "x_beep1", at: t("sputter", 0.2), v: 0.55 },
  { f: "sputter", at: t("sputter", 0.5), v: 0.6 },
  { f: "sputter", at: t("smoke", 1.6), v: 0.35, fadeOut: 1 },
  { f: "x_tink", at: t("bolt", 1.15), v: 0.8 },
  { f: "x_space", at: t("tomoon"), v: 0.5, len: 7, fadeIn: 1, fadeOut: 2 },
  { f: "flyby", at: t("tomoon", 0.3), v: 0.3 },
  // VII. the moon
  { f: "lunar", at: t("land", 0.0), v: 0.8, len: 4.8, fadeOut: 1.2 },
  { f: "servo", at: t("flag", 1.0), v: 0.55 },
  // VIII. home
  { f: "ignite", at: t("liftoff"), v: 0.4, len: 3.2, fadeIn: 0.3, fadeOut: 1.4 },
  { f: "reentry", at: t("reentry", -0.2), v: 0.55, len: 3.4, fadeIn: 0.3, fadeOut: 1.0 },
  { f: "flyby", at: t("descent", 0.2), v: 0.45 },
  { f: "vland", at: t("touchhome", 0.1), v: 0.45 },
  { f: "hatch", at: t("hatch", 0.2), v: 0.8 },
  { f: "ding", at: t("tray", 0.9), v: 0.9, len: 1.2 },
  { f: "x_subboom", at: t("end"), v: 0.7 },
  // radio calls open with a Quindar tone
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// One continuous score, composed to this cut and never cut into. It starts 0.2 s early so that its breath
// and attack land on the countdown silence and the ignition, its hit lands on the relight, its drop on the
// sputter, its long silence holds the landing, and its return arrives as the flag unfurls.
// The only shaping is gain: it stops dead for the hush, eases back for the drift and for Flavor Control's search,
// and gives way to the final chord.
const SCORE_AT = -0.2;
const MUSIC: Cue[] = [
  {
    f: "m7_score", at: 0, from: -SCORE_AT, v: 0.95, len: t("end", 1.2), fadeOut: 1.0,
    auto: [
      [0, 0.7], [t("pad", -0.4), 0.7], [t("pad", 0.4), 1],
      [t("hush", -0.06), 1], [t("hush", 0.0), 0], [t("bell", -0.02), 0], [t("bell"), 1],
      [t("scale", -0.5), 1], [t("scale", 0.3), 0.55], [t("race", -0.4), 0.55], [t("race", 0.2), 1],
      [t("hands", -0.4), 1], [t("hands", 0.4), 0.55], [t("ring"), 0.75], [t("relight", -0.3), 1],
    ],
  },
  { f: "m6_final", at: t("end"), v: 1.5, len: t("end", 3.8) - t("end"), fadeOut: 1.2 },
];
const autoGain = (k: [number, number][], g: number) => {
  if (g <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (g <= k[i][0]) return k[i - 1][1] + ((g - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1]);
  return k[k.length - 1][1];
};

// Music dips gently under the four lines; long ramps so the dip is felt, not heard
const DUCK = 0.8;
const duckAt = (g: number) => {
  let k = 1;
  for (const c of VO) {
    const a = c.at - 0.3, b = c.at + Math.min(c.len ?? 99, LEN[c.f] ?? 2) + 0.3;
    const r = 0.6;
    const w = g < a - r || g > b + r ? 0 : g < a ? (g - (a - r)) / r : g > b ? 1 - (g - b) / r : 1;
    k = Math.min(k, 1 - (1 - DUCK) * w);
  }
  return k;
};

// Master trim; the final mix also passes through a peak limiter after render
const GAIN = 0.62;

const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? LEN[c.f] ?? 30;
  return (
    <Sequence from={f(c.at)} durationInFrames={Math.max(1, f(len + (c.len ? 0 : 0.4)))} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={f(c.from || 0)}
        volume={(fr) => {
          const s = fr / FPS;
          let v = c.v * GAIN;
          if (c.fadeIn) v *= Math.min(1, s / c.fadeIn);
          if (c.fadeOut) v *= Math.min(1, Math.max(0, (len - s) / c.fadeOut));
          if (c.auto) v *= autoGain(c.auto, c.at + s);
          if (duck) v *= duckAt(c.at + s);
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRaceV8: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "card" && <Card lines={sg.lines} size={sg.size} dur={f(sg.dur)} slam={sg.slam} />}
            {sg.kind === "logos" && <Logos dur={f(sg.dur)} />}
            {sg.kind === "end" && <EndCard dur={f(sg.dur)} />}
          </Sequence>
        );
      })}

      <Sequence from={f(t("bell", 0.15))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("relight", 0.2))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("mcwide", 0.2))} durationInFrames={f(3.1)} layout="none"><Super dur={f(3.1)} a="THE FLAVOR FACTORY · NORCO, CALIFORNIA" b="FLAVOR CONTROL · 0400 HOURS" /></Sequence>
      <Sequence from={f(t("title", 0.2))} durationInFrames={f(2.9)} layout="none"><Overlay text="THE FLAVOR RACE" dur={f(2.9)} size={210} monument /></Sequence>
      <Sequence from={f(t("ring", 0.2))} durationInFrames={f(3.4)} layout="none"><Overlay text={"THE NEXT FLAVOR\nCAN COME FROM ANYWHERE."} dur={f(3.4)} size={110} monument /></Sequence>
      <Sequence from={f(t("touchhome", 0.3))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="EWING, NEW JERSEY" b="1847 HOURS" /></Sequence>
      <Sequence from={f(t("tray", 0.3))} durationInFrames={f(4.1)} layout="none"><TasteSign dur={f(4.1)} /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

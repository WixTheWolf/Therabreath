import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 6.
   2:25 cut with the new Kling coverage: the pipette and canister open, the competitor smokes out and falls
   behind instead of exploding, a continuous landing and flag plant, and a Hans Zimmer style score whose hits
   are locked to the cuts.
   The Flavor Factory is Mission Control. Four voices carry the story: FLIGHT, NORCO, TB-ONE and the COMPETITOR.
   Top Gun scale, Apollo 13 tension, humor and heart. The film takes itself completely seriously; that is why the jokes land.
   The timeline is a list of segments played back to back; dialogue, score and sound are pinned to segments. */
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
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; rate?: number }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "card"; lines: string[]; size?: number; slam?: boolean }
  | { id: string; dur: number; kind: "logos" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // 1. FLAVOR CONTROL: one drop, one question
  { id: "black0", dur: 0.5, kind: "black" },
  { id: "drop", dur: 2.0, kind: "clip", clip: "w/s1_fuel", from: 2.3 },
  { id: "bloom", dur: 3.6, kind: "clip", clip: "w/s1_fuel", from: 5.2, zoom: [1.0, 1.06] },
  { id: "vessel", dur: 1.6, kind: "clip", clip: "w/s1_fuel", from: 9.7 },
  { id: "clamp", dur: 1.8, kind: "clip", clip: "w/s1_fuel", from: 12.3 },
  { id: "mc", dur: 3.3, kind: "clip", clip: "v_mc", from: 0.2 },
  { id: "everycat", dur: 1.7, kind: "card", lines: ["EVERY CATEGORY", "HAS A RACE."], size: 210 },
  // 2. THE PAD
  { id: "pad", dur: 3.0, kind: "clip", clip: "w/s2_pad", from: 0.2 },
  { id: "tease", dur: 2.6, kind: "clip", clip: "w/c1_tease", from: 7.6, zoom: [1.0, 1.05] },
  { id: "title", dur: 2.8, kind: "clip", clip: "v_reveal", from: 7.0 },
  // 3. GO / NO-GO
  { id: "g1", dur: 3.0, kind: "clip", clip: "v_mc", from: 4.4 },
  { id: "g2", dur: 0.8, kind: "clip", clip: "k/n02_mctense", from: 1.85, zoom: [1.06, 1.1] },
  { id: "g4", dur: 2.8, kind: "clip", clip: "k/n19_celebrate", from: 0.0, zoom: [1.0, 1.05] },
  { id: "g5", dur: 1.9, kind: "clip", clip: "w/s3_gonogo", from: 7.6 },
  { id: "g6", dur: 1.6, kind: "clip", clip: "v_cap", from: 6.9 },
  { id: "c3", dur: 0.95, kind: "clip", clip: "k/n21_glass", from: 9.5, zoom: [1.04, 1.08] },
  { id: "c2", dur: 1.0, kind: "clip", clip: "w/s2_pad", from: 1.2, zoom: [1.06, 1.1] },
  { id: "c1", dur: 0.7, kind: "clip", clip: "v_cap", from: 8.7, zoom: [1.06, 1.1] },
  { id: "hush", dur: 0.35, kind: "black" },
  // 4. IGNITION
  { id: "bell", dur: 1.5, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.3 },
  { id: "ignite", dur: 2.4, kind: "clip", clip: "w/s4_ignite", from: 0.0, shake: 0 },
  { id: "crowd", dur: 2.0, kind: "clip", clip: "w/s4_ignite", from: 5.7, shake: 0 },
  { id: "lift", dur: 2.4, kind: "clip", clip: "s02_launch", from: 6.8 },
  { id: "clouds", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 12.0 },
  // 5. SPACE AND THE DOGFIGHT
  { id: "drift", dur: 2.6, kind: "clip", clip: "w/x_drift", from: 3.6 },
  { id: "race", dur: 3.2, kind: "clip", clip: "w/c4_race", from: 1.0 },
  { id: "surge", dur: 2.3, kind: "clip", clip: "w/s5_dog", from: 3.5 },
  { id: "follow", dur: 1.0, kind: "card", lines: ["FOLLOW?"], size: 360, slam: true },
  { id: "lead", dur: 1.1, kind: "card", lines: ["OR LEAD?"], size: 360, slam: true },
  { id: "red", dur: 1.6, kind: "clip", clip: "w/s6_comp", from: 4.0, zoom: [1.0, 1.06] },
  { id: "alarm", dur: 1.6, kind: "clip", clip: "k/n20_uh", from: 6.4, zoom: [1.08, 1.14] },
  { id: "fuel", dur: 2.7, kind: "clip", clip: "k/n17_macro1", from: 1.0 },
  // 6. BLAND IS NOT AN OPTION
  { id: "flight", dur: 2.5, kind: "clip", clip: "k/n21_glass", from: 12.4 },
  { id: "flightb", dur: 2.3, kind: "clip", clip: "v_mc", from: 7.6 },
  { id: "bland", dur: 3.5, kind: "card", lines: ["BLAND IS NOT", "AN OPTION."], size: 230, slam: true },
  { id: "dump", dur: 1.5, kind: "clip", clip: "w/s6_bland", from: 6.0 },
  { id: "table", dur: 1.3, kind: "clip", clip: "w/s6_bland", from: 9.6, zoom: [1.0, 1.05] },
  { id: "inject", dur: 1.2, kind: "clip", clip: "k3b_ignite", from: 8.1, shake: 0.3 },
  { id: "refuel", dur: 1.6, kind: "clip", clip: "v_ingr", from: 0.2 },
  { id: "ribbons", dur: 5.6, kind: "clip", clip: "s09_ingr", from: 1.5, zoom: [1.0, 1.08] },
  { id: "punch", dur: 1.2, kind: "clip", clip: "k/n18_nozzle", from: 3.4, shake: 0 },
  // 7. PLAN A SMOKES OUT AND FALLS BEHIND
  { id: "smoke", dur: 3.8, kind: "clip", clip: "w/c5_comp", from: 0.4 },
  { id: "cough", dur: 2.1, kind: "clip", clip: "w/s6_comp", from: 6.3 },
  { id: "behind", dur: 4.0, kind: "clip", clip: "w/c5_comp", from: 10.6 },
  { id: "tomoon", dur: 1.9, kind: "clip", clip: "v_break", from: 8.0 },
  { id: "chase", dur: 1.4, kind: "card", lines: ["DON'T CHASE", "WHAT'S NEXT."], size: 200 },
  { id: "gap2", dur: 0.3, kind: "black" },
  { id: "first", dur: 1.9, kind: "card", lines: ["GET THERE", "FIRST."], size: 250, slam: true },
  // 8. THE FLAVOR HAS LANDED
  { id: "moonfall", dur: 2.2, kind: "clip", clip: "w/c6_break", from: 5.8 },
  { id: "land", dur: 2.7, kind: "clip", clip: "w/c7_flag", from: 0.3 },
  { id: "touch", dur: 1.8, kind: "clip", clip: "k/n14_dust", from: 3.8 },
  { id: "settle", dur: 2.2, kind: "clip", clip: "w/c7_flag", from: 4.4 },
  { id: "cheer1", dur: 1.2, kind: "clip", clip: "k/n19_celebrate", from: 4.4 },
  { id: "cheer2", dur: 1.3, kind: "clip", clip: "k/n19_celebrate", from: 6.0 },
  { id: "flag", dur: 3.4, kind: "clip", clip: "w/c7_flag", from: 6.5, zoom: [1.0, 1.04] },
  // 9. TWO TEAMS, ONE MISSION, AND HOME
  { id: "earthrise", dur: 3.6, kind: "clip", clip: "s08_earth", from: 4.6 },
  { id: "liftoff", dur: 2.4, kind: "clip", clip: "w/s8_teams", from: 0.0, shake: 0.1 },
  { id: "globe", dur: 2.2, kind: "clip", clip: "w/x_globe", from: 2.4 },
  { id: "logos", dur: 2.3, kind: "logos" },
  { id: "reentry", dur: 2.3, kind: "clip", clip: "w/x_reentrypov", from: 0.1, shake: 0 },
  { id: "calm", dur: 1.5, kind: "clip", clip: "w/x_hq3", from: 0.2 },
  { id: "descend", dur: 1.6, kind: "clip", clip: "w/x_hq3", from: 9.6 },
  { id: "hq", dur: 3.4, kind: "clip", clip: "s11_hq", from: 3.2, shake: 2.6 },
  // 10. THE PAYOFF
  { id: "smokeclear", dur: 1.7, kind: "clip", clip: "w/x_traymacro", from: 0.4 },
  { id: "hatch", dur: 1.2, kind: "clip", clip: "s12_hatch", from: 1.7, zoom: [1.12, 1.14] },
  { id: "tray2", dur: 3.8, kind: "clip", clip: "s12b_tray", from: 1.2 },
  { id: "toward", dur: 2.8, kind: "clip", clip: "w/x_tray", from: 10.6 },
  { id: "end", dur: 3.6, kind: "end" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE6_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur);
  const [z0, z1] = sg.zoom || [1.0, 1.035];
  const z = interpolate(fr, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sg.shake !== undefined) {
    const k = fr - f(sg.shake);
    const amp = k < 0 ? 0 : 16 * Math.exp(-k / 26);
    dx = Math.sin(k * 2.3) * amp; dy = Math.cos(k * 3.1) * amp;
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z})` }}>
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from)} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
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
      <div style={{ opacity: b, marginTop: 48, font: `500 34px ${SANS}`, letterSpacing: "0.42em", paddingLeft: "0.42em" }}>THERABREATH × THE FLAVOR FACTORY</div>
      <div style={{ opacity: c * 0.6, marginTop: 22, font: `500 22px ${SANS}`, letterSpacing: "0.5em", paddingLeft: "0.5em" }}>THE FLAVOR PLAYBOOK</div>
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
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number };
// Dialogue. Mission Control on headsets, the pilots on the radio, each radio call opened by a Quindar tone
const VO: Cue[] = [
  { f: "v4_f_question", at: t("black0", 0.4), v: 1 },
  { f: "v4_n_fuel", at: t("clamp", 0.6), v: 1 },
  { f: "v4_f_answer", at: t("mc", 1.5), v: 1 },
  { f: "v4_f_fueled", at: t("pad", 0.4), v: 1 },
  { f: "v4_t_smells", at: t("tease", 1.45), v: 0.95 },
  { f: "v4_f_aroma", at: t("g1", -1.1), v: 1 },
  { f: "v4_r_aroma", at: t("g2", 0.2), v: 0.95 },
  { f: "v4_f_sweet", at: t("g4", 0.0), v: 1 },
  { f: "v4_r_sweet", at: t("g4", 1.55), v: 1 },
  { f: "v4_f_goflavor", at: t("g5", 0.1), v: 1 },
  { f: "v4_n_count", at: t("c3", -0.1), v: 1 },
  { f: "v4_n_lookgo", at: t("crowd", 0.3), v: 1 },
  { f: "v4_c_nice", at: t("race", 0.35), v: 0.95 },
  { f: "v4_t_seat", at: t("surge", 0.4), v: 0.95 },
  { f: "v4_t_road", at: t("red", 0.3), v: 0.95, len: 6.3 },
  { f: "v4_f_bland", at: t("flight", 0.3), v: 1 },
  { f: "v4_n_hangon", at: t("dump", 0.2), v: 1 },
  { f: "v4_t_new", at: t("ribbons", 0.3), v: 0.95 },
  { f: "v4_n_gogetit", at: t("ribbons", 2.75), v: 1 },
  { f: "v4_t_punch", at: t("ribbons", 5.45), v: 1 },
  { f: "v4_e_uh", at: t("smoke", 1.4), v: 0.95 },
  { f: "v4_c_ideal", at: t("behind", 0.4), v: 1 },
  { f: "v4_t_landed", at: t("touch", 0.3), v: 1 },
  { f: "v4_n_menthol", at: t("cheer2", 0.0), v: 1 },
  { f: "v4_f_together", at: t("earthrise", 0.3), v: 1 },
  { f: "v4_n_home", at: t("reentry", 0.0), v: 1 },
  { f: "v4_n_getsome", at: t("tray2", 1.4), v: 1 },
  { f: "v4_f_guests", at: t("tray2", 3.3), v: 1 },
];
const LEN: Record<string, number> = {
  v4_c_ideal: 3.12, v4_c_jump: 2.94, v4_c_nice: 2.88, v4_e_uh: 1.24, v4_f_answer: 1.72, v4_f_aroma: 4.04, v4_f_bland: 8.2,
  v4_f_cooling: 0.54, v4_f_finish: 0.96, v4_f_fueled: 4.04, v4_f_goflavor: 3.14, v4_f_guests: 1.6, v4_f_nobody: 2.94,
  v4_f_question: 7.86, v4_f_sweet: 1.34, v4_f_together: 5.74, v4_n_count: 2.64, v4_n_fuel: 2.66, v4_n_getsome: 1.8,
  v4_n_gogetit: 2.7, v4_n_hangon: 2.38, v4_n_home: 2.1, v4_n_lookgo: 1.44, v4_n_menthol: 3.26, v4_r_aroma: 0.4,
  v4_r_cooling: 0.74, v4_r_finish: 2.16, v4_r_sweet: 1.62, v4_t_landed: 3.94, v4_t_new: 2.36, v4_t_punch: 1.24,
  v4_t_road: 7.0, v4_t_seat: 1.8, v4_t_smells: 2.88,
};
const RADIO = VO.filter((c) => /^v4_[tc]_/.test(c.f) || c.f === "v4_f_fueled" || c.f === "v4_f_goflavor" || c.f === "v4_n_hangon" || c.f === "v4_n_home");

const SFX: Cue[] = [
  // flavor control
  ...Array.from({ length: 7 }, (_, i) => ({ f: "x4_heart", at: t("black0", 0.05 + i * 1.1), v: 0.8 - i * 0.08 })),
  { f: "x_tick", at: t("black0", 0.1), v: 0.45 },
  { f: "x4_drip", at: t("drop", 1.6), v: 1.0 },
  { f: "x_breath", at: t("bloom", 0.1), v: 0.35, len: 3.5, fadeOut: 1.2 },
  { f: "x4_clamp", at: t("clamp", 0.75), v: 0.9 },
  { f: "amb", at: t("vessel"), v: 0.35, len: 6, fadeIn: 0.5, fadeOut: 1.5 },
  // the pad
  { f: "x_flood", at: t("pad", 0.05), v: 0.85 },
  { f: "x_turbo", at: t("tease"), v: 0.3, len: 5, fadeIn: 0.5, fadeOut: 1.5 },
  // go / no-go
  { f: "x4_switch", at: t("g2", 0.3), v: 0.8 },
  { f: "x_turbo", at: t("g6"), v: 0.45, len: 2.4, fadeIn: 0.6 },
  ...[0, 0.95, 1.95].map((o) => ({ f: "x4_heart", at: t("c3", o), v: 0.8 })),
  // ignition
  { f: "ignite", at: t("bell"), v: 0.6, fadeOut: 2 },
  { f: "x_subboom", at: t("bell", 0.25), v: 0.55 },
  { f: "x_crowd", at: t("crowd", -0.2), v: 0.5, len: 3.0, fadeOut: 1.2 },
  { f: "ignite", at: t("lift"), v: 0.35, from: 2, len: 2.6, fadeOut: 1 },
  { f: "flyby", at: t("clouds", 0.3), v: 0.35 },
  { f: "x_space", at: t("drift"), v: 0.7, len: 3.4, fadeOut: 0.8 },
  // dogfight
  { f: "flyby", at: t("surge", 0.2), v: 0.55 },
  { f: "x4_whoosh", at: t("follow", -0.1), v: 0.55 },
  { f: "x4_whoosh", at: t("lead", -0.1), v: 0.55 },
  { f: "x4_alarm", at: t("red", 0.1), v: 0.5 },
  { f: "x4_alarm", at: t("red", 2.0), v: 0.25, fadeOut: 1.2, len: 2 },
  // bland is not an option
  { f: "x_subboom", at: t("bland"), v: 0.7 },
  { f: "x4_clamp", at: t("dump", 0.4), v: 0.4 },
  { f: "x4_refuel", at: t("refuel", -0.15), v: 0.85 },
  { f: "x_subboom", at: t("refuel", 0.1), v: 0.5 },
  { f: "flyby", at: t("refuel", 0.2), v: 0.35 },
  { f: "ignite", at: t("punch"), v: 0.6, len: 1.8, fadeOut: 0.6 },
  { f: "x_subboom", at: t("punch", 0.05), v: 0.6 },
  // plan A smokes out
  { f: "x_beep1", at: t("smoke", 0.6), v: 0.7 },
  { f: "sputter", at: t("smoke", 2.2), v: 0.5 },
  { f: "x_beep1", at: t("cough", 0.3), v: 0.75 },
  { f: "sputter", at: t("cough", 0.6), v: 0.55 },
  { f: "x_tink", at: t("behind", 2.4), v: 0.75 },
  { f: "x_space", at: t("behind"), v: 0.35, len: 4, fadeOut: 1 },
  { f: "flyby", at: t("behind", 0.2), v: 0.45 },
  { f: "ignite", at: t("tomoon"), v: 0.45, from: 3, len: 2.1, fadeOut: 0.8 },
  { f: "x4_whoosh", at: t("first", -0.35), v: 0.5 },
  // the moon
  { f: "x_space", at: t("moonfall"), v: 0.55, len: 3, fadeIn: 0.6 },
  { f: "lunar", at: t("land", 0.0), v: 0.8, len: 3.6, fadeOut: 0.8 },
  { f: "x_applause", at: t("cheer1", -0.1), v: 0.5, len: 3.0, fadeOut: 1.0 },
  { f: "servo", at: t("flag", 0.3), v: 0.6 },
  { f: "ignite", at: t("liftoff"), v: 0.35, len: 2.6, fadeOut: 1.2 },
  // home
  { f: "reentry", at: t("reentry"), v: 0.55, len: 3.0, fadeOut: 0.6 },
  { f: "amb", at: t("calm"), v: 0.4, len: 1.6, fadeIn: 0.2, fadeOut: 0.3 },
  { f: "x_subboom", at: t("descend", 0.0), v: 0.6 },
  { f: "flyby", at: t("descend", 0.1), v: 0.5 },
  { f: "vland", at: t("hq", 0.1), v: 0.45 },
  { f: "x_subboom", at: t("hq", 2.6), v: 0.6 },
  // payoff
  { f: "x_tick", at: t("smokeclear", 0.5), v: 0.9 },
  { f: "hatch", at: t("hatch", 0.1), v: 0.85 },
  { f: "ding", at: t("tray2", 0.7), v: 1.0, len: 1.0 },
  { f: "x_subboom", at: t("end"), v: 0.6 },
  // Quindar tones open every radio call
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// Score cues start on the beats they serve
// The score: Hans Zimmer style movements, each slid so its hits land on the cuts
const MUSIC: Cue[] = [
  // open: brass braam (13.0 s into the cue) lands on the floodlit pad; the build peaks on "one"
  { f: "m6_open", at: 0.9, v: 0.6, len: t("hush") - 0.9, fadeIn: 1.2, fadeOut: 0.35 },
  // ignition: the theme starts on its downbeat as the engine bell lights
  { f: "m6_theme", at: t("bell"), v: 0.6, len: t("drift", 0.6) - t("bell"), fadeOut: 1.2 },
  // the race kicks in when the engines relight after the silent drift
  { f: "m6_race", at: t("race"), v: 0.55, len: t("red") - t("race"), fadeIn: 0.15, fadeOut: 0.3 },
  // crisis: its braam (12.5 s in) is slid to land on BLAND IS NOT AN OPTION
  { f: "m6_crisis", at: t("red"), v: 0.6, from: 12.5 - (t("bland") - t("red")), len: t("refuel") - t("red"), fadeIn: 0.5, fadeOut: 0.6 },
  // refuel: the swell rises under "we're bringing it to you" and bursts on the refuel cut
  { f: "m6_refuel", at: t("refuel", -3.4), v: 0.6, len: t("smoke") - t("refuel", -3.4), fadeIn: 0.6, fadeOut: 0.4 },
  // Plan A smokes out: dry, sly tension under the comedy
  { f: "m6_planA", at: t("smoke"), v: 0.55, from: 1.0, len: t("first") - t("smoke"), fadeIn: 0.4, fadeOut: 0.5 },
  { f: "m6_braam", at: t("first"), v: 0.6, len: 5.5, fadeOut: 2.5 },
  // the landing plays in near silence; the organ and choir arrive with Flavor Control
  { f: "m6_moon", at: t("cheer1", -0.15), v: 0.55, len: t("logos", 0.4) - t("cheer1", -0.15), fadeOut: 0.6 },
  // two teams, one mission: a warm full-orchestra chord under the logos
  { f: "m6_chord", at: t("logos", -0.1), v: 0.75, len: t("reentry") - t("logos", -0.1), fadeOut: 0.5 },
  { f: "m6_return", at: t("reentry"), v: 0.6, len: t("calm", 0.1) - t("reentry"), fadeOut: 0.25 },
  // Ewing is calm; then the rocket arrives
  { f: "m6_braam2", at: t("descend"), v: 0.5, len: 3.6, fadeOut: 1.6 },
  { f: "m6_payoff", at: t("smokeclear", 0.3), v: 0.5, len: t("end") - t("smokeclear", 0.3), fadeIn: 0.8, fadeOut: 0.6 },
  { f: "m6_final", at: t("end"), v: 1.0, len: t("end", 3.6) - t("end"), fadeOut: 1.2 },
];

// Music ducks under every line of dialogue, with short ramps
const DUCK = 0.5;
const duckAt = (g: number) => {
  let k = 1;
  for (const c of VO) {
    const a = c.at - 0.15, b = c.at + Math.min(c.len ?? 99, LEN[c.f] ?? 2) + 0.2;
    const r = 0.18;
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
          if (duck) v *= duckAt(c.at + s);
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRaceV6: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => (
        <Sequence key={sg.id} from={f(AT[sg.id])} durationInFrames={f(sg.dur)} layout="none">
          {sg.kind === "clip" && <ClipLayer sg={sg} />}
          {sg.kind === "card" && <Card lines={sg.lines} size={sg.size} dur={f(sg.dur)} slam={sg.slam} />}
          {sg.kind === "logos" && <Logos dur={f(sg.dur)} />}
          {sg.kind === "end" && <EndCard dur={f(sg.dur)} />}
        </Sequence>
      ))}

      <Sequence from={f(t("bell", 0.25))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("refuel", 0.1))} durationInFrames={10} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("punch"))} durationInFrames={8} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("hq", 2.6))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("drop", 0.1))} durationInFrames={f(4.4)} layout="none"><Super dur={f(4.4)} a="THE FLAVOR FACTORY · NORCO, CALIFORNIA" b="0400 HOURS" /></Sequence>
      <Sequence from={f(t("mc", 0.2))} durationInFrames={f(2.9)} layout="none"><Super dur={f(2.9)} a="FLAVOR CONTROL" b="T-MINUS 00:59:00" /></Sequence>
      <Sequence from={f(t("title", 0.1))} durationInFrames={f(2.6)} layout="none"><Overlay text="THE FLAVOR RACE" dur={f(2.6)} size={210} monument /></Sequence>
      <Sequence from={f(t("g1", 0.1))} durationInFrames={f(2.8)} layout="none"><Super dur={f(2.8)} a="GO / NO-GO FOR FLAVOR" b="POLLING ALL STATIONS" /></Sequence>
      <Sequence from={f(t("drift", 0.2))} durationInFrames={f(2.3)} layout="none"><Overlay text="THE MARKET NEVER STOPS MOVING." dur={f(2.3)} size={34} y={300} /></Sequence>
      <Sequence from={f(t("globe", 0.1))} durationInFrames={f(2.1)} layout="none"><Overlay text={"THE NEXT FLAVOR\nCAN COME FROM ANYWHERE."} dur={f(2.1)} size={110} monument /></Sequence>
      <Sequence from={f(t("calm", 0.1))} durationInFrames={f(1.3)} layout="none"><Super dur={f(1.3)} a="EWING, NEW JERSEY" b="1847 HOURS" /></Sequence>
      <Sequence from={f(t("tray2"))} durationInFrames={f(3.8)} layout="none"><TasteSign dur={f(3.8)} /></Sequence>

      <Grain />

      {MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 4.
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
  // 1. THE FUEL: Flavor Control, Norco, before dawn
  { id: "black0", dur: 1.2, kind: "black" },
  { id: "frost", dur: 2.6, kind: "clip", clip: "k/n16_macro2", from: 0.1, zoom: [1.05, 1.12] },
  { id: "valve", dur: 1.8, kind: "clip", clip: "k/n17_macro1", from: 2.2 },
  { id: "yuzu", dur: 1.6, kind: "clip", clip: "k/n08_yuzu", from: 2.6, zoom: [1.0, 1.06] },
  { id: "capmac", dur: 1.5, kind: "clip", clip: "k/n01_beauty", from: 2.0, zoom: [1.0, 1.06] },
  { id: "mc", dur: 4.6, kind: "clip", clip: "v_mc", from: 0 },
  { id: "everycat", dur: 2.2, kind: "card", lines: ["EVERY CATEGORY", "HAS A RACE."], size: 210 },
  // 2. THE PAD
  { id: "reveal", dur: 4.4, kind: "clip", clip: "v_reveal", from: 1.4 },
  { id: "pad", dur: 1.5, kind: "clip", clip: "k/n01_beauty", from: 0 },
  { id: "glassA", dur: 1.6, kind: "clip", clip: "k/n21_glass", from: 1.9 },
  { id: "title", dur: 3.0, kind: "clip", clip: "s02_launch", from: 0, zoom: [1.0, 1.05] },
  // 3. GO / NO-GO
  { id: "p1", dur: 1.6, kind: "clip", clip: "k/n02_mctense", from: 1.3 },
  { id: "p1b", dur: 1.5, kind: "clip", clip: "v_mc", from: 5.5 },
  { id: "p2", dur: 1.2, kind: "clip", clip: "k/n21_glass", from: 2.4 },
  { id: "p3", dur: 0.95, kind: "clip", clip: "k/n02_mctense", from: 2.8 },
  { id: "p4", dur: 3.2, kind: "clip", clip: "k/n19_celebrate", from: 0, zoom: [1.0, 1.06] },
  { id: "p5", dur: 1.15, kind: "clip", clip: "k/n01_beauty", from: 4.0 },
  { id: "p6", dur: 2.3, kind: "clip", clip: "k/n16_macro2", from: 3.0 },
  { id: "p7", dur: 3.3, kind: "clip", clip: "v_cap", from: 5.0 },
  { id: "c3", dur: 1.0, kind: "clip", clip: "k/n21_glass", from: 9.4 },
  { id: "c2", dur: 1.0, kind: "clip", clip: "s02_launch", from: 0.3, zoom: [1.04, 1.08] },
  { id: "c1", dur: 0.6, kind: "clip", clip: "v_cap", from: 8.3, zoom: [1.08, 1.12] },
  { id: "hush", dur: 0.35, kind: "black" },
  // 4. IGNITION
  { id: "nozzle", dur: 1.4, kind: "clip", clip: "k/n18_nozzle", from: 1.0, shake: 0 },
  { id: "ignite", dur: 3.4, kind: "clip", clip: "s02_launch", from: 3.6, shake: 0 },
  { id: "crowd", dur: 2.0, kind: "clip", clip: "k/n22_crowd", from: 1.2, shake: 0 },
  { id: "glassB", dur: 1.2, kind: "clip", clip: "k/n21_glass", from: 2.0 },
  { id: "ascent", dur: 3.8, kind: "clip", clip: "v_clouds", from: 3.4 },
  { id: "space", dur: 2.4, kind: "clip", clip: "s03_orbit", from: 0 },
  // 5. THE DOGFIGHT
  { id: "d1", dur: 2.9, kind: "clip", clip: "s03_orbit", from: 2.4 },
  { id: "d2", dur: 2.5, kind: "clip", clip: "s03_orbit", from: 6.0, zoom: [1.0, 1.06] },
  { id: "follow", dur: 1.0, kind: "card", lines: ["FOLLOW?"], size: 360, slam: true },
  { id: "lead", dur: 1.1, kind: "card", lines: ["OR LEAD?"], size: 360, slam: true },
  { id: "red", dur: 1.6, kind: "clip", clip: "k/n20_uh", from: 6.3, zoom: [1.06, 1.12] },
  { id: "strain", dur: 1.6, kind: "clip", clip: "s03_orbit", from: 4.4 },
  { id: "mc2", dur: 3.2, kind: "clip", clip: "v_mc", from: 6.8 },
  // 6. BLAND IS NOT AN OPTION
  { id: "b1", dur: 1.0, kind: "clip", clip: "k/n21_glass", from: 12.6 },
  { id: "b2", dur: 1.5, kind: "clip", clip: "k/n17_macro1", from: 4.5 },
  { id: "b3", dur: 2.2, kind: "clip", clip: "s01_macro", from: 1.0 },
  { id: "bland", dur: 3.5, kind: "card", lines: ["BLAND IS NOT", "AN OPTION."], size: 230, slam: true },
  { id: "i1", dur: 0.8, kind: "clip", clip: "k/n08_yuzu", from: 3.6 },
  { id: "i2", dur: 0.75, kind: "clip", clip: "k/n04_cuke", from: 2.0 },
  { id: "i3", dur: 0.75, kind: "clip", clip: "k/n05_rose", from: 2.4 },
  { id: "i4", dur: 0.75, kind: "clip", clip: "k/n06_tea", from: 2.2 },
  { id: "i5", dur: 1.3, kind: "clip", clip: "v_ingr", from: 0.4 },
  { id: "refuel", dur: 3.3, kind: "clip", clip: "v_ingr", from: 6.5, zoom: [1.0, 1.08] },
  { id: "break", dur: 2.6, kind: "clip", clip: "k/n27_home", from: 5.4, zoom: [1.0, 1.08] },
  { id: "punch", dur: 1.3, kind: "clip", clip: "k/n18_nozzle", from: 1.4, shake: 0.6 },
  { id: "boom1", dur: 1.8, kind: "clip", clip: "s04_boom", from: 0 },
  { id: "boom2", dur: 3.9, kind: "clip", clip: "s04_boom", from: 1.7, shake: 2.9 },
  { id: "bolt", dur: 2.4, kind: "clip", clip: "k/n23_bolt2", from: 1.6 },
  { id: "after", dur: 4.0, kind: "clip", clip: "s05_after", from: 0 },
  { id: "chase", dur: 1.5, kind: "card", lines: ["DON'T CHASE", "WHAT'S NEXT."], size: 200 },
  { id: "gap2", dur: 0.4, kind: "black" },
  { id: "first", dur: 2.0, kind: "card", lines: ["GET THERE", "FIRST."], size: 250, slam: true },
  // 7. THE FLAVOR HAS LANDED
  { id: "approach", dur: 2.8, kind: "clip", clip: "v_moonfall", from: 0.3 },
  { id: "descent", dur: 3.0, kind: "clip", clip: "s06_land_fix", from: 2.8 },
  { id: "dust", dur: 2.6, kind: "clip", clip: "k/n14_dust", from: 3.0 },
  { id: "still", dur: 1.6, kind: "clip", clip: "s06_land_fix", from: 6.0 },
  { id: "cheer", dur: 1.4, kind: "clip", clip: "k/n19_celebrate", from: 4.2 },
  { id: "flag", dur: 3.0, kind: "clip", clip: "s07_flag", from: 0, zoom: [1.0, 1.05] },
  { id: "flaghero", dur: 2.0, kind: "clip", clip: "k/n15_trans", from: 0, rate: 0.14, zoom: [1.0, 1.015] },
  // 8. TWO TEAMS, ONE MISSION
  { id: "depart", dur: 3.1, kind: "clip", clip: "k/n15_trans", from: 1.9, shake: 0.3 },
  { id: "ring", dur: 2.4, kind: "clip", clip: "k/n29_earth", from: 12.4 },
  { id: "logos", dur: 2.8, kind: "logos" },
  { id: "home1", dur: 1.5, kind: "clip", clip: "k/n27_home", from: 0.2 },
  { id: "plasma", dur: 1.0, kind: "clip", clip: "k/n13_reentry", from: 0.6, shake: 0 },
  { id: "sonic", dur: 1.1, kind: "clip", clip: "k/n09_boom1", from: 1.9 },
  { id: "nj", dur: 2.0, kind: "clip", clip: "k/n11_nj1", from: 0.8 },
  { id: "hq", dur: 4.2, kind: "clip", clip: "s11_hq", from: 3.4, shake: 3.1 },
  // 9. THE PAYOFF
  { id: "hatch", dur: 1.6, kind: "clip", clip: "s12_hatch", from: 0, zoom: [1.12, 1.14] },
  { id: "tray1", dur: 1.3, kind: "clip", clip: "s12b_tray", from: 0 },
  { id: "tray2", dur: 3.7, kind: "clip", clip: "s12b_tray", from: 1.3 },
  { id: "gap3", dur: 1.3, kind: "black" },
  { id: "end", dur: 4.4, kind: "end" },
  // STINGER
  { id: "stg0", dur: 0.6, kind: "black" },
  { id: "stinger", dur: 3.4, kind: "clip", clip: "s05_after", from: 1.0, rate: 0.6 },
  { id: "stg1", dur: 0.5, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE4_FRAMES = f(acc);
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
  { f: "v4_f_question", at: t("black0", 0.5), v: 1 },
  { f: "v4_n_fuel", at: t("mc", 0.3), v: 1 },
  { f: "v4_f_answer", at: t("mc", 3.1), v: 1 },
  { f: "v4_f_fueled", at: t("reveal", 0.9), v: 1 },
  { f: "v4_t_smells", at: t("pad", 0.7), v: 0.95 },
  { f: "v4_f_aroma", at: t("p1", -1.0), v: 1 },
  { f: "v4_r_aroma", at: t("p1", 3.15), v: 0.95 },
  { f: "v4_f_cooling", at: t("p1", 3.7), v: 1 },
  { f: "v4_r_cooling", at: t("p1", 4.35), v: 0.95 },
  { f: "v4_f_sweet", at: t("p4", 0.0), v: 1 },
  { f: "v4_r_sweet", at: t("p4", 1.55), v: 1 },
  { f: "v4_f_finish", at: t("p5", 0.1), v: 1 },
  { f: "v4_r_finish", at: t("p6", 0.05), v: 0.95 },
  { f: "v4_f_goflavor", at: t("p7", 0.05), v: 1 },
  { f: "v4_n_count", at: t("c3", 0.0), v: 1 },
  { f: "v4_n_lookgo", at: t("glassB", 0.05), v: 1 },
  { f: "v4_c_nice", at: t("d1", 0.3), v: 0.95 },
  { f: "v4_t_seat", at: t("d2", 1.0), v: 0.95 },
  { f: "v4_t_road", at: t("red", 0.3), v: 0.95, len: 6.3 },
  { f: "v4_f_bland", at: t("b1", 0.05), v: 1 },
  { f: "v4_f_nobody", at: t("i1", 0.05), v: 1 },
  { f: "v4_n_hangon", at: t("i5", 0.05), v: 1 },
  { f: "v4_t_new", at: t("refuel", 1.4), v: 0.95 },
  { f: "v4_n_gogetit", at: t("break", 0.55), v: 1 },
  { f: "v4_t_punch", at: t("punch", 0.75) - 0.2, v: 1 },
  { f: "v4_e_uh", at: t("boom1", 1.0), v: 0.95 },
  { f: "v4_c_ideal", at: t("after", 0.6), v: 1 },
  { f: "v4_t_landed", at: t("dust", 0.5), v: 1 },
  { f: "v4_n_menthol", at: t("cheer", 0.5), v: 1 },
  { f: "v4_f_together", at: t("depart", 0.2), v: 1 },
  { f: "v4_n_home", at: t("home1", 0.0), v: 1 },
  { f: "v4_n_getsome", at: t("tray2", 1.6), v: 1 },
  { f: "v4_f_guests", at: t("tray2", 3.45), v: 1 },
  { f: "v4_c_jump", at: t("stinger", 0.4), v: 0.9 },
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
  // the fuel
  ...Array.from({ length: 8 }, (_, i) => ({ f: "x4_heart", at: t("black0", 0.1 + i * 1.1), v: 0.85 - i * 0.07 })),
  { f: "x_tick", at: t("black0", 0.2), v: 0.5 },
  { f: "amb", at: t("frost"), v: 0.4, len: 12, fadeIn: 1, fadeOut: 1.5 },
  { f: "x4_drip", at: t("yuzu", 0.15), v: 0.9 },
  { f: "x4_clamp", at: t("capmac", 0.1), v: 0.8 },
  { f: "x4_switch", at: t("mc", 0.15), v: 0.6 },
  { f: "x_subboom", at: t("everycat"), v: 0.7 },
  // the pad
  { f: "x_flood", at: t("reveal"), v: 0.9 },
  { f: "x_subboom", at: t("reveal", 2.2), v: 0.6 },
  { f: "x_turbo", at: t("pad"), v: 0.35, len: 6, fadeIn: 0.5, fadeOut: 1.5 },
  { f: "x_braam", at: t("title", 0.15), v: 0.38 },
  // go / no-go
  { f: "x4_switch", at: t("p1", 0.35), v: 0.8 },
  { f: "x4_switch", at: t("p3", 0.1), v: 0.5 },
  { f: "x_beep1", at: t("p6", 0.05), v: 0.35 },
  { f: "x_turbo", at: t("p7"), v: 0.5, len: 6.3, fadeIn: 1 },
  ...[0, 0.75, 1.45, 2.05].map((o) => ({ f: "x4_heart", at: t("c3", o), v: 0.8 })),
  // ignition
  { f: "ignite", at: t("nozzle"), v: 0.6, fadeOut: 2 },
  { f: "x_subboom", at: t("nozzle"), v: 0.6 },
  { f: "x_crowd", at: t("crowd", -0.2), v: 0.5, len: 3.6, fadeOut: 1.4 },
  { f: "flyby", at: t("ascent", 1.0), v: 0.35 },
  { f: "x_space", at: t("space"), v: 0.8, len: 5.5, fadeOut: 1.5 },
  // dogfight
  { f: "flyby", at: t("d2", 0.1), v: 0.5 },
  { f: "x4_whoosh", at: t("follow", -0.1), v: 0.6 },
  { f: "x4_whoosh", at: t("lead", -0.1), v: 0.6 },
  { f: "x4_alarm", at: t("red"), v: 0.55 },
  { f: "x4_alarm", at: t("red", 1.9), v: 0.3, fadeOut: 1.2, len: 2 },
  // bland is not an option
  { f: "x_subboom", at: t("bland", 0.0), v: 0.75 },
  { f: "x4_whoosh", at: t("i1", -0.08), v: 0.45 },
  { f: "x4_whoosh", at: t("i2", -0.08), v: 0.45 },
  { f: "x4_whoosh", at: t("i3", -0.08), v: 0.45 },
  { f: "x4_whoosh", at: t("i4", -0.08), v: 0.45 },
  { f: "x4_refuel", at: t("refuel", -0.2), v: 0.85 },
  { f: "x_subboom", at: t("refuel", 0.1), v: 0.55 },
  { f: "flyby", at: t("refuel", 0.3), v: 0.4 },
  { f: "ignite", at: t("break"), v: 0.4, from: 3, len: 2.6, fadeOut: 1 },
  { f: "ignite", at: t("punch"), v: 0.55, len: 1.6, fadeOut: 0.6 },
  { f: "x_subboom", at: t("punch", 0.6), v: 0.6 },
  // plan A runs dry
  { f: "x_beep1", at: t("boom1", 0.45), v: 0.75 },
  { f: "sputter", at: t("boom2", 0.8), v: 0.55 },
  { f: "x_beep1", at: t("boom2", 2.0), v: 0.8 },
  { f: "x_whoomph", at: t("boom2", 2.85), v: 0.95 },
  { f: "x_tink", at: t("bolt", 0.15), v: 0.9 },
  { f: "x_space", at: t("bolt"), v: 0.45, len: 8.3, fadeOut: 1.5 },
  { f: "x4_whoosh", at: t("first", -0.35), v: 0.5 },
  { f: "x_braam", at: t("first"), v: 0.36 },
  // the moon
  { f: "x_space", at: t("approach"), v: 0.6, len: 3, fadeIn: 1 },
  { f: "lunar", at: t("descent", 0.1), v: 0.85, len: 5.4, fadeOut: 0.8 },
  { f: "x_applause", at: t("cheer", -0.1), v: 0.55, len: 3.2, fadeOut: 1.2 },
  { f: "servo", at: t("flag", 0.4), v: 0.7 },
  { f: "ignite", at: t("depart"), v: 0.35, len: 3.2, fadeOut: 1.2 },
  // home
  { f: "reentry", at: t("plasma"), v: 0.6, len: 3.0, fadeOut: 0.6 },
  { f: "x_subboom", at: t("sonic", 0.2), v: 0.65 },
  { f: "vland", at: t("hq", 0.1), v: 0.45 },
  { f: "x_subboom", at: t("hq", 3.1), v: 0.6 },
  // payoff
  { f: "x_tick", at: t("hatch", 0.3), v: 1.0 },
  { f: "hatch", at: t("hatch", 0.8), v: 0.9 },
  { f: "ding", at: t("tray2", 0.8), v: 1.0, len: 1.0 },
  { f: "x_space", at: t("stinger"), v: 0.35, len: 3.4, fadeIn: 0.5, fadeOut: 0.8 },
  // Quindar tones open every radio call
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.32, len: 0.4 })),
];

// Score cues start on the beats they serve
const MUSIC: Cue[] = [
  { f: "m4_lab", at: 0, v: 0.5, len: t("reveal"), fadeIn: 1.5, fadeOut: 1.2 },
  { f: "m4_build", at: t("reveal"), v: 0.5, len: t("hush") - t("reveal"), fadeIn: 0.5 },
  { f: "m4_theme", at: t("nozzle"), v: 0.55, len: t("space", 0.3) - t("nozzle"), fadeOut: 0.6 },
  { f: "m4_swagger", at: t("d1"), v: 0.5, len: t("red") - t("d1"), fadeIn: 0.3, fadeOut: 0.25 },
  { f: "m4_crisis", at: t("red"), v: 0.55, len: t("i1") - t("red"), fadeIn: 0.6, fadeOut: 0.5 },
  { f: "m4_drive", at: t("i1", -0.15), v: 0.5, from: 20, len: t("refuel") - t("i1", -0.15), fadeIn: 0.2, fadeOut: 0.3 },
  { f: "m4_hero", at: t("refuel", -0.3), v: 0.55, len: t("boom1") - t("refuel", -0.3), fadeOut: 0.25 },
  { f: "m4_sting", at: t("first"), v: 0.55, from: 0.35, len: t("descent") - t("first"), fadeOut: 2.5 },
  { f: "m4_moon", at: t("cheer", -0.2), v: 0.5, len: t("home1") - t("cheer", -0.2), fadeOut: 0.6 },
  { f: "m4_return", at: t("home1"), v: 0.55, len: t("hq", 3.1) - t("home1"), fadeIn: 0.3 },
  { f: "m4_payoff", at: t("tray1"), v: 0.45, len: t("gap3", 0.6) - t("tray1"), fadeIn: 0.8, fadeOut: 0.8 },
  { f: "m_final", at: t("end", -1.85), v: 0.75, from: 0, len: 6.2, fadeOut: 1.2 },
];

// Music ducks under every line of dialogue, with short ramps
const DUCK = 0.42;
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

export const FlavorRaceV4: React.FC = () => {
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

      <Sequence from={f(t("nozzle"))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("refuel", 0.1))} durationInFrames={10} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("boom2", 2.9))} durationInFrames={10} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("hq", 3.1))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("frost", 0.2))} durationInFrames={f(5.0)} layout="none"><Super dur={f(5.0)} a="THE FLAVOR FACTORY · NORCO, CALIFORNIA" b="0400 HOURS" /></Sequence>
      <Sequence from={f(t("mc", 0.4))} durationInFrames={f(3.6)} layout="none"><Super dur={f(3.6)} a="FLAVOR CONTROL" b="T-MINUS 00:59:00" /></Sequence>
      <Sequence from={f(t("title", 0.15))} durationInFrames={f(2.75)} layout="none"><Overlay text="THE FLAVOR RACE" dur={f(2.75)} size={210} monument /></Sequence>
      <Sequence from={f(t("p1", 0.1))} durationInFrames={f(2.8)} layout="none"><Super dur={f(2.8)} a="GO / NO-GO FOR FLAVOR" b="POLLING ALL STATIONS" /></Sequence>
      <Sequence from={f(t("space", 0.3))} durationInFrames={f(2.2)} layout="none"><Overlay text="THE MARKET NEVER STOPS MOVING." dur={f(2.2)} size={34} y={300} /></Sequence>
      <Sequence from={f(t("ring", 0.1))} durationInFrames={f(2.3)} layout="none"><Overlay text={"THE NEXT FLAVOR\nCAN COME FROM ANYWHERE."} dur={f(2.3)} size={110} monument /></Sequence>
      <Sequence from={f(t("flaghero", 0.1))} durationInFrames={f(1.9)} layout="none"><Overlay text="THE FUTURE OF FLAVOR" dur={f(1.9)} size={30} y={330} /></Sequence>
      <Sequence from={f(t("tray2"))} durationInFrames={f(3.7)} layout="none"><TasteSign dur={f(3.7)} /></Sequence>
      <Sequence from={f(t("stinger", 0.05))} durationInFrames={f(1.6)} layout="none"><Overlay text="MEANWHILE..." dur={f(1.6)} size={28} y={330} /></Sequence>

      <Grain />

      {MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THERABREATH: MISSION NEXT · main film.
   A brave TheraBreath bottle rocket heads for the Moon with The Flavor Factory as mission control. A theatrical rival
   turns it into a race, shows off, and tumbles out of control near the Moon. TheraBreath has a clear path, hesitates,
   and turns back. Flavor Control's awkward little docking adapter, the one TheraBreath tried to leave behind, connects
   the two; low on fuel, they fire together and find a hidden basin of new flavor ideas. Then home, and one more joke.
   The future belongs to those brave enough to explore, and generous enough to bring others along.
   Generated shots live in clips/m (Veo 3.1, image-to-video from frames of the approved footage). No faces.
   The rival is the established amber "COMPETITOR" bottle: no real competitor name, mark or claim. */
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
  // S1 THE PROMISE: a monumental hull that turns out to be a bottle; the adapter; the rival; the safety seal
  { id: "black0", dur: 1.0, kind: "black" },
  { id: "hull", dur: 8.5, kind: "clip", clip: "w/c1_tease", from: 1.0, x: 0.8, zoom: [1.0, 1.04] },
  { id: "pad", dur: 3.0, kind: "clip", clip: "w/s2_pad", from: 0.0, zoom: [1.0, 1.03] },
  { id: "adapter", dur: 4.6, kind: "clip", clip: "m/n02_adapter", from: 1.0 },
  { id: "clamp", dur: 4.0, kind: "clip", clip: "m/n03_clamp", from: 0.6 },
  { id: "reveal", dur: 3.0, kind: "clip", clip: "v_reveal", from: 6.7 },
  { id: "rival", dur: 2.6, kind: "clip", clip: "w/s2_pad", from: 3.15 },
  { id: "salute", dur: 3.6, kind: "clip", clip: "m/n05_salute", from: 3.6 },
  { id: "lean", dur: 3.6, kind: "clip", clip: "v_mc", from: 4.4, zoom: [1.04, 1.1] },
  { id: "seal", dur: 3.6, kind: "clip", clip: "m/n04_seal", from: 1.6 },
  { id: "palm", dur: 1.6, kind: "clip", clip: "k/n21_glass", from: 9.6 },
  // S2 LAUNCH
  { id: "gauge", dur: 1.7, kind: "clip", clip: "k3a_ignite", from: 0.3, zoom: [1.04, 1.1] },
  { id: "cap", dur: 1.4, kind: "clip", clip: "v_cap", from: 8.2, zoom: [1.06, 1.12] },
  { id: "button", dur: 0.6, kind: "clip", clip: "k/n02_mctense", from: 4.02, zoom: [1.0, 1.05] },
  { id: "spark", dur: 1.7, kind: "clip", clip: "k/n18_nozzle", from: 0.0, zoom: [1.0, 1.08] },
  { id: "hush", dur: 0.45, kind: "black" },
  { id: "bell", dur: 2.1, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.25 },
  { id: "thunder", dur: 2.5, kind: "clip", clip: "w/s4_ignite", from: 0.3, shake: 0 },
  { id: "crowd", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 5.4 },
  { id: "lift", dur: 3.6, kind: "clip", clip: "s02_launch", from: 6.2, shake: 0 },
  { id: "breach", dur: 2.6, kind: "clip", clip: "w/s4_ignite", from: 11.8 },
  { id: "climb", dur: 3.4, kind: "clip", clip: "v_clouds", from: 6.0, x: 0.6 },
  // S3 ORBIT AND THE RACE
  { id: "scale", dur: 2.2, kind: "clip", clip: "w/x_drift", from: 4.4, x: 0.8 },
  { id: "earth", dur: 3.5, kind: "clip", clip: "k/n29_earth", from: 3.0 },
  { id: "race", dur: 4.0, kind: "clip", clip: "w/c4_race", from: 0.5 },
  { id: "shoulder", dur: 4.0, kind: "clip", clip: "s03_orbit", from: 2.0 },
  { id: "pass", dur: 3.0, kind: "clip", clip: "w/s5_dog", from: 3.6 },
  { id: "cruise", dur: 3.4, kind: "clip", clip: "w/x_drift", from: 0.0 },
  { id: "loom", dur: 3.5, kind: "clip", clip: "v_moon", from: 6.0 },
  { id: "race2", dur: 3.0, kind: "clip", clip: "w/c4_race", from: 5.0 },
  { id: "approach", dur: 3.1, kind: "clip", clip: "v_moonfall", from: 0.5 },
  // S4 THE RACE GOES WRONG, AND THE CHOICE
  { id: "tumble", dur: 6.0, kind: "clip", clip: "m/n06_tumble", from: 1.6 },
  { id: "clearpath", dur: 4.0, kind: "clip", clip: "v_break", from: 5.5 },
  { id: "hesitate", dur: 4.0, kind: "clip", clip: "m/n07_hesitate", from: 0.5 },
  { id: "watch", dur: 4.0, kind: "clip", clip: "k/n21_glass", from: 12.3, zoom: [1.0, 1.05] },
  { id: "hesitate2", dur: 1.5, kind: "clip", clip: "m/n07_hesitate", from: 4.5 },
  { id: "turn", dur: 5.5, kind: "clip", clip: "m/n08_turn", from: 0.0 },
  // S5 THE RESCUE
  { id: "room", dur: 2.9, kind: "clip", clip: "k/n21_glass", from: 2.5 },
  { id: "spare", dur: 3.2, kind: "clip", clip: "m/n09_spare", from: 1.4 },
  { id: "match", dur: 7.5, kind: "clip", clip: "m/n10_match", from: 0.0 },
  { id: "miss", dur: 4.0, kind: "clip", clip: "m/n11_miss", from: 0.5, shake: 1.4 },
  { id: "dock", dur: 7.0, kind: "clip", clip: "m/n12_dock", from: 0.0, shake: 4.5 },
  { id: "pair", dur: 3.6, kind: "clip", clip: "m/n13_together", from: 0.0 },
  { id: "mcw", dur: 3.6, kind: "clip", clip: "v_mc", from: 0.2, zoom: [1.0, 1.04] },
  { id: "together", dur: 3.8, kind: "clip", clip: "m/n13_together", from: 4.0, shake: 0.2 },
  // S6 DISCOVERY
  { id: "basin", dur: 7.0, kind: "clip", clip: "m/n14_basin", from: 1.0 },
  { id: "yuzu", dur: 4.8, kind: "clip", clip: "m/n15_yuzu", from: 1.0, x: 0.8 },
  { id: "greentea", dur: 4.8, kind: "clip", clip: "m/n16_greentea", from: 1.0, x: 0.8 },
  { id: "ginger", dur: 4.8, kind: "clip", clip: "m/n17_gingerlime", from: 1.0, x: 0.8 },
  // S7 HOMECOMING AND THE LAST JOKE
  { id: "reentry", dur: 2.6, kind: "clip", clip: "w/x_reentrypov", from: 0.1, shake: 0 },
  { id: "home", dur: 3.2, kind: "clip", clip: "m/n01_padmoon", from: 1.0, x: 1.0, zoom: [1.0, 1.04] },
  { id: "bow", dur: 4.8, kind: "clip", clip: "m/n18_home", from: 2.4, x: 0.8 },
  { id: "end", dur: 6.0, kind: "end" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const MISSION_FRAMES = f(acc);
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


const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const b = interpolate(fr, [f(1.3), f(1.9)], [0, 1], clamp);
  const c = interpolate(fr, [f(2.2), f(2.8)], [0, 1], clamp);
  const o = interpolate(fr, [dur - f(0.8), dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <EpicTitle lines={["THE NEXT FRONTIER", "OF FLAVOR."]} dur={dur} size={168} y={-90} hold />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: b, marginTop: 330, font: `500 40px ${SANS}`, color: IVORY, letterSpacing: "0.04em" }}>Let&apos;s create what comes next.</div>
        <div style={{ opacity: c, display: "flex", alignItems: "center", gap: 34, marginTop: 40, transform: `translateY(${(1 - c) * 20}px)` }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 26px", display: "flex" }}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 52 }} /></div>
          <span style={{ font: `300 46px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 26px", display: "flex" }}><Img src={staticFile("img/tff-logo.png")} style={{ height: 52 }} /></div>
        </div>
      </AbsoluteFill>
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
// the rival's understatement, and Norco at the very end, who is absolutely not crying
const VO: Cue[] = [
  { f: "mn_f_missing", at: t("pad", 0.5), v: 1 },
  { f: "mn_tb_necessary", at: t("adapter", 0.5), v: 1 },
  { f: "mn_f_leavebehind", at: t("adapter", 3.0), v: 1 },
  { f: "mn_c_keepup", at: t("rival", 0.2), v: 1 },
  { f: "mn_f_seal", at: t("lean", 0.2), v: 1 },
  { f: "mn_tb_yes", at: t("seal", 2.9), v: 1.25 },
  { f: "v4_n_count", at: t("gauge", 0.35), v: 1 },
  { f: "mn_c_shortcut", at: t("shoulder", 0.4), v: 1 },
  { f: "mn_c_wobble", at: t("tumble", 0.6), v: 1 },
  { f: "mn_n_flatspin", at: t("tumble", 4.3), v: 1 },
  { f: "mn_f_clearpath", at: t("clearpath", 1.3), v: 1 },
  { f: "mn_tb_copy", at: t("hesitate", 1.6), v: 1.2 },
  { f: "mn_tb_turning", at: t("hesitate2", 0.2), v: 1.15 },
  { f: "mn_n_ugly", at: t("room", 0.05), v: 1 },
  { f: "mn_f_match", at: t("spare", 0.2), v: 1 },
  { f: "mn_tb_missed", at: t("miss", 1.5), v: 1.15 },
  { f: "mn_f_again", at: t("miss", 2.4), v: 1 },
  { f: "mn_c_plan", at: t("dock", 5.0), v: 1 },
  { f: "mn_tb_spinning", at: t("pair", 1.1), v: 1.1 },
  { f: "mn_f_fuel", at: t("mcw", 0.2), v: 1 },
  { f: "v4_t_new", at: t("yuzu", 0.6), v: 1 },
  { f: "mn_c_nextweek", at: t("bow", 1.0), v: 1 },
  { f: "mn_tb_adapter", at: t("bow", 2.8), v: 1.1 },
];
const LEN: Record<string, number> = {
  mn_tb_necessary: 2.48, mn_f_leavebehind: 3.16, mn_f_seal: 3.44, mn_tb_yes: 1.34, v4_n_count: 2.64, mn_c_shortcut: 3.26,
  mn_c_wobble: 3.56, mn_f_clearpath: 3.44, mn_n_ugly: 2.84, mn_c_plan: 2.5, mn_tb_spinning: 1.86, mn_f_fuel: 3.28,
  v4_t_new: 2.36, mn_c_nextweek: 1.58, mn_tb_adapter: 1.92, mn_f_missing: 2.68, mn_c_keepup: 3.16, mn_n_flatspin: 2.82,
  mn_tb_copy: 1.16, mn_tb_turning: 1.36, mn_f_match: 3.52, mn_tb_missed: 1.6, mn_f_again: 1.8,
};
// TheraBreath One and the rival speak on the radio; Flavor Control is on headsets
const RADIO = VO.filter((c) => /^mn_(tb|c)_/.test(c.f) || c.f === "v4_t_new");

const SFX: Cue[] = [
  // S1: the hull hums, the cap clicks, floodlights, the adapter clamps on, the arm unfolds
  { f: "x_turbo", at: t("black0", 0.2), v: 0.22, len: 9.5, fadeIn: 2, fadeOut: 1.5 },
  { f: "x_tick", at: t("black0", 0.3), v: 0.2, len: 9, fadeIn: 1, fadeOut: 1 },
  { f: "x4_switch", at: t("hull", 7.8), v: 0.6 },
  { f: "x_flood", at: t("pad"), v: 0.8 },
  { f: "x_subboom", at: t("pad", 0.02), v: 0.3 },
  { f: "amb", at: t("adapter"), v: 0.22, len: 4.8, fadeIn: 0.3, fadeOut: 0.4 },
  { f: "mn_sfx_cap", at: t("adapter", 2.6), v: 0.8 },
  { f: "x_tink", at: t("adapter", 3.0), v: 0.35 },
  { f: "servo", at: t("clamp", 0.3), v: 0.5 },
  { f: "x4_clamp", at: t("clamp", 1.8), v: 1.0 },
  { f: "x_subboom", at: t("clamp", 1.82), v: 0.35 },
  { f: "x_flood", at: t("reveal"), v: 0.6 },
  { f: "mn_sfx_fanfare", at: t("reveal", 0.1), v: 0.7 },
  { f: "servo", at: t("salute", 0.4), v: 0.45 },
  { f: "amb", at: t("lean"), v: 0.24, len: t("gauge") - t("lean"), fadeIn: 0.3, fadeOut: 0.3 },
  { f: "mn_sfx_paper", at: t("lean"), v: 0.35 },
  { f: "x4_heart", at: t("seal", 1.0), v: 0.5 },
  { f: "mn_sfx_peel", at: t("seal", 1.3), v: 0.9 },
  { f: "x_static", at: t("seal", 1.9), v: 0.2, len: 0.5, fadeIn: 0.05, fadeOut: 0.2 },
  // S2: countdown and launch
  { f: "x4_switch", at: t("gauge", 0.15), v: 0.7 },
  ...[0, 1, 2].map((i) => ({ f: "x4_heart", at: t("gauge", 0.35 + i * 0.95), v: 0.75 })),
  { f: "x_tick", at: t("gauge"), v: 0.4, len: 5.2, fadeOut: 0.3 },
  { f: "mn_sfx_cap", at: t("cap", 0.4), v: 0.9 },
  { f: "x4_switch", at: t("button", 0.12), v: 0.95 },
  { f: "x_static", at: t("spark", 0.4), v: 0.25, len: 1.2, fadeIn: 0.3, fadeOut: 0.2 },
  { f: "ignite", at: t("bell"), v: 0.65, len: 7, fadeOut: 2.5 },
  { f: "x_subboom", at: t("bell", 0.15), v: 0.6 },
  { f: "x_crowd", at: t("crowd", -0.3), v: 0.45, len: 3.4, fadeIn: 0.3, fadeOut: 1.2 },
  { f: "ignite", at: t("lift"), v: 0.4, from: 2, len: 4.2, fadeIn: 0.3, fadeOut: 1.5 },
  { f: "flyby", at: t("breach", 0.2), v: 0.35 },
  { f: "x_space", at: t("climb", 0.6), v: 0.6, len: 7, fadeIn: 1.2, fadeOut: 1.5 },
  // S3: the race
  { f: "flyby", at: t("race", 0.4), v: 0.3 },
  { f: "flyby", at: t("pass", 0.1), v: 0.6 },
  { f: "x4_whoosh", at: t("pass", 1.6), v: 0.5 },
  { f: "x_space", at: t("cruise"), v: 0.4, len: 7, fadeIn: 0.8, fadeOut: 1.5 },
  { f: "flyby", at: t("race2", 0.5), v: 0.35 },
  // S4: the tumble, the choice, the turn
  { f: "x_beep1", at: t("tumble", 0.3), v: 0.55 },
  { f: "sputter", at: t("tumble", 1.2), v: 0.55 },
  { f: "x4_alarm", at: t("tumble", 2.4), v: 0.25, len: 2.2, fadeOut: 1 },
  { f: "x_space", at: t("hesitate"), v: 0.45, len: 8.5, fadeIn: 1, fadeOut: 1.2 },
  { f: "x4_heart", at: t("watch", 0.6), v: 0.45 },
  { f: "x4_refuel", at: t("turn", 0.6), v: 0.5 },
  { f: "ignite", at: t("turn", 3.0), v: 0.6, len: 3.0, fadeOut: 1 },
  { f: "x_subboom", at: t("turn", 3.1), v: 0.5 },
  // S5: the rescue
  { f: "amb", at: t("room"), v: 0.22, len: 3.0, fadeIn: 0.2, fadeOut: 0.4 },
  { f: "flyby", at: t("match", 1.0), v: 0.3 },
  { f: "x4_whoosh", at: t("miss", 1.0), v: 0.65 },
  { f: "mn_sfx_latch", at: t("dock", 4.4), v: 1.0 },
  { f: "x_subboom", at: t("dock", 4.52), v: 0.6 },
  { f: "x_tink", at: t("dock", 4.9), v: 0.6 },
  { f: "amb", at: t("mcw"), v: 0.22, len: 3.7, fadeIn: 0.2, fadeOut: 0.4 },
  { f: "ignite", at: t("together", 0.2), v: 0.55, len: 3.6, fadeOut: 1.2 },
  // S6: discovery
  { f: "x_space", at: t("basin"), v: 0.5, len: 22, fadeIn: 1.5, fadeOut: 2 },
  { f: "x_breath", at: t("yuzu", 0.2), v: 0.3, len: 4, fadeIn: 0.5, fadeOut: 1.5 },
  { f: "x_breath", at: t("ginger", 0.2), v: 0.3, len: 4, fadeIn: 0.5, fadeOut: 1.5 },
  // S7: home, and the adapter one more time
  { f: "reentry", at: t("reentry", -0.2), v: 0.55, len: 3.2, fadeIn: 0.3, fadeOut: 1.0 },
  { f: "amb", at: t("home", -0.6), v: 0.25, len: 4.0, fadeIn: 0.6, fadeOut: 0.6 },
  { f: "amb", at: t("bow", -0.6), v: 0.2, len: 5.4, fadeIn: 0.8, fadeOut: 0.6 },
  { f: "x_subboom", at: t("end"), v: 0.7 },
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// The original score, take A, placed in three pieces so its own hits land on the story: it opens the film and
// stops dead for the safety seal; it returns at the count with its attack on ignition, its drop on the rival's tumble,
// its long silence across the hesitation and its re-entry on the turn burn; it jumps once, mid swell, so its
// resolving hit lands on the docking latch, then carries the discovery. Take B's quiet ending carries the night landing and the dawn bow.
const BELL = 45.5, DROP = 92.0, LATCH = 143.0, HOME_B = 169.0;
const MUSIC: Cue[] = [
  { f: "mn_score_a", at: t("black0", 1.0), from: 0, v: 0.8, len: t("lean", 0.6) - t("black0", 1.0), fadeIn: 2.0, fadeOut: 1.4 },
  {
    f: "mn_score_a", at: t("gauge"), from: BELL - (t("bell") - t("gauge")), v: 0.95, len: t("dock", -1.0) - t("gauge"), fadeOut: 0.5,
    auto: [[t("gauge"), 1], [t("hush", -0.06), 1], [t("hush"), 0], [t("bell", -0.02), 0], [t("bell"), 1]],
  },
  { f: "mn_score_a", at: t("dock", -1.0), from: LATCH - 5.5, v: 0.95, len: t("reentry", 0.6) - t("dock", -1.0), fadeIn: 0.5, fadeOut: 1.5 },
  { f: "mn_score_b", at: t("reentry", -0.3), from: HOME_B - 1.4 - (t("bow") - t("reentry", -0.3)), v: 0.9, len: t("end") - t("reentry", -0.3), fadeIn: 0.8, fadeOut: 2.0 },
  { f: "m6_final", at: t("end"), v: 1.5, len: 6.0, fadeOut: 1.8 },
];
// The score's hits, in film time, for checking the cut against the music
export const SCORE_SYNC = { bell: t("bell"), drop: t("gauge") + DROP - (BELL - (t("bell") - t("gauge"))), tumble: t("tumble"), latch: t("dock", 4.5) };
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

export const MissionNext: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
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
      <Sequence from={f(t("dock", 4.5))} durationInFrames={9} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("pad", 0.1))} durationInFrames={f(2.8)} layout="none"><Super dur={f(2.8)} a="NORCO, CALIFORNIA" b="T-MINUS 00:05:00" /></Sequence>
      <Sequence from={f(t("lean", 0.1))} durationInFrames={f(2.9)} layout="none"><Super dur={f(2.9)} a="FLAVOR CONTROL" b="THE FLAVOR FACTORY" /></Sequence>
      <Sequence from={f(t("scale", -0.4))} durationInFrames={f(5.6)} layout="none"><EpicTitle lines={["THERABREATH:", "MISSION NEXT"]} dur={f(5.6)} size={176} over /></Sequence>
      <Sequence from={f(t("yuzu", 0.3))} durationInFrames={f(4.0)} layout="none"><Super dur={f(4.0)} a="ARCTIC YUZU" b="EXPLORATORY CONCEPT" /></Sequence>
      <Sequence from={f(t("greentea", 0.3))} durationInFrames={f(4.0)} layout="none"><Super dur={f(4.0)} a="GREEN TEA CUCUMBER" b="EXPLORATORY CONCEPT" /></Sequence>
      <Sequence from={f(t("ginger", 0.3))} durationInFrames={f(4.0)} layout="none"><Super dur={f(4.0)} a="GINGER LIME" b="EXPLORATORY CONCEPT" /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

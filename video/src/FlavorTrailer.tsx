import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Trailer. One minute, cut to a trailer score: a green-band opener, the joke in the quiet,
   title cards on the braams, the countdown on the build, one line in the silence, then the eruption.
   It ends on the title, a glimpse of the tray and a promise: now tasting, in this room.
   The film's notes follow, because the trailer shares its rules: 
   Told the way Pixar tells a story: almost wordless, carried by picture and one continuous score.
   The rockets first: a slow reveal on the pad, the hero, then the rival beside it. Then Flavor Control polls the room
   (one pause too long on Sweetness), the count, the big red button, and ignition. It raced the rival side by side, until the rival pulled ahead.
   So Flavor Control went looking for something new, from everywhere on Earth. Because of that, TheraBreath One
   found a new burn, the rival smoked out and fell behind, and the Flavor landed first. Then it came home to be tasted.
   A handful of radio lines, most of them jokes. No faces. Every hero shot is the locked bottle: white, short ribbed orange cap.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const IVORY = "#F4EDE0";
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
  | { id: string; dur: number; kind: "end" }
  | { id: string; dur: number; kind: "green" }
  | { id: string; dur: number; kind: "epic"; lines: string[]; size?: number; kicker?: string };

const SEGS: Seg[] = [
  // the green band, then the joke in the quiet
  { id: "green", dur: 2.3, kind: "green" },
  { id: "presents", dur: 2.8, kind: "epic", lines: ["THE FLAVOR FACTORY"], size: 150, kicker: "THERABREATH AND" },
  { id: "mcw", dur: 2.0, kind: "clip", clip: "v_mc", from: 0.2, zoom: [1.0, 1.05] },
  { id: "lean", dur: 2.3, kind: "clip", clip: "v_mc", from: 4.4, zoom: [1.04, 1.1] },
  { id: "every", dur: 2.3, kind: "epic", lines: ["EVERY CATEGORY", "HAS A RACE."], size: 170 },
  // the rockets
  { id: "pad", dur: 2.1, kind: "clip", clip: "w/s2_pad", from: 0.3 },
  { id: "tilt", dur: 2.1, kind: "clip", clip: "w/c1_tease", from: 6.6, zoom: [1.0, 1.05] },
  { id: "rival", dur: 2.7, kind: "clip", clip: "w/s2_pad", from: 3.15 },
  { id: "two", dur: 1.5, kind: "epic", lines: ["TWO ROCKETS."], size: 220 },
  { id: "reveal", dur: 2.14, kind: "clip", clip: "v_reveal", from: 7.2 },
  { id: "one", dur: 1.71, kind: "epic", lines: ["ONE RACE."], size: 240 },
  // the count, the button, ignition
  { id: "gauge", dur: 1.0, kind: "clip", clip: "k3a_ignite", from: 0.6, zoom: [1.06, 1.12] },
  { id: "cap", dur: 0.9, kind: "clip", clip: "v_cap", from: 8.5, zoom: [1.08, 1.14] },
  { id: "button", dur: 0.6, kind: "clip", clip: "k/n02_mctense", from: 4.02, zoom: [1.0, 1.05] },
  { id: "spark", dur: 1.0, kind: "clip", clip: "k/n18_nozzle", from: 0.7, zoom: [1.0, 1.08] },
  { id: "bell", dur: 1.66, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.1 },
  { id: "thunder", dur: 1.6, kind: "clip", clip: "w/s4_ignite", from: 0.4, shake: 0 },
  { id: "lift", dur: 2.2, kind: "clip", clip: "s02_launch", from: 6.6 },
  // the silence
  { id: "ring", dur: 2.4, kind: "clip", clip: "k/n29_earth", from: 10.9, zoom: [1.0, 1.06] },
  // the eruption: one cut on every half phrase
  { id: "relight", dur: 1.69, kind: "clip", clip: "w/x_reentrypov", from: 9.6, zoom: [1.1, 1.0] },
  { id: "blast", dur: 1.59, kind: "clip", clip: "w/s8_teams", from: 10.4, shake: 0.05 },
  { id: "race", dur: 1.71, kind: "clip", clip: "w/c4_race", from: 1.2 },
  { id: "pass", dur: 1.72, kind: "clip", clip: "w/s5_dog", from: 3.8 },
  { id: "sputter", dur: 1.72, kind: "clip", clip: "w/s6_comp", from: 6.2, zoom: [1.0, 1.06] },
  { id: "adrift", dur: 1.7, kind: "clip", clip: "w/s6_comp", from: 12.2 },
  { id: "bolt", dur: 1.71, kind: "clip", clip: "k/n23_bolt2", from: 9.6 },
  { id: "tomoon", dur: 1.72, kind: "clip", clip: "v_break", from: 7.4 },
  { id: "approach", dur: 1.72, kind: "clip", clip: "v_moonfall", from: 1.0 },
  { id: "land", dur: 1.72, kind: "clip", clip: "w/c7_flag", from: 1.6 },
  { id: "flag", dur: 1.72, kind: "clip", clip: "w/c7_flag", from: 8.2 },
  { id: "homeward", dur: 1.69, kind: "clip", clip: "k/n27_home", from: 7.48 },
  // title, a glimpse of the payoff, the promise
  { id: "title", dur: 2.6, kind: "epic", lines: ["THE FLAVOR RACE"], size: 230 },
  { id: "tray", dur: 3.7, kind: "clip", clip: "s12b_tray", from: 0.6 },
  { id: "end", dur: 3.6, kind: "epic", lines: ["NOW TASTING.", "IN THIS ROOM."], size: 170 },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const TRAILER_FRAMES = f(acc);
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



// The green band: approved for all taste buds
const GreenBand: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 4, dur - 6, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ width: 1500, height: 760, background: "#0E5E2A", border: "6px solid #E8F0E2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#F2F6EE", textAlign: "center", fontFamily: SANS }}>
        <div style={{ font: `600 46px ${SANS}`, letterSpacing: "0.04em", lineHeight: 1.3 }}>THE FOLLOWING PREVIEW HAS BEEN APPROVED FOR</div>
        <div style={{ font: `800 92px ${SANS}`, letterSpacing: "0.02em", margin: "26px 0" }}>ALL TASTE BUDS</div>
        <div style={{ font: `500 34px ${SANS}`, letterSpacing: "0.06em", opacity: 0.9 }}>BY THE FLAVOR FACTORY · NORCO, CALIFORNIA</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number; auto?: [number, number][] };
// A handful of lines, most of them jokes: the go / no-go poll, the count, the landing, the meaning,
// the rival's understatement, and Norco at the very end, who is absolutely not crying
const VO: Cue[] = [
  { f: "v4_f_sweet", at: t("mcw", 0.2), v: 1.15 },
  { f: "v4_r_sweet", at: t("lean", 0.1), v: 1.35 },
  { f: "v4_f_goflavor", at: t("pad", 0.2), v: 1 },
  { f: "v4_n_count", at: t("gauge", -0.95), v: 1 },
  { f: "v4_t_new", at: t("ring", 0.05), v: 1.1 },
  { f: "v4_c_ideal", at: t("adrift", 0.05), v: 1 },
  { f: "v4_t_landed", at: t("land", -0.3), v: 1 },
  { f: "v4_n_menthol", at: t("tray", 0.35), v: 1.1 },
];
const LEN: Record<string, number> = {
  v4_f_sweet: 1.34, v4_r_sweet: 1.62, v4_f_goflavor: 3.14, v4_n_count: 2.64, v4_t_new: 2.36, v4_c_ideal: 3.12,
  v4_t_landed: 3.94, v4_n_menthol: 3.26,
};
const RADIO = VO.filter((c) => ["v4_f_goflavor", "v4_t_new", "v4_c_ideal", "v4_t_landed"].includes(c.f));

const SFX: Cue[] = [
  { f: "x_tick", at: t("green", 0.2), v: 0.25, len: 2.0, fadeOut: 0.3 },
  // braams and slams land the cards
  { f: "x_subboom", at: t("presents"), v: 0.5 },
  { f: "amb", at: t("mcw"), v: 0.25, len: 4.3, fadeIn: 0.2, fadeOut: 0.3 },
  { f: "x4_heart", at: t("lean", 0.8), v: 0.55 },
  { f: "x_subboom", at: t("every"), v: 0.6 },
  { f: "x_flood", at: t("pad"), v: 0.7 },
  { f: "x_turbo", at: t("tilt", -0.4), v: 0.25, len: 5, fadeIn: 0.6, fadeOut: 1.5 },
  { f: "x4_whoosh", at: t("two", -0.25), v: 0.6 },
  { f: "x_subboom", at: t("two"), v: 0.55 },
  { f: "x4_whoosh", at: t("one", -0.25), v: 0.6 },
  { f: "x_subboom", at: t("one"), v: 0.65 },
  // the count
  { f: "x4_switch", at: t("gauge", 0.1), v: 0.7 },
  { f: "x4_switch", at: t("button", 0.12), v: 0.95 },
  { f: "ignite", at: t("bell"), v: 0.7, len: 5.5, fadeOut: 2 },
  { f: "x_subboom", at: t("bell", 0.1), v: 0.7 },
  { f: "x_crowd", at: t("thunder", 0.3), v: 0.3, len: 2.5, fadeIn: 0.3, fadeOut: 1 },
  // the silence holds only space
  { f: "x_space", at: t("ring", -0.4), v: 0.55, len: 3.0, fadeIn: 0.5, fadeOut: 0.4 },
  // the eruption
  { f: "x4_refuel", at: t("relight", -0.3), v: 0.8 },
  { f: "x_subboom", at: t("relight", 0.1), v: 0.8 },
  { f: "ignite", at: t("relight", 0.1), v: 0.6, len: 3, fadeOut: 1 },
  { f: "flyby", at: t("blast"), v: 0.6 },
  { f: "flyby", at: t("pass", 0.1), v: 0.55 },
  { f: "sputter", at: t("sputter", 0.2), v: 0.6 },
  { f: "x_tink", at: t("bolt", 1.0), v: 0.8 },
  { f: "lunar", at: t("land"), v: 0.6, len: 3.0, fadeOut: 0.8 },
  { f: "servo", at: t("flag", 0.3), v: 0.5 },
  // title, payoff, promise
  { f: "m6_braam", at: t("title"), v: 1.0, len: 4.0, fadeOut: 1.5 },
  { f: "x_subboom", at: t("title"), v: 0.8 },
  { f: "hatch", at: t("tray", -0.1), v: 0.5 },
  { f: "ding", at: t("tray", 0.25), v: 0.9, len: 1.2 },
  { f: "x_subboom", at: t("end"), v: 0.7 },
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// The trailer score in two pieces with a held silence between: the build, then the eruption from its first hit
const MUSIC: Cue[] = [
  { f: "m7_trailer", at: t("presents"), from: 8.3, v: 0.95, len: t("relight") - t("presents"), fadeOut: 0.8 },
  { f: "m7_trailer", at: t("relight"), from: 47.25, v: 0.95, len: t("title") - t("relight"), fadeOut: 0.06 },
  { f: "m6_final", at: t("end"), v: 1.3, len: 3.6, fadeOut: 1.4 },
];

const DUCK = 0.8;
const duckAt = (g: number) => {
  let k = 1;
  for (const c of VO) {
    const a = c.at - 0.3, b = c.at + Math.min(c.len ?? 99, LEN[c.f] ?? 2) + 0.3;
    const r = 0.4;
    const w = g < a - r || g > b + r ? 0 : g < a ? (g - (a - r)) / r : g > b ? 1 - (g - b) / r : 1;
    k = Math.min(k, 1 - (1 - DUCK) * w);
  }
  return k;
};
const autoGain = (k: [number, number][], g: number) => {
  if (g <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (g <= k[i][0]) return k[i - 1][1] + ((g - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * (k[i][1] - k[i - 1][1]);
  return k[k.length - 1][1];
};

// Master trim; the stem mix adds loudness and a limiter after render
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

export const FlavorTrailer: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "green" && <GreenBand dur={f(sg.dur)} />}
            {sg.kind === "epic" && <EpicTitle lines={sg.lines} dur={f(sg.dur)} size={sg.size} kicker={sg.kicker} />}
          </Sequence>
        );
      })}
      <Sequence from={f(t("bell", 0.1))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("relight", 0.1))} durationInFrames={10} layout="none"><Flash warm /></Sequence>
      <Sequence from={f(t("tray", 0.2))} durationInFrames={f(3.5)} layout="none"><TasteSign dur={f(3.5)} /></Sequence>
      <Sequence from={f(t("end", 1.3))} durationInFrames={f(2.3)} layout="none"><EndLogos dur={f(2.3)} /></Sequence>
      <Grain />
      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

const EndLogos: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const b = interpolate(fr, [0, 12, dur - 10, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 200 }}>
      <div style={{ opacity: b, display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 24px", display: "flex" }}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 46 }} /></div>
        <span style={{ font: `300 42px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 24px", display: "flex" }}><Img src={staticFile("img/tff-logo.png")} style={{ height: 46 }} /></div>
      </div>
    </AbsoluteFill>
  );
};

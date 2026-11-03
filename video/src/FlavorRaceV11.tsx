import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 11. Innovation versus convention: the rival just goes faster; TheraBreath stops to look,
   finds something, and The Flavor Factory turns the find into a direction. The Moon is the MacGuffin; the race is
   "who finds what's next first".
   I anticipation (macro to rocket to rival) · II launch (few shots, a held breath, then impact) · III the race and the
   choice · IV discovery, the thesis · V the solve: a signal, a new heading, a relight; the rival coughs, "not ideal",
   and we move on · the Moon · home to The Flavor Factory, warm · the button.
   No faces. Every hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
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
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; rate?: number; x?: number; grade?: string; bright?: [number, number][]; smoke?: number; soft?: number }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // I. ANTICIPATION. Detail, larger detail, partial silhouette, the whole rocket, the rival.
  { id: "black0", dur: 0.8, kind: "black" },
  { id: "umbi", dur: 1.3, kind: "clip", clip: "h/c14_umbilical", from: 1.15, zoom: [1.0, 1.03] },
  { id: "cap", dur: 1.3, kind: "clip", clip: "v11/02b1b193", from: 0.0, zoom: [1.0, 1.03] },
  { id: "bells", dur: 1.8, kind: "clip", clip: "v11/02b1b193", from: 5.0, zoom: [1.0, 1.03] },
  { id: "dark", dur: 1.6, kind: "clip", clip: "h/s10_reveal", from: 0.0, rate: 0.5, zoom: [1.0, 1.012] },
  { id: "reveal", dur: 5.6, kind: "clip", clip: "h/s10_reveal", from: 0.8, zoom: [1.012, 1.04] },
  { id: "tbpush", dur: 2.8, kind: "clip", clip: "v11/58785409", from: 0.5 },
  { id: "rival", dur: 2.4, kind: "clip", clip: "h/c01_comp_close", from: 1.6 },
  { id: "standoff", dur: 2.6, kind: "clip", clip: "v11/cc51b641", from: 7.4 },
  { id: "mcwide", dur: 3.5, kind: "clip", clip: "h/mc_ff", from: 0.0, rate: 0.84, zoom: [1.0, 1.04] },
  { id: "partners", dur: 2.85, kind: "black" },
  // II. LAUNCH. Wide, a held breath, extreme detail, violent ignition held into the lift, then one long climb.
  { id: "padwide", dur: 2.1, kind: "clip", clip: "v11/15046252", from: 0.0, zoom: [1.0, 1.03] },
  { id: "hush", dur: 0.7, kind: "black" },
  { id: "spark", dur: 1.3, kind: "clip", clip: "k/n18_nozzle", from: 0.0, zoom: [1.0, 1.08] },
  { id: "ignite", dur: 5.0, kind: "clip", clip: "v11/15046252", from: 3.0, shake: 0.3 },
  { id: "climb", dur: 6.3, kind: "clip", clip: "v11/250290ca", from: 1.4, rate: 1.3 },
  // III. THE RACE. One geography: Earth below, Moon ahead. The rival slides in, smug, then just goes faster.
  { id: "side", dur: 5.9, kind: "clip", clip: "v11/bd357d2b", from: 0.0, rate: 1.35 },
  { id: "pullaway", dur: 3.4, kind: "clip", clip: "v11/m1_pullaway", from: 0.4 },
  { id: "choice", dur: 2.1, kind: "clip", clip: "h/c04_burner_cut", from: 0.3, zoom: [1.0, 1.03] },  // TheraBreath chooses to stop
  // IV. DISCOVERY. What it stops for. Macro, optics, refraction, ingredients. Scientific, not a food ad.
  { id: "sees", dur: 2.8, kind: "clip", clip: "v11/22da0f7a", from: 1.6, x: 0.5 },
  { id: "yuzu", dur: 1.0, kind: "clip", clip: "k/n08_yuzu", from: 2.4 },
  { id: "citrus", dur: 1.5, kind: "clip", clip: "h/c05_lab_citrus", from: 2.0, zoom: [1.0, 1.04] },
  { id: "tea", dur: 0.6, kind: "clip", clip: "k/n06_tea", from: 1.2, grade: "brightness(1.3) contrast(1.05) saturate(1.2)" },
  { id: "cuke", dur: 0.7, kind: "clip", clip: "k/n04_cuke", from: 0.6 },
  { id: "cardamom", dur: 0.5, kind: "clip", clip: "k/n05_rose", from: 0.6, grade: "brightness(1.12) saturate(1.1)" },
  { id: "drop", dur: 2.8, kind: "clip", clip: "h/c06_lab_drop", from: 1.4, rate: 0.9 },
  { id: "aroma", dur: 2.8, kind: "clip", clip: "h/c08_lab_aroma", from: 0.6, zoom: [1.0, 1.04] },
  { id: "prism", dur: 2.0, kind: "clip", clip: "h/c07_lab_prism", from: 1.2, zoom: [1.02, 1.08] },
  { id: "cell", dur: 2.0, kind: "clip", clip: "h/c09_lab_cell", from: 2.0, zoom: [1.0, 1.04] },
  // V. THE SOLVE. The Flavor Factory turns the find into a direction; a signal; a new heading; the relight.
  { id: "lean", dur: 2.1, kind: "clip", clip: "h/mc_ff", from: 5.25, zoom: [1.0, 1.05] },
  { id: "press", dur: 2.2, kind: "clip", clip: "h/s11_tablet_ready_txt", from: 0.0, rate: 0.77, zoom: [1.0, 1.03] },
  { id: "signal", dur: 2.9, kind: "clip", clip: "v11/m2_signal", from: 0.4 },  // the find comes back as a signal; the fins take it up; a new heading
  { id: "relight", dur: 3.4, kind: "clip", clip: "v11/c04_relight", from: 0.5, x: 0.35 },  // the engines relight: direction, not more power
  { id: "bolt", dur: 1.9, kind: "clip", clip: "k/n03_bolt", from: 0.3, zoom: [1.0, 1.06] },
  { id: "cough", dur: 2.8, kind: "clip", clip: "v11/850bde0e", from: 1.6 },  // ends before its fireball
  // THE MOON. Approach, dust, stillness, the flag.
  { id: "approach", dur: 5.0, kind: "clip", clip: "v11/617c18bf", from: 0.5 },
  { id: "dust", dur: 1.5, kind: "clip", clip: "k/n14_dust", from: 2.9 },
  { id: "hero", dur: 4.5, kind: "clip", clip: "v11/ee6d3c48", from: 0.5 },
  { id: "homeward", dur: 3.0, kind: "clip", clip: "h/c11_homeward", from: 1.0 },
  // HOME TO THE FLAVOR FACTORY. Warmer.
  { id: "reentry", dur: 2.75, kind: "clip", clip: "w/x_reentrypov", from: 0.1 },
  { id: "descent", dur: 3.5, kind: "clip", clip: "v11/47b35301", from: 2.5 },
  { id: "touch", dur: 4.0, kind: "clip", clip: "s11_hq", from: 1.2 },
  { id: "tray", dur: 4.4, kind: "clip", clip: "s12b_tray", from: 0.6 },
  { id: "cups", dur: 2.8, kind: "clip", clip: "w/x_tray", from: 10.2 },
  { id: "hush2", dur: 0.6, kind: "black" },
  { id: "end", dur: 4.0, kind: "end" },
  // THE BUTTON
  { id: "postblack", dur: 0.5, kind: "black" },
  { id: "screw", dur: 2.6, kind: "clip", clip: "h/s99_screw_drift", from: 1.4, zoom: [1.0, 1.2] },
  { id: "endB", dur: 2.4, kind: "end" },
];

// picture events inside segments, measured off the clips (seconds from the segment start)
const RELIGHT = 1.5;  // the main engines catch (relight segment)
const COUGH = 1.02;   // 850bde0e: the rival's cough (source 2.62)
// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE11_FRAMES = f(acc);
const t = (id: string, off = 0) => AT[id] + off;

/* ---------- picture ---------- */
const ClipLayer: React.FC<{ sg: Extract<Seg, { kind: "clip" }> }> = ({ sg }) => {
  const fr = useCurrentFrame();
  const dur = f(sg.dur + (sg.x || 0));
  const fade = sg.x ? interpolate(fr, [0, f(sg.x)], [0, 1], clamp) : 1;
  const [z0, z1] = sg.zoom || [1.0, 1.035];
  // stadium lights: brightness steps keyed in seconds from the cut
  const br = sg.bright ? interpolate(fr - f(sg.x || 0), sg.bright.map(([s]) => f(s)), sg.bright.map(([, v]) => v), clamp) : null;
  const filter = [sg.grade, br !== null ? `brightness(${br})` : ""].filter(Boolean).join(" ") || undefined;
  const z = interpolate(fr, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sg.shake !== undefined) {
    const k = fr - f(sg.shake + (sg.x || 0));
    const amp = k < 0 ? 0 : 16 * Math.exp(-k / 26);
    dx = Math.sin(k * 2.3) * amp; dy = Math.cos(k * 3.1) * amp;
  }
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `translate(${dx}px, ${dy}px) scale(${z})`, filter }}>
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
      {sg.soft !== undefined && (
        <AbsoluteFill style={{ filter: "blur(10px)", maskImage: `linear-gradient(to bottom, black 0%, black ${sg.soft * 100}%, transparent ${(sg.soft + 0.07) * 100}%)`, WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${sg.soft * 100}%, transparent ${(sg.soft + 0.07) * 100}%)` }}>
          <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from - (sg.x || 0))} playbackRate={sg.rate || 1} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {sg.smoke !== undefined && <SmokeWipe p={interpolate(fr, [f(sg.smoke + (sg.x || 0)), dur], [0, 1], clamp)} k={fr} />}
    </AbsoluteFill>
  );
};

// exhaust smoke rolling in from both sides and the floor until it fills the frame (continues the smoke already in the shot)
const SMOKE = "250,236,216";
const SmokeWipe: React.FC<{ p: number; k: number }> = ({ p, k }) => {
  if (p <= 0) return null;
  const e = Easing.inOut(Easing.quad)(p);
  // billows: [start x, start y, end x, end y, radius scale]; all rise from the floor and the sides
  const B: [number, number, number, number, number][] = [
    [-200, 1000, 300, 700, 1.0], [2120, 980, 1620, 690, 1.0], [400, 1300, 640, 760, 0.9], [1520, 1300, 1300, 740, 0.9],
    [960, 1400, 960, 620, 1.1], [-260, 640, 420, 420, 0.8], [2180, 620, 1500, 400, 0.8], [960, 1500, 960, 300, 1.3],
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {B.map(([x0, y0, x1, y1, sc], i) => {
        const q = interpolate(e, [i * 0.05, Math.min(1, 0.55 + i * 0.06)], [0, 1], clamp);
        const r = (220 + 900 * q) * sc;
        const x = x0 + (x1 - x0) * q + Math.sin(k / 10 + i * 1.7) * 26, y = y0 + (y1 - y0) * q + Math.cos(k / 13 + i) * 18;
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", opacity: Math.min(1, q * 1.6),
          background: `radial-gradient(circle, rgba(${SMOKE},1) 0%, rgba(${SMOKE},0.85) 35%, rgba(${SMOKE},0) 70%)`, filter: "blur(30px)" }} />;
      })}
      <AbsoluteFill style={{ background: `rgb(${SMOKE})`, opacity: interpolate(p, [0.72, 1], [0, 1], clamp) }} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const b = interpolate(fr, [f(1.2), f(1.7)], [0, 1], clamp);
  const o = interpolate(fr, [dur - f(0.8), dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <EpicTitle lines={["TASTE THE FUTURE."]} dur={dur} size={196} y={-60} hold />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: b, display: "flex", alignItems: "center", gap: 34, marginTop: 300, transform: `translateY(${(1 - b) * 24}px)` }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 58 }} /></div>
          <span style={{ font: `300 50px ${SANS}`, color: IVORY, opacity: 0.7 }}>×</span>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 28px", display: "flex" }}><Img src={staticFile("img/tff-logo.png")} style={{ height: 58 }} /></div>
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

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number; auto?: [number, number][] };
// Five lines, no more: the count, the rival's understatement, the landing, the meaning, the question.
const VO: Cue[] = [
  { f: "v4_n_count", at: t("padwide", 0.0), v: 1 },
  { f: "v4_f_nobody", at: t("lean", 0.4), v: 1 },
  { f: "v4_c_ideal", at: t("cough", COUGH + 0.35), v: 1 },
  { f: "v4_t_landed", at: t("dust", -0.6), v: 1 },
  { f: "v4_f_together", at: t("hero", 0.9), v: 1 },
  { f: "v10_robot_taste", at: t("cups", 0.35), v: 1.0 },
];
const LEN: Record<string, number> = {
  v4_n_count: 2.69, v4_f_nobody: 2.6, v4_c_ideal: 3.16, v4_t_landed: 3.97, v4_f_together: 5.77, v10_robot_taste: 1.6,
};

// Effects are designed and rendered outside Remotion (video/sound, cues11.py) and mixed with these stems
const SFX: Cue[] = [];

// The score in three placements, each keyed to a story beat, and the song for the Moon and home:
// 1. enters under the reveal so its first hit lands on the last bank of floodlights; out as mission control appears
// 2. breathes in under the count, stops dead for the held breath, attacks on the ignition, carries the race, and
//    stops with TheraBreath's engines: the choice is made in silence
// 3. returns with the discovery (light, under the glass), lifts as The Flavor Factory solves it, lands its hit on the
//    relight, steps aside for the ting, and hands over to the song as TheraBreath heads for the Moon
const SC0 = t("reveal", 3.24) - 8.02;
const P2 = t("padwide", -0.6), P2_FROM = 33.0 - (t("ignite") - P2);
const P3 = t("sees", -0.3), P3_FROM = 77.9 - (t("relight", RELIGHT) - P3);
const SONG_AT = t("approach", -0.5);
const MUSIC: Cue[] = [
  {
    f: "m7_score", at: SC0, from: 0, v: 0.95, len: t("mcwide", 0.8) - SC0, fadeOut: 0.5,
    auto: [[SC0, 0.0], [t("reveal", 3.2), 0.0], [t("reveal", 3.26), 1], [t("standoff", 2.6), 1], [t("mcwide", 0.6), 0]],
  },
  {
    f: "m7_score", at: P2, from: P2_FROM, v: 0.95, len: t("choice", 1.4) - P2, fadeIn: 0.8, fadeOut: 0.9,
    auto: [[P2, 0.0], [P2 + 0.6, 0.7], [t("hush", -0.06), 0.9], [t("hush", 0.0), 0], [t("ignite", -0.02), 0], [t("ignite"), 1]],
  },
  {
    f: "m7_score", at: P3, from: P3_FROM, v: 0.95, len: t("approach", 0.2) - P3, fadeIn: 2.0, fadeOut: 1.6,
    auto: [[P3, 0.45], [t("cell", 1.5), 0.55], [t("lean"), 0.8], [t("relight", RELIGHT - 0.3), 1], [t("cough", 1.5), 1], [t("approach", -0.2), 0]],
  },
  { f: "licensed/mrbluesky_src", at: SONG_AT, from: 0, v: 0.6, len: t("end", 4.0) - SONG_AT, fadeIn: 0.4, fadeOut: 3.4 },
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

// Beds that may run longer than their file loop seamlessly instead of stopping
const LOOP = new Set(["x_turbo", "x_tick", "x_space", "beeps", "amb"]);
const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? LEN[c.f] ?? 30;
  return (
    <Sequence from={f(c.at)} durationInFrames={Math.max(1, f(len + (c.len ? 0 : 0.4)))} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={f(c.from || 0)}
        loop={LOOP.has(c.f)}
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

export const FlavorRaceV11: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "end" && sg.id === "end" && <EndCard dur={f(sg.dur)} />}
            {sg.kind === "end" && sg.id === "endB" && <Sequence from={-f(1.8)} layout="none"><EndCard dur={f(1.8 + sg.dur)} /></Sequence>}
          </Sequence>
        );
      })}

      <Sequence from={f(t("ignite", 0.15))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("relight", RELIGHT))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("mcwide", 0.2))} durationInFrames={f(3.0)} layout="none"><Super dur={f(3.0)} a="NORCO, CALIFORNIA" b="THE FLAVOR FACTORY · MISSION CONTROL" /></Sequence>
      <Sequence from={f(t("standoff", 0.1))} durationInFrames={f(2.5)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(2.5)} size={230} over hold /></Sequence>
      <Sequence from={f(t("partners"))} durationInFrames={f(2.85)} layout="none"><EpicTitle lines={["THERABREATH + THE FLAVOR FACTORY", "ONE MISSION: WHAT'S NEXT."]} dur={f(2.85)} size={104} /></Sequence>
      <Sequence from={f(t("citrus", 0.1))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="THE FLAVOR FACTORY" b="FLAVOR LAB" /></Sequence>
      <Sequence from={f(t("touch", 0.3))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="EWING, NEW JERSEY" b="1847 HOURS" /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

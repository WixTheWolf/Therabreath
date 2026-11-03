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
  // I. ANTICIPATION. Detail, larger detail, partial silhouette, the whole rocket, the rival. The score runs from the top.
  { id: "black0", dur: 0.8, kind: "black" },
  { id: "umbi", dur: 1.3, kind: "clip", clip: "h/c14_umbilical", from: 1.15, zoom: [1.0, 1.03] },
  { id: "cap", dur: 1.3, kind: "clip", clip: "v11/02b1b193", from: 0.0, zoom: [1.0, 1.03] },
  { id: "bells", dur: 1.8, kind: "clip", clip: "v11/02b1b193", from: 5.0, zoom: [1.0, 1.03] },
  { id: "dark", dur: 1.6, kind: "clip", clip: "h/s10_reveal", from: 0.0, rate: 0.5, zoom: [1.0, 1.012] },
  { id: "reveal", dur: 4.8, kind: "clip", clip: "h/s10_reveal", from: 0.8, zoom: [1.012, 1.04] },
  { id: "tbpush", dur: 2.2, kind: "clip", clip: "v11/58785409", from: 0.5 },
  { id: "rival", dur: 2.4, kind: "clip", clip: "h/c01_comp_close", from: 1.6 },
  { id: "standoff", dur: 2.6, kind: "clip", clip: "v11/cc51b641", from: 7.4 },
  { id: "mcwide", dur: 3.0, kind: "clip", clip: "h/mc_ff", from: 0.0, rate: 0.84, zoom: [1.0, 1.04] },
  { id: "partners", dur: 2.85, kind: "black" },
  // II. LAUNCH. The pad holds still: only vapor and cold air. The count, the button, the nozzle wakes, then fire.
  { id: "padcold", dur: 2.4, kind: "clip", clip: "h/c02_pad_cold", from: 0.0, rate: 0.83, zoom: [1.0, 1.03] },
  { id: "button", dur: 0.8, kind: "clip", clip: "k/n02_mctense", from: 3.95, zoom: [1.0, 1.04] },
  { id: "nozzle", dur: 3.0, kind: "clip", clip: "k/n18_nozzle", from: 0.0, rate: 0.8, zoom: [1.0, 1.12] },
  { id: "ignite", dur: 3.0, kind: "clip", clip: "v12/15046252", from: 2.6, shake: 0.05 },
  { id: "tbfire", dur: 2.2, kind: "clip", clip: "v12/ef0019e6", from: 0.0, shake: 0.0 },
  { id: "topdown", dur: 1.2, kind: "clip", clip: "v11/250290ca", from: 1.0 },
  { id: "track", dur: 3.2, kind: "clip", clip: "v12/g1_track", from: 0.2 },  // long-lens tracking camera loses them in the cloud
  { id: "onboard", dur: 2.0, kind: "clip", clip: "v12/g2_onboard", from: 1.0 },  // onboard camera looking aft along the hull
  { id: "pitch", dur: 2.6, kind: "clip", clip: "v12/g10_pitch", from: 0.5 },  // body-mounted camera: the pitch-over into orbit
  // III. THE RACE. Neck and neck; the rival sizes us up and just goes faster; TheraBreath chooses to stop.
  { id: "side", dur: 2.4, kind: "clip", clip: "v11/bd357d2b", from: 0.0 },
  { id: "neck", dur: 3.0, kind: "clip", clip: "v12/g11_neck", from: 0.4 },  // true side profile, matching speed
  { id: "rivalcu", dur: 1.2, kind: "clip", clip: "v11/bd357d2b", from: 5.4 },
  { id: "pullaway", dur: 3.2, kind: "clip", clip: "v11/m1_pullaway", from: 0.4 },
  { id: "choice", dur: 2.1, kind: "clip", clip: "h/c04_burner_cut", from: 0.3, zoom: [1.0, 1.03] },
  // IV. DISCOVERY.
  { id: "sees", dur: 2.2, kind: "clip", clip: "v11/22da0f7a", from: 1.6, x: 0.5 },
  { id: "yuzu", dur: 1.0, kind: "clip", clip: "k/n08_yuzu", from: 2.4 },
  { id: "citrus", dur: 1.5, kind: "clip", clip: "h/c05_lab_citrus", from: 2.0, zoom: [1.0, 1.04] },
  { id: "tea", dur: 0.6, kind: "clip", clip: "k/n06_tea", from: 1.2, grade: "brightness(1.3) contrast(1.05) saturate(1.2)" },
  { id: "cuke", dur: 0.7, kind: "clip", clip: "k/n04_cuke", from: 0.6 },
  { id: "cardamom", dur: 0.5, kind: "clip", clip: "k/n05_rose", from: 0.6, grade: "brightness(1.12) saturate(1.1)" },
  { id: "drop", dur: 2.4, kind: "clip", clip: "h/c06_lab_drop", from: 1.4, rate: 0.9 },
  { id: "aroma", dur: 2.2, kind: "clip", clip: "h/c08_lab_aroma", from: 0.6, zoom: [1.0, 1.04] },
  { id: "prism", dur: 1.6, kind: "clip", clip: "h/c07_lab_prism", from: 1.2, zoom: [1.02, 1.08] },
  { id: "cell", dur: 3.8, kind: "clip", clip: "h/c09_lab_cell", from: 0.0, zoom: [1.0, 1.04] },  // the new flavor goes into the fuel cell
  // V. THE SOLVE. No dialogue: the signal, new life, the pass, and the rival breaks down.
  { id: "lean", dur: 1.6, kind: "clip", clip: "h/mc_ff", from: 5.25 },
  { id: "press", dur: 2.6, kind: "clip", clip: "v12/g4_ready_txt", from: 0.6 },
  { id: "signal", dur: 2.6, kind: "clip", clip: "v11/m2_signal", from: 0.4 },
  { id: "transfer", dur: 3.4, kind: "clip", clip: "v12/g12_transfer", from: 0.5 },  // the flavor physically enters TheraBreath
  { id: "life", dur: 2.7, kind: "clip", clip: "v12/g5_life", from: 0.3 },
  { id: "pass", dur: 2.4, kind: "clip", clip: "v12/g6_pass", from: 0.2 },  // closes the gap and passes; hold the pass
  { id: "cough", dur: 1.6, kind: "clip", clip: "v12/g6_pass", from: 2.4 },  // only then: red light, one puff
  { id: "sputter", dur: 1.2, kind: "clip", clip: "w/s6_comp", from: 6.8 },  // its engines sputter black smoke
  // THE MOON. Touchdown, the flag comes out of the bottle, the pole, the wide, and up again through the flavors.
  { id: "approach", dur: 3.2, kind: "clip", clip: "v11/617c18bf", from: 0.5 },
  { id: "dust", dur: 2.7, kind: "clip", clip: "k/n14_dust", from: 2.9 },
  { id: "flagout", dur: 4.0, kind: "clip", clip: "w/c7_flag", from: 6.0 },
  { id: "pole", dur: 1.4, kind: "clip", clip: "k/n28_flag", from: 9.6 },
  { id: "moonlift", dur: 5.0, kind: "clip", clip: "v12/g13_moonlift", from: 0.0 },  // the wide, then up and away with the discovery
  // the joke: the old finish line. The rival finally limps down beside FUTURE OF FLAVOR. No dialogue.
  { id: "gag", dur: 4.9, kind: "clip", clip: "v12/g9_late", from: 0.1 },
  // HOME.
  { id: "homeward", dur: 2.4, kind: "clip", clip: "h/c11_homeward", from: 1.0 },
  { id: "descent", dur: 2.8, kind: "clip", clip: "v11/47b35301", from: 2.5 },
  { id: "touch", dur: 3.2, kind: "clip", clip: "s11_hq", from: 1.2 },
  { id: "robot", dur: 5.4, kind: "clip", clip: "v12/g7_robot", from: 0.0, rate: 0.92 },
  { id: "end", dur: 4.5, kind: "end" },
  { id: "black1", dur: 1.5, kind: "black" },
];


// picture events inside segments, measured off the clips (seconds from the segment start)
// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE12_FRAMES = f(acc);
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
// Two lines only: the count, and the landing.
const VO: Cue[] = [
  { f: "v4_n_count", at: t("padcold", 0.05), v: 1 },
  { f: "v4_t_landed", at: t("dust", 0.5), v: 1 },
];
const LEN: Record<string, number> = { v4_n_count: 2.69, v4_t_landed: 3.97 };

// Effects are designed and rendered outside Remotion (video/sound, cues12.py) and mixed with these stems
const SFX: Cue[] = [];

// One continuous score, composed to the locked picture (ElevenLabs, from the director's brief): it never stops,
// thins under the count, opens up on liftoff, suspends as TheraBreath stops, turns to glass for the discovery,
// rebuilds through the transfer, returns stronger on the reignition, turns reverent on the Moon, gives the late
// rival one small punctuation, warms for the robot and lands one final chord under TASTE THE FUTURE.
// The file runs long (158 s), so it is placed in three sections, each joined on a picture cut:
// its lift-off hit (35.0 s) lands on the ignition; its quiet glass section starts as TheraBreath's engines die and
// its return (103.0 s) lands on the reignition; its warm section starts on the late rival, and its final gesture
// (151.0 s) lands under TASTE THE FUTURE.
const S_A = t("ignite") - 35.0;            // film = file + S_A
const S_B = t("life") - 103.0;
const S_C = t("end", 2.8) - 151.0;
const J1 = t("choice", 1.4), J2 = t("gag");
const MUSIC: Cue[] = [
  { f: "v12_flavor_score", at: 0.0, from: -S_A, v: 0.95, len: J1 + 0.35, fadeIn: 1.5, fadeOut: 0.7 },
  { f: "v12_flavor_score", at: J1 - 0.2, from: J1 - 0.2 - S_B, v: 0.95, len: J2 + 0.2 - (J1 - 0.2), fadeIn: 0.9, fadeOut: 0.35 },
  { f: "v12_flavor_score", at: J2 - 0.1, from: J2 - 0.1 - S_C, v: 0.95, len: t("black1", 1.5) - (J2 - 0.1), fadeIn: 0.3, fadeOut: 1.2 },
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

export const FlavorRaceV12: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => {
        const x = sg.kind === "clip" ? sg.x || 0 : 0;
        return (
          <Sequence key={sg.id} from={f(AT[sg.id] - x)} durationInFrames={f(sg.dur + x)} layout="none">
            {sg.kind === "clip" && <ClipLayer sg={sg} />}
            {sg.kind === "end" && sg.id === "end" && <EndCard dur={f(sg.dur)} />}
          </Sequence>
        );
      })}

      <Sequence from={f(t("ignite", 0.15))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("life", 1.0))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

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

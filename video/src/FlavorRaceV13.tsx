import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 13, from the V12 review. Fewer inserts, longer holds, real silences.
   I anticipation (macro, a long silhouette, the reveal, the rival, the title, Flavor Control) · II launch (the count in a
   cold silence, then fire) · III the race and the choice: the rival goes faster, TheraBreath stops · IV discovery, one
   chain: aroma drifts past the dark hull, The Flavor Factory leans in, a drop, a prism, the canister is sealed, the
   engines relight, TheraBreath overtakes, the rival's thrust flickers · the Moon · the rival lands late · one shot home ·
   six glasses on a bench at The Flavor Factory · one clean end card.
   No faces. Every hero shot is the locked bottle: white, short ribbed orange cap. The rival is only ever COMPETITOR.
   The timeline is a list of segments played back to back; a segment with x dissolves in over the one before. */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

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
  // I. ANTICIPATION. True silence, a detail, a larger detail, a long silhouette, the light, the rival, the title.
  { id: "black0", dur: 1.2, kind: "black" },
  { id: "umbi", dur: 1.5, kind: "clip", clip: "h/c14_umbilical", from: 1.05, zoom: [1.0, 1.03] },
  { id: "bells", dur: 2.2, kind: "clip", clip: "v11/02b1b193", from: 4.8, zoom: [1.0, 1.035] },
  { id: "dark", dur: 2.75, kind: "clip", clip: "h/s10_reveal", from: 0.0, rate: 0.33, zoom: [1.0, 1.025] },  // the silhouettes hold
  { id: "reveal", dur: 4.8, kind: "clip", clip: "h/s10_reveal", from: 0.9, zoom: [1.025, 1.05] },
  { id: "tbpush", dur: 2.6, kind: "clip", clip: "v11/58785409", from: 0.4 },
  { id: "rival", dur: 2.6, kind: "clip", clip: "h/c01_comp_close", from: 1.4 },
  { id: "standoff", dur: 3.0, kind: "clip", clip: "v11/cc51b641", from: 7.2 },
  { id: "mcwide", dur: 3.4, kind: "clip", clip: "h/mc_ff", from: 0.0, rate: 0.84, zoom: [1.0, 1.04] },
  // II. LAUNCH. The count in a cold silence on the pad, a held breath, then fire.
  { id: "padcold", dur: 4.1, kind: "clip", clip: "h/c02_pad_cold", from: 0.0, rate: 0.83, zoom: [1.0, 1.035] },
  { id: "ignite", dur: 3.4, kind: "clip", clip: "v12/15046252", from: 2.6, shake: 0.05 },
  { id: "tbfire", dur: 2.6, kind: "clip", clip: "v12/ef0019e6", from: 0.0, shake: 0.0 },
  { id: "track", dur: 3.2, kind: "clip", clip: "v12/g1_track", from: 0.2 },  // long-lens tracking camera loses them in the cloud
  { id: "onboard", dur: 2.4, kind: "clip", clip: "v12/g2_onboard", from: 0.8 },  // onboard camera looking aft along the hull
  { id: "pitch", dur: 2.8, kind: "clip", clip: "v12/g10_pitch", from: 0.4 },  // body-mounted camera: the pitch-over into orbit
  // III. THE RACE. Neck and neck; the rival just goes faster; TheraBreath chooses to stop.
  { id: "side", dur: 2.8, kind: "clip", clip: "v11/bd357d2b", from: 0.0 },
  { id: "neck", dur: 3.2, kind: "clip", clip: "v12/g11_neck", from: 0.3 },  // true side profile, matching speed
  { id: "rivalcu", dur: 1.5, kind: "clip", clip: "v11/bd357d2b", from: 5.3 },
  { id: "pullaway", dur: 3.4, kind: "clip", clip: "v11/m1_pullaway", from: 0.3 },
  { id: "choice", dur: 3.8, kind: "clip", clip: "v13/c1_cutoff", from: 0.2 },  // the engines die; its last frame is the next shot's first
  // IV. DISCOVERY, one chain: aroma past the dark hull, the lean, the drop, the prism, the seal, the relight, the overtake.
  { id: "particles", dur: 5.0, kind: "clip", clip: "v13/p2_particles", from: 0.0 },  // one continuous take with the cutoff
  { id: "lean", dur: 2.2, kind: "clip", clip: "h/mc_ff", from: 5.1 },
  { id: "drop", dur: 3.0, kind: "clip", clip: "h/c06_lab_drop", from: 1.25, rate: 0.9 },
  { id: "prism", dur: 2.5, kind: "clip", clip: "h/c07_lab_prism", from: 1.0, zoom: [1.02, 1.08] },
  { id: "seal", dur: 3.0, kind: "clip", clip: "w/s1_fuel", from: 9.5 },  // the canister is sealed
  { id: "reignite", dur: 3.6, kind: "clip", clip: "v13/r2_reignite", from: 0.05 },  // dark, then the engines flash at source 0.96 s
  { id: "overtake", dur: 4.6, kind: "clip", clip: "v13/o1_overtake", from: 0.1 },  // it shrinks into the Moon
  { id: "flicker", dur: 2.4, kind: "clip", clip: "v13/f1_flicker", from: 0.3 },  // the rival's thrust stutters; no smoke
  // THE MOON. The approach, touchdown in silence, the flag, the pole, the lift-off.
  { id: "approach", dur: 4.0, kind: "clip", clip: "v11/617c18bf", from: 0.3 },
  { id: "dust", dur: 3.2, kind: "clip", clip: "k/n14_dust", from: 2.8 },
  { id: "flagout", dur: 4.6, kind: "clip", clip: "w/c7_flag", from: 5.8 },
  { id: "pole", dur: 1.5, kind: "clip", clip: "k/n28_flag", from: 9.5 },
  { id: "moonlift", dur: 5.0, kind: "clip", clip: "v12/g13_moonlift", from: 0.0 },
  // the joke, two seconds: the rival finally lands beside the flag.
  { id: "gag", dur: 2.0, kind: "clip", clip: "v12/g9_late", from: 1.1 },
  // HOME. One shot, then six glasses on a bench at The Flavor Factory.
  { id: "homeward", dur: 3.0, kind: "clip", clip: "h/c11_homeward", from: 1.0 },
  { id: "tasting", dur: 6.8, kind: "clip", clip: "v13/t2_tasting", from: 0.0, rate: 0.74, zoom: [1.0, 1.03] },
  { id: "end", dur: 4.0, kind: "end" },
  { id: "black1", dur: 1.0, kind: "black" },
];


// picture events inside segments, measured off the clips (seconds from the segment start)
// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE13_FRAMES = f(acc);
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

// One clean end card: the line resolves quietly (no slam, no embers), then both logos, large, on white
const METAL = "linear-gradient(180deg, #FFFFFF 0%, #F7EEDD 34%, #C9A46A 50%, #FFF4DE 62%, #A7834F 100%)";
const EndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const tIn = interpolate(fr, [0, f(0.8)], [0, 1], { ...clamp, easing: ease });
  const lIn = interpolate(fr, [f(0.45), f(1.15)], [0, 1], { ...clamp, easing: ease });
  const o = interpolate(fr, [dur - f(0.7), dur], [1, 0], clamp);
  const pill: React.CSSProperties = { background: "#fff", borderRadius: 20, padding: "22px 40px", display: "flex", boxShadow: "0 10px 40px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ opacity: o, background: "#000" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 42% at 50% 52%, rgba(120,70,30,.20), rgba(0,0,0,0) 70%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: tIn, transform: `translateY(-112px) scale(${1.03 - 0.03 * tIn + interpolate(fr, [0, dur], [0, 0.02])})`, filter: `blur(${(1 - tIn) * 8}px) drop-shadow(0 0 24px rgba(255,170,90,.28))`,
          font: `800 150px/0.9 "Archivo", "Arial Narrow", sans-serif`, fontStretch: "66%", letterSpacing: "0.06em", paddingLeft: "0.06em", whiteSpace: "nowrap",
          background: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>TASTE THE FUTURE.</div>
        <div style={{ position: "absolute", top: 600, opacity: lIn, display: "flex", alignItems: "center", gap: 56, transform: `translateY(${(1 - lIn) * 22}px)` }}>
          <div style={pill}><Img src={staticFile("img/therabreath-logo.png")} style={{ height: 104 }} /></div>
          <div style={{ width: 2, height: 96, background: "rgba(244,237,224,.45)" }} />
          <div style={pill}><Img src={staticFile("img/tff-logo.png")} style={{ height: 104 }} /></div>
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

// Location super, bottom left (or top left over a bright foreground), mono, like a mission log
const Super: React.FC<{ dur: number; a: string; b: string; top?: boolean }> = ({ dur, a, b, top }) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  const n = Math.floor(interpolate(fr, [4, 34], [0, a.length], clamp));
  return (
    <AbsoluteFill style={{ justifyContent: top ? "flex-start" : "flex-end", padding: top ? "160px 0 0 120px" : "0 0 160px 120px" }}>
      <div style={{ opacity: o, color: IVORY, textShadow: "0 2px 18px rgba(0,0,0,.8)" }}>
        <div style={{ font: `600 30px ${MONO}`, letterSpacing: "0.32em" }}>{a.slice(0, n)}<span style={{ opacity: fr % 16 < 8 ? 1 : 0 }}>_</span></div>
        <div style={{ font: `500 20px ${MONO}`, letterSpacing: "0.4em", marginTop: 12, color: "#FF7A3D" }}>{b}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number; auto?: [number, number][] };
// Two lines only: the count, and the landing. No line at the tasting.
const VO: Cue[] = [
  { f: "v4_n_count", at: t("padcold", 0.35), v: 1 },   // "one" ends 1.2 s before the ignition: a held breath
  { f: "v4_t_landed", at: t("dust", 0.5), v: 1 },
];
const LEN: Record<string, number> = { v4_n_count: 2.69, v4_t_landed: 3.97 };

// Effects are designed and rendered outside Remotion (video/sound, cues12.py) and mixed with these stems
const SFX: Cue[] = [];

// One score (ElevenLabs, composed to the V12 picture), re-placed for V13 in four sections. Each keeps the score's own
// clock (film = file + S), so nothing is time-stretched, and the gaps between them are real silences:
// the pad enters with the third light bank and stops dead on the cut to the cold pad, so the count plays in silence;
// the lift-off section starts on the ignition cut (its cymbal swell peaks at 36.0 s as the rockets clear the tower) and
// stops when TheraBreath's engines die; the glass section enters under the drifting aroma, rises through the lab, lands
// its return (103.4 s) on the relight and carries the race, the Moon and the late rival home; the tasting is silent;
// the final gesture (150.0 s) lands on the end card and its decay carries the card to black.
// The silences inside a section (the touchdown) are carved in the mix: sound/events13.py, MUSIC_CUTS.
const BANK3 = t("reveal", 3.1);
const IGN = t("ignite");
export const RELIGHT13 = t("reignite", 0.95);   // the engines flash
const S1 = BANK3 - 14.15, S2 = IGN - 35.0, S3 = RELIGHT13 - 103.4, S4 = t("end", 0.4) - 150.0;
const sec = (at: number, until: number, S: number, fadeIn: number, fadeOut: number): Cue =>
  ({ f: "v12_flavor_score", at, from: at - S, v: 0.95, len: until - at, fadeIn, fadeOut });
const MUSIC: Cue[] = [
  sec(BANK3 - 0.25, t("padcold", 0.3), S1, 0.5, 0.3),
  sec(IGN - 0.05, t("choice", 2.4), S2, 0.05, 0.6),
  sec(t("particles", 0.2), t("tasting", 1.2), S3, 2.5, 1.0),
  sec(t("end", -0.2), t("black1", 0.6), S4, 0.5, 0.3),
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

export const FlavorRaceV13: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
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

      <Sequence from={f(t("mcwide", 0.2))} durationInFrames={f(3.0)} layout="none"><Super dur={f(3.0)} a="NORCO, CALIFORNIA" b="THE FLAVOR FACTORY · MISSION CONTROL" /></Sequence>
      <Sequence from={f(t("standoff", 0.1))} durationInFrames={f(2.8)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(2.8)} size={230} over hold /></Sequence>
      <Sequence from={f(t("drop", 0.2))} durationInFrames={f(2.6)} layout="none"><Super dur={f(2.6)} a="THE FLAVOR FACTORY" b="FLAVOR LAB" /></Sequence>
      <Sequence from={f(t("tasting", 3.7))} durationInFrames={f(2.9)} layout="none"><Super dur={f(2.9)} a="THE FLAVOR FACTORY" b="TASTING LAB · 1847 HOURS" top /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

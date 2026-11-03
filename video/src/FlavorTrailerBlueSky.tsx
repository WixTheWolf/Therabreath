import React from "react";
import { EpicTitle } from "./epic";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Trailer for the V9 cut, cut to "Mr. Blue Sky", about 40 s.
   The rocket in the dark as the song starts from the top; the stadium lights bang on with its piano pulse, the rival
   is floodlit, go, go, go. The song drops out for three, two, one, and returns on ignition: the race, a glimpse of the
   lab, the relight, the rival in trouble, TheraBreath pulling away. The title eases in as the song plays on and
   fades; then one last look at the rival, adrift. The music is its own bus (stem "music"). */
const FPS = 30;
const f = (sec: number) => Math.round(sec * FPS);

const MONUMENT = '"Archivo", "Arial Narrow", sans-serif'; // condensed theatrical titles
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
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
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; rate?: number; x?: number; grade?: string; bright?: [number, number][] }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "card"; lines: string[]; size?: number; slam?: boolean }
  | { id: string; dur: number; kind: "logos" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  // the rocket in the dark while the song starts from the top; the lights bang on with its piano pulse
  { id: "black0", dur: 0.4, kind: "black" },
  { id: "silhouette", dur: 4.11, kind: "clip", clip: "w/s2_pad", from: 0.2, rate: 0.69, zoom: [1.0, 1.06], grade: "brightness(0.45) contrast(1.15)" },
  { id: "lights", dur: 2.5, kind: "clip", clip: "w/c2_reveal", from: 1.0, zoom: [1.0, 1.05], bright: [[0, 0.06], [0.02, 0.36], [0.33, 0.36], [0.37, 0.66], [0.7, 0.66], [0.72, 1.18], [1.2, 1.0]] },
  { id: "rival", dur: 1.41, kind: "clip", clip: "w/s2_pad", from: 3.3 },
  // go, go, go on the pulse
  { id: "tablet", dur: 0.63, kind: "clip", clip: "w/s3_gonogo", from: 3.6, zoom: [1.04, 1.08] },
  { id: "screen", dur: 0.68, kind: "clip", clip: "w/s3_gonogo", from: 8.0, zoom: [1.0, 1.06] },
  { id: "room2", dur: 0.81, kind: "clip", clip: "k/n21_glass", from: 13.4, zoom: [1.0, 1.05] },
  // the song drops out: three, two, one
  { id: "count", dur: 2.8, kind: "clip", clip: "w/c2_reveal", from: 5.6, zoom: [1.02, 1.12] },
  { id: "button", dur: 0.6, kind: "clip", clip: "k/n02_mctense", from: 4.02, zoom: [1.0, 1.05] },
  { id: "spark", dur: 0.8, kind: "clip", clip: "k/n18_nozzle", from: 0.3, zoom: [1.0, 1.08] },
  { id: "hush", dur: 0.4, kind: "black" },
  // it comes back on ignition; every cut on the song's eighth notes
  { id: "bell", dur: 1.0059, kind: "clip", clip: "w/s4_ignite", from: 3.0, shake: 0.1 },
  { id: "thunder", dur: 1.0059, kind: "clip", clip: "w/s4_ignite", from: 0.6, shake: 0 },
  { id: "lift", dur: 1.3412, kind: "clip", clip: "s02_launch", from: 6.6 },
  { id: "climb", dur: 1.3412, kind: "clip", clip: "v_clouds", from: 6.6 },
  { id: "race", dur: 1.0059, kind: "clip", clip: "w/c4_race", from: 1.0 },
  { id: "shoulder", dur: 1.6765, kind: "clip", clip: "s03_orbit", from: 4.4 },
  { id: "drip", dur: 0.6706, kind: "clip", clip: "w/s1_fuel", from: 4.5 },
  { id: "swirl", dur: 0.6706, kind: "clip", clip: "w/s1_fuel", from: 7.4 },
  { id: "through", dur: 1.0059, kind: "clip", clip: "w/x_globe", from: 3.4 },
  { id: "relight", dur: 1.0059, kind: "clip", clip: "w/x_reentrypov", from: 9.8, zoom: [1.08, 1.0] },
  { id: "bolt", dur: 1.0059, kind: "clip", clip: "k/n03_bolt", from: 0.8, zoom: [1.0, 1.06] },
  { id: "sputter", dur: 1.0059, kind: "clip", clip: "w/s6_comp", from: 6.4, zoom: [1.0, 1.05] },
  { id: "flare", dur: 1.0059, kind: "clip", clip: "w/s6_comp", from: 9.1 },
  { id: "tomoon", dur: 1.6765, kind: "clip", clip: "v_break", from: 7.4 },
  // the title eases in while the song plays on, then everything fades
  { id: "titlecard", dur: 6.0, kind: "black" },
  { id: "gap", dur: 0.4, kind: "black" },
  // and one last look at the rival
  { id: "tag", dur: 2.8, kind: "clip", clip: "w/s6_comp", from: 12.1, zoom: [1.0, 1.04] },
  { id: "tail", dur: 0.9, kind: "black" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const TRAILER_BLUESKY_FRAMES = f(acc);
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
  { f: "v4_r_aroma", at: t("tablet", 0.04), v: 1 },
  { f: "v4_r_sweet_go", at: t("screen", 0.06), v: 1.3 },
  { f: "v4_r_finish_go", at: t("room2", 0.03), v: 1.1 },
  { f: "v4_n_count", at: t("count", 0.15), v: 1.05 },
  { f: "v4_c_ideal", at: t("tag", 0.35), v: 1.05 },
];
const RADIO = VO.filter((c) => c.f === "v4_c_ideal");
const LEN: Record<string, number> = {
  v4_f_aroma: 4.04, v4_r_aroma: 0.4, v4_f_sweet: 1.34, v4_r_sweet: 1.62, v4_f_goflavor: 3.14, v4_n_count: 2.64,
  v4_c_ideal: 3.12, v4_t_landed: 3.94, v4_f_together: 5.74, v4_n_menthol: 3.26,
  v4_r_sweet_go: 0.28, v4_r_finish_go: 0.55, v4_f_cooling: 0.54, v4_f_finish: 0.96,
};


// Sound design: every effect has a tail or a fade, nothing starts or stops dead
const SFX: Cue[] = [
  // in the dark: a low rumble, something reversing, far away
  { f: "x_turbo_bed", at: t("black0"), v: 0.1, len: t("lights", 0.4), fadeIn: 1.5, fadeOut: 0.3 },
  { f: "x_crawler", at: t("silhouette", 0.6), v: 0.3, len: t("lights") - t("silhouette", 0.6), fadeIn: 0.8, fadeOut: 0.2 },
  { f: "x_backup", at: t("silhouette", 1.8), v: 0.16, len: t("lights") - t("silhouette", 1.8), fadeOut: 0.1 },
  // three banks of lights on the song's pulse, then the rival
  { f: "x_flood", at: t("lights", 0.0), v: 0.6 },
  { f: "x_flood", at: t("lights", 0.37), v: 0.75 },
  { f: "x_flood", at: t("lights", 0.72), v: 0.95 },
  { f: "x_subboom", at: t("lights", 0.74), v: 0.6 },
  { f: "x_flood", at: t("rival", 0.03), v: 0.7 },
  { f: "x_subboom", at: t("rival", 0.05), v: 0.4 },
  ...["tablet", "screen", "room2"].map((id) => ({ f: "x_metro", at: t(id, -0.02), v: 0.35 })),
  // silence, three heartbeats, the button, the spark
  ...[0, 1, 2].map((i) => ({ f: "x4_heart", at: t("count", 0.25 + i * 0.95), v: 0.8 })),
  { f: "x_space_bed", at: t("count"), v: 0.35, len: t("hush") - t("count"), fadeIn: 0.3, fadeOut: 0.1 },
  { f: "x4_switch", at: t("button", 0.12), v: 1.0 },
  { f: "x_static", at: t("spark", 0.2), v: 0.25, len: 0.5, fadeIn: 0.15, fadeOut: 0.1 },
  // ignition and the race
  { f: "ignite", at: t("bell"), v: 0.6, len: 4.4, fadeOut: 1.4 },
  { f: "x_subboom", at: t("bell", 0.1), v: 0.7 },
  { f: "flyby", at: t("climb", 0.1), v: 0.3 },
  { f: "flyby", at: t("race", 0.2), v: 0.3 },
  { f: "x4_whoosh", at: t("shoulder", 0.8), v: 0.4 },
  { f: "x4_drip", at: t("drip", 0.25), v: 0.5 },
  { f: "x4_whoosh", at: t("through", -0.1), v: 0.3 },
  { f: "x4_refuel", at: t("relight", -0.25), v: 0.6 },
  { f: "x_subboom", at: t("relight", 0.15), v: 0.5 },
  { f: "x_tink", at: t("bolt", 0.6), v: 0.8 },
  { f: "sputter", at: t("sputter", 0.1), v: 0.55, len: 1.6, fadeOut: 0.5 },
  { f: "x_whoomph", at: t("flare", 0.85), v: 0.8 },
  { f: "flyby", at: t("tomoon", 0.1), v: 0.4 },
  // the tag: the rival, smoking, adrift
  { f: "x_space_bed", at: t("gap"), v: 0.4, len: t("tail", 0.6) - t("gap"), fadeIn: 0.3, fadeOut: 0.6 },
  { f: "sputter", at: t("tag", 0.1), v: 0.3, len: 2.0, fadeOut: 1.0 },
  { f: "x_tink", at: t("tag", 2.3), v: 0.45 },
  ...RADIO.map((c) => ({ f: "x4_quindar", at: c.at - 0.22, v: 0.3, len: 0.4 })),
];

// One continuous score, composed to this cut and never cut into. It starts 0.2 s early so that its breath
// and attack land on the countdown silence and the ignition, its hit lands on the relight, its drop on the
// sputter, its long silence holds the landing, and its return arrives as the flag unfurls.
// The only shaping is gain: it stops dead for the hush, eases back for the drift and for Flavor Control's search,
// and gives way to the final chord.
// Music: "Mr. Blue Sky" (ELO), the file supplied by the client for this private screening.
// The intro enters on the last bank of lights, placed so its accent at 0:04.48 lands on the rival's
// floodlight and its pulses at 0:07.32, 0:08.02 and 0:08.65 carry the three go's. It stops before the band arrives.
// It returns on the full-band downbeat at 2:18.47 on ignition; every cut after that sits on its eighth-note grid,
// and the title slams on the downbeat at 2:33.89.
const SONG = "licensed/mrbluesky_src";
// From the top, under the dark pad; the lights bang on with its piano pulse at 0:04.11, the rival's floodlight on
// its accent at 0:06.61, the three go's on 0:08.02, 0:08.65 and 0:09.33. It stops at 0:10.14 for the countdown.
const M1 = t("black0", 0.4);
// It returns on the full-band downbeat at 2:18.47 on ignition, plays on under the title and fades out slowly.
const M2 = t("bell"), M2_FROM = 138.47;
const MUSIC: Cue[] = [
  { f: SONG, at: M1, from: 0, v: 0.62, len: t("count", 0.06) - M1, fadeOut: 0.12 },
  { f: SONG, at: M2, from: M2_FROM, v: 0.66, len: t("gap") - M2, fadeOut: 3.4 },
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

export const FlavorTrailerBlueSky: React.FC<{ stem?: string }> = ({ stem = "all" }) => {
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

      <Sequence from={f(t("titlecard"))} durationInFrames={f(6.0)} layout="none"><EpicTitle lines={["THE FLAVOR RACE"]} dur={f(6.0)} size={230} soft kicker="THERABREATH AND THE FLAVOR FACTORY" /></Sequence>

      <Grain />

      {(stem === "all" || stem === "music") && MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {(stem === "all" || stem === "sfx") && SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
      {(stem === "all" || stem === "vo") && VO.map((c, i) => <CueAudio key={`v${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

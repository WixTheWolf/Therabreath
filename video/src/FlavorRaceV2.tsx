import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · Version 2.
   Apollo 13 scale, Interstellar wonder, Super Bowl polish, just enough absurdity.
   The film takes itself completely seriously; that is why the jokes land.
   The timeline is a list of segments played back to back; sound cues are pinned to segments. */
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
  | { id: string; dur: number; kind: "clip"; clip: string; from: number; zoom?: [number, number]; shake?: number; fadeIn?: boolean }
  | { id: string; dur: number; kind: "black" }
  | { id: string; dur: number; kind: "card"; lines: string[]; size?: number; slam?: boolean }
  | { id: string; dur: number; kind: "timer" }
  | { id: string; dur: number; kind: "end" };

const SEGS: Seg[] = [
  { id: "black0", dur: 0.8, kind: "black" },
  { id: "timer", dur: 1.8, kind: "timer" },
  { id: "macro", dur: 2.8, kind: "clip", clip: "s01_macro", from: 0.5, zoom: [1.08, 1.16] },
  { id: "everycat", dur: 2.0, kind: "card", lines: ["EVERY CATEGORY", "HAS A RACE."], size: 210 },
  { id: "gap1", dur: 0.3, kind: "black" },
  { id: "reveal", dur: 5.2, kind: "clip", clip: "v_reveal", from: 0.8 },
  { id: "mc1", dur: 2.2, kind: "clip", clip: "v_mc", from: 0 },
  { id: "cap", dur: 2.6, kind: "clip", clip: "v_cap", from: 5.8 },
  { id: "count", dur: 3.4, kind: "clip", clip: "s02_launch", from: 0, zoom: [1.0, 1.05] },
  { id: "hush", dur: 0.3, kind: "black" },
  { id: "ignite", dur: 5.0, kind: "clip", clip: "s02_launch", from: 3.4, shake: 0 },
  { id: "solo", dur: 1.2, kind: "clip", clip: "v_moon", from: 1.9, shake: 0 },
  { id: "ascent", dur: 6.0, kind: "clip", clip: "v_clouds", from: 3.0 },
  { id: "space", dur: 3.4, kind: "clip", clip: "s03_orbit", from: 0 },
  { id: "track", dur: 2.0, kind: "clip", clip: "v_mc", from: 5.8, zoom: [1.05, 1.14] },
  { id: "follow", dur: 1.15, kind: "card", lines: ["FOLLOW?"], size: 360, slam: true },
  { id: "lead", dur: 1.25, kind: "card", lines: ["OR LEAD?"], size: 360, slam: true },
  { id: "ahead", dur: 2.2, kind: "clip", clip: "s03_orbit", from: 6.2 },
  { id: "boom", dur: 5.6, kind: "clip", clip: "s04_boom", from: 0, shake: 4.7 },
  { id: "after", dur: 4.8, kind: "clip", clip: "s05_after", from: 0 },
  { id: "break", dur: 3.0, kind: "clip", clip: "v_break", from: 6.7, shake: 0 },
  { id: "chase", dur: 1.4, kind: "card", lines: ["DON'T CHASE", "WHAT'S NEXT."], size: 200 },
  { id: "gap2", dur: 0.5, kind: "black" },
  { id: "first", dur: 2.0, kind: "card", lines: ["GET THERE", "FIRST."], size: 250, slam: true },
  { id: "approach", dur: 4.2, kind: "clip", clip: "v_moonfall", from: 0.3 },
  { id: "descent", dur: 4.4, kind: "clip", clip: "s06_land_fix", from: 2.4 },
  { id: "flag", dur: 6.3, kind: "clip", clip: "s07_flag", from: 0, zoom: [1.0, 1.06] },
  { id: "pull", dur: 2.4, kind: "clip", clip: "s08_earth", from: 4.2 },
  { id: "ingr1", dur: 2.2, kind: "clip", clip: "v_ingr", from: 0.1 },
  { id: "ingr2", dur: 2.7, kind: "clip", clip: "v_ingr", from: 6.7 },
  { id: "ret", dur: 3.8, kind: "clip", clip: "s10_return", from: 3.8, shake: 1.5 },
  { id: "hq", dur: 4.8, kind: "clip", clip: "s11_hq", from: 3.4, shake: 3.1 },
  { id: "hatch", dur: 1.8, kind: "clip", clip: "s12_hatch", from: 0, zoom: [1.12, 1.14] },
  { id: "tray1", dur: 1.3, kind: "clip", clip: "s12b_tray", from: 0 },
  { id: "back", dur: 1.9, kind: "card", lines: ["WE BROUGHT", "SOMETHING BACK."], size: 200 },
  { id: "tray2", dur: 1.1, kind: "clip", clip: "s12b_tray", from: 1.3 },
  { id: "future", dur: 1.3, kind: "card", lines: ["THE FUTURE."], size: 300, slam: true },
  { id: "tray3", dur: 3.6, kind: "clip", clip: "s12b_tray", from: 2.4 },
  { id: "gap3", dur: 0.6, kind: "black" },
  { id: "end", dur: 4.6, kind: "end" },
];

// Start time of every segment
const AT: Record<string, number> = {};
let acc = 0;
for (const sg of SEGS) { AT[sg.id] = acc; acc += sg.dur; }
export const RACE2_FRAMES = f(acc);
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
      <OffthreadVideo src={staticFile(`race/clips/${sg.clip}.mp4`)} muted startFrom={f(sg.from)} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
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

const Timer: React.FC<{ dur: number }> = ({ dur }) => {
  const fr = useCurrentFrame();
  const on = interpolate(fr, [0, 3, 5, 7], [0, 1, 0.4, 1], clamp) * interpolate(fr, [dur - 4, dur], [1, 0], clamp);
  const secs = 60 - Math.floor(fr / FPS);
  const txt = `T-00:${secs === 60 ? "01:00" : `00:${String(secs).padStart(2, "0")}`}`;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: on, font: `500 120px ${MONO}`, letterSpacing: "0.08em", color: "#FF7A3D", textShadow: "0 0 18px rgba(255,110,40,.85), 0 0 60px rgba(255,80,20,.45)" }}>{txt}</div>
      <div style={{ opacity: on * 0.55, marginTop: 26, font: `500 20px ${MONO}`, letterSpacing: "0.5em", color: "#FF7A3D" }}>MISSION ELAPSED</div>
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

/* ---------- sound ---------- */
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number };
const SFX: Cue[] = [
  { f: "x_subboom", at: t("timer"), v: 0.8 },
  { f: "x_breath", at: t("timer", 0.3), v: 0.7, len: 7.0, fadeOut: 1.2 },
  { f: "amb", at: t("macro"), v: 0.6, len: 6.0, fadeIn: 1, fadeOut: 1 },
  { f: "x_subboom", at: t("everycat"), v: 0.55 },
  { f: "x_flood", at: t("reveal"), v: 0.9 },
  { f: "amb", at: t("reveal", 1), v: 0.5, len: 10, fadeIn: 1, fadeOut: 1 },
  { f: "x_subboom", at: t("reveal", 3.3), v: 0.8 },
  { f: "radio2_tminus", at: t("mc1", 0.4), v: 1.0 },
  { f: "x_breath", at: t("cap"), v: 0.45, from: 3, len: 3.0 },
  { f: "radio2_count", at: t("count", -0.15), v: 1.0, len: 3.55 },
  { f: "ignite", at: t("ignite"), v: 0.55, fadeOut: 2 },
  { f: "x_subboom", at: t("ignite"), v: 0.55 },
  { f: "flyby", at: t("ascent", 1.5), v: 0.3 },
  { f: "x_space", at: t("space"), v: 0.8, len: 6.0, fadeOut: 1 },
  { f: "flyby", at: t("ahead", 0.2), v: 0.45 },
  { f: "x_beep1", at: t("boom", 0.25), v: 0.75 },
  { f: "x_beep1", at: t("boom", 1.5), v: 0.75 },
  { f: "radio2_uh", at: t("boom", 1.9), v: 0.95 },
  { f: "sputter", at: t("boom", 2.6), v: 0.55 },
  { f: "x_beep1", at: t("boom", 3.7), v: 0.8 },
  { f: "x_whoomph", at: t("boom", 4.55), v: 0.95 },
  { f: "flyby", at: t("after", 2.6), v: 0.55 },
  { f: "radio2_notideal", at: t("after", 1.2), v: 1.0 },
  { f: "ignite", at: t("break"), v: 0.35, from: 3, len: 3, fadeOut: 1 },
  { f: "x_subboom", at: t("first"), v: 0.55 },
  { f: "x_space", at: t("approach"), v: 0.6, len: 4.8, fadeIn: 1 },
  { f: "lunar", at: t("descent", 0.1), v: 0.85 },
  { f: "servo", at: t("flag", 0.5), v: 0.8 },
  { f: "radio2_home", at: t("ret", 0.1), v: 1.0 },
  { f: "x_static", at: t("ret", 1.3), v: 0.6 },
  { f: "reentry", at: t("ret", 0.8), v: 0.55 },
  { f: "vland", at: t("hq", 0.1), v: 0.45 },
  { f: "x_subboom", at: t("hq", 3.1), v: 0.55 },
  { f: "x_tick", at: t("hatch", 0.3), v: 1.0 },
  { f: "hatch", at: t("hatch", 0.9), v: 0.9 },
  { f: "ding", at: t("tray3", 2.5), v: 1.0, len: 1.0 },
];
// Score cues start on the beats they serve
const MUSIC: Cue[] = [
  { f: "m_tension", at: t("reveal", 1.0), v: 0.42, len: t("hush") - t("reveal", 1.0), fadeIn: 3 },
  { f: "m_launch", at: t("ignite"), v: 0.45, len: t("space", 0.6) - t("ignite"), fadeOut: 3.0 },
  { f: "m_race", at: t("track"), v: 0.55, len: t("boom", 0.25) - t("track") },
  { f: "m_break", at: t("break"), v: 0.55, len: t("gap2") - t("break") },
  { f: "m_launch", at: t("first"), v: 0.42, len: 4.5, fadeOut: 2.5 },
  { f: "score_a", at: t("flag", 0.4), v: 0.45, from: 0, len: t("ret") - t("flag", 0.4), fadeIn: 2.0, fadeOut: 1.0 },
  { f: "score_a", at: t("ret"), v: 0.55, from: 84, len: t("hq", 3.1) - t("ret"), fadeIn: 0.5 },
  { f: "m_launch", at: t("tray1"), v: 0.38, from: 14.5, len: t("gap3") - t("tray1"), fadeIn: 1.0 },
  { f: "m_final", at: t("end", -1.85), v: 0.75, from: 0, len: 7.5 },
];
const DUCKS: [number, number, number][] = [
  [t("mc1", 0.3), t("mc1", 1.9), 0.5],
  [t("count", -0.2), t("count", 3.4), 0.55],
  [t("after", 1.1), t("after", 4.6), 0.4],
  [t("ret"), t("ret", 3.6), 0.45],
];

const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? 30;
  return (
    <Sequence from={f(c.at)} durationInFrames={Math.max(1, f(len))} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={f(c.from || 0)}
        volume={(fr) => {
          const s = fr / FPS;
          let v = c.v;
          if (c.fadeIn) v *= Math.min(1, s / c.fadeIn);
          if (c.fadeOut) v *= Math.min(1, Math.max(0, (len - s) / c.fadeOut));
          if (duck) for (const [a, b, k] of DUCKS) { const g = c.at + s; if (g > a && g < b) v *= k; }
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRaceV2: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((sg) => (
        <Sequence key={sg.id} from={f(AT[sg.id])} durationInFrames={f(sg.dur)} layout="none">
          {sg.kind === "clip" && <ClipLayer sg={sg} />}
          {sg.kind === "card" && <Card lines={sg.lines} size={sg.size} dur={f(sg.dur)} slam={sg.slam} />}
          {sg.kind === "timer" && <Timer dur={f(sg.dur)} />}
          {sg.kind === "end" && <EndCard dur={f(sg.dur)} />}
        </Sequence>
      ))}

      <Sequence from={f(t("ignite"))} durationInFrames={9} layout="none"><Flash /></Sequence>
      <Sequence from={f(t("boom", 4.6))} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={f(t("reveal", 2.8))} durationInFrames={f(2.4)} layout="none"><Overlay text="THE FLAVOR RACE" dur={f(2.4)} size={190} monument /></Sequence>
      <Sequence from={f(t("space", 0.5))} durationInFrames={f(2.8)} layout="none"><Overlay text="THE MARKET NEVER STOPS MOVING." dur={f(2.8)} size={34} y={300} /></Sequence>
      <Sequence from={f(t("flag", 2.2))} durationInFrames={f(4.1)} layout="none"><Overlay text="THERABREATH" dur={f(4.1)} size={150} y={250} monument /></Sequence>
      <Sequence from={f(t("flag", 2.9))} durationInFrames={f(3.4)} layout="none"><Overlay text="THE FUTURE OF FLAVOR" dur={f(3.4)} size={30} y={345} /></Sequence>
      <Sequence from={f(t("ingr1", 0.15))} durationInFrames={f(2.05)} layout="none"><Overlay text={"THE NEXT FLAVOR\nCAN COME FROM ANYWHERE."} dur={f(2.05)} size={120} monument /></Sequence>
      <Sequence from={f(t("ingr2", 0.35))} durationInFrames={f(2.35)} layout="none"><Overlay text="SO LET'S GO FIND IT." dur={f(2.35)} size={130} monument /></Sequence>
      <Sequence from={f(t("tray3"))} durationInFrames={f(3.6)} layout="none"><TasteSign dur={f(3.6)} /></Sequence>

      <Grain />

      {MUSIC.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

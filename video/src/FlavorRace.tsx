import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";

/* THE FLAVOR RACE · an 89-second mini-movie for the TheraBreath flavor team.
   Starts Nolan-serious, turns playful. Every shot is locked to one master rocket reference. */
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const RACE_FRAMES = s(89);

const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const SERIF = '"Newsreader", Georgia, serif';
const ease = Easing.bezier(0.2, 0.7, 0.1, 1);

let loaded = false;
const loadRaceFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const faces = [
    new FontFace("Geist", `url(${staticFile("fonts/Geist-Variable.woff2")})`, { weight: "100 900" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-normal.woff2")})`, { weight: "200 800" }),
    new FontFace("Newsreader", `url(${staticFile("fonts/newsreader-latin-opsz-italic.woff2")})`, { weight: "200 800", style: "italic" }),
  ];
  faces.forEach((f) => document.fonts.add(f));
};

// Picture: [clip, timeline start, timeline end, clip in-point, push-in]
type Shot = { clip: string; at: number; end: number; from: number; zoom?: [number, number]; shake?: number };
const SHOTS: Shot[] = [
  { clip: "s01_macro", at: 0, end: 6.5, from: 0, zoom: [1.0, 1.06] },
  { clip: "s02_launch", at: 6.5, end: 15, from: 0.5, zoom: [1.0, 1.04], shake: 8.6 },
  { clip: "s03_orbit", at: 15, end: 21.5, from: 2 },
  { clip: "s04_boom", at: 21.5, end: 27.1, from: 0, shake: 26.0 },
  { clip: "s05_after", at: 27.1, end: 32.6, from: 0 },
  // 32.6 to 37.8 black title cards
  { clip: "s06_land", at: 37.8, end: 45.3, from: 1 },
  { clip: "s07_flag", at: 45.3, end: 52.8, from: 0, zoom: [1.0, 1.05] },
  { clip: "s08_earth", at: 52.8, end: 58.3, from: 3.5 },
  { clip: "s09_ingr", at: 58.3, end: 65.3, from: 0 },
  { clip: "s10_return", at: 65.3, end: 71.3, from: 3 },
  { clip: "s11_hq", at: 71.3, end: 77.3, from: 3, shake: 74.8 },
  { clip: "s12_hatch", at: 77.3, end: 79.3, from: 0, zoom: [1.12, 1.14] },
  { clip: "s12b_tray", at: 79.3, end: 85.3, from: 0 },
];

const ShotLayer: React.FC<{ sh: Shot }> = ({ sh }) => {
  const f = useCurrentFrame();
  const dur = s(sh.end - sh.at);
  const [z0, z1] = sh.zoom || [1.0, 1.03];
  const z = interpolate(f, [0, dur], [z0, z1]);
  let dx = 0, dy = 0;
  if (sh.shake !== undefined) {
    const k = f - s(sh.shake - sh.at);
    const amp = k < 0 ? 0 : 14 * Math.exp(-k / 22);
    dx = Math.sin(k * 2.1) * amp; dy = Math.cos(k * 2.9) * amp;
  }
  return (
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${z})` }}>
      <OffthreadVideo src={staticFile(`race/clips/${sh.clip}.mp4`)} muted startFrom={s(sh.from)} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

// Nolan-style title: wide tracked caps that breathe in and out
const Title: React.FC<{ text: string; dur: number; size?: number; y?: number; dark?: boolean; slam?: boolean }> = ({ text, dur, size = 64, y = 0, dark, slam }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, slam ? 2 : 14, dur - 12, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const track = interpolate(f, [0, dur], [0.32, 0.4]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: dark ? "#000" : `radial-gradient(ellipse 60% 30% at 50% ${50 + y / 10.8}%, rgba(0,0,0,${0.42 * a}), rgba(0,0,0,0))` }}>
      <div style={{ transform: `translateY(${y}px) scale(${slam ? interpolate(f, [0, 6], [1.08, 1], { extrapolateRight: "clamp", easing: ease }) : 1})`, opacity: a, font: `500 ${size}px ${SANS}`, letterSpacing: `${track}em`, color: "#fff", textShadow: "0 4px 40px rgba(0,0,0,.6)", textAlign: "center", paddingLeft: `${track}em` }}>{text}</div>
    </AbsoluteFill>
  );
};

const BrandCard: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 20, dur - 10, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = interpolate(f, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110, background: `linear-gradient(0deg, rgba(0,0,0,${0.6 * a}), rgba(0,0,0,0) 45%)` }}>
      <div style={{ opacity: a, textAlign: "center" }}>
        <div style={{ font: `600 74px ${SANS}`, letterSpacing: "0.34em", paddingLeft: "0.34em", color: "#fff" }}>THERABREATH</div>
        <div style={{ opacity: b, transform: `translateY(${(1 - b) * 14}px)`, font: `italic 300 54px ${SERIF}`, color: "#fff", marginTop: 14 }}>The future of flavor.</div>
      </div>
    </AbsoluteFill>
  );
};

const INGREDIENTS = ["Yuzu", "Green tea", "Cucumber", "Ginger", "Lime", "Grapefruit", "Rose", "Pear", "Cardamom", "Chamomile", "Vanilla", "Mint"];
const Ingredients: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [dur - 12, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {INGREDIENTS.map((n, i) => {
        const t = f - i * 7;
        const a = interpolate(t, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ang = (i / INGREDIENTS.length) * Math.PI * 2 + f / 140;
        const x = 960 + Math.cos(ang) * 760, y = 540 + Math.sin(ang) * 380;
        return <div key={n} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", opacity: a * (0.55 + 0.45 * Math.sin(ang + 1.2) ** 2), font: `500 22px ${SANS}`, letterSpacing: "0.22em", color: "#fff", textTransform: "uppercase", textShadow: "0 2px 18px rgba(0,0,0,.8)" }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 8, background: "#F58025", marginRight: 12, verticalAlign: 3 }} />{n}</div>;
      })}
    </AbsoluteFill>
  );
};

// Six cups = the six flavor trend ideas in the room, left to right in cup color order.
const CUPS = ["Bright Global Citrus", "Garden Green", "Warm Meets Cool", "Grown-Up Fruit", "Night Ritual", "Sour Chill"];
const Sign: React.FC = () => {
  const f = useCurrentFrame(); // 0 at the DING
  const unfold = interpolate(f, [0, 10], [90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const flip = f >= s(1.7);
  const flipA = flip ? interpolate(f - s(1.7), [0, 8], [90, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) }) : unfold;
  const names = interpolate(f, [s(1.9), s(2.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 70, perspective: 1400 }}>
      <div style={{ transformOrigin: "50% 0", transform: `rotateX(${flipA}deg)`, background: "#fff", color: "#0B2236", padding: "26px 70px 30px", borderRadius: 6, boxShadow: "0 30px 80px rgba(0,0,0,.45)", borderTop: "10px solid #F58025", textAlign: "center" }}>
        <div style={{ font: `600 ${flip ? 78 : 96}px ${SANS}`, letterSpacing: "0.2em", paddingLeft: "0.2em" }}>{flip ? "TASTE THE FUTURE" : "YOUR TURN"}</div>
      </div>
      <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, opacity: names }}>
        {CUPS.map((c, i) => <div key={c} style={{ font: `500 19px ${SANS}`, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,.45)", padding: "10px 16px", borderRadius: 40, opacity: interpolate(f - s(1.9) - i * 3, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{c}</div>)}
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const b = interpolate(f, [30, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff" }}>
      <div style={{ opacity: a, font: `500 34px ${SANS}`, letterSpacing: "0.42em", paddingLeft: "0.42em" }}>THERABREATH FLAVOR PLAYBOOK</div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 12}px)`, font: `italic 300 92px ${SERIF}`, marginTop: 28 }}>The future starts now.</div>
    </AbsoluteFill>
  );
};

// Sound: [file, start sec, volume, trim-in sec, length sec]
type Cue = { f: string; at: number; v: number; from?: number; len?: number; fadeIn?: number; fadeOut?: number };
const SFX: Cue[] = [
  { f: "amb", at: 0, v: 0.9, len: 8.6, fadeIn: 0.6, fadeOut: 0.3 },
  { f: "radio_count", at: 2.3, v: 1.0 },
  { f: "ignite", at: 8.45, v: 0.55, fadeOut: 1.5 },
  { f: "flyby", at: 18.6, v: 0.6 },
  { f: "beeps", at: 21.6, v: 0.7 },
  { f: "sputter", at: 23.6, v: 0.6 },
  { f: "boom", at: 26.0, v: 1.0 },
  { f: "flyby", at: 29.6, v: 0.85 },
  { f: "lunar", at: 38.2, v: 1.0 },
  { f: "servo", at: 46.0, v: 0.9 },
  { f: "reentry", at: 66.4, v: 0.75 },
  { f: "radio_home", at: 65.6, v: 1.0 },
  { f: "vland", at: 71.4, v: 0.6 },
  { f: "hatch", at: 77.4, v: 1.0 },
  { f: "ding", at: 82.0, v: 1.0, len: 1.0 },
  { f: "ding", at: 85.0, v: 0.8, from: 1.0, len: 1.8, fadeOut: 0.6 },
];
// Score: one 124-second cue, cut to picture in four pieces with a comic dropout and a lunar silence.
const SCORE: Cue[] = [
  { f: "score_a", at: 0, v: 0.4, from: 0, len: 21.6, fadeIn: 2.5 },
  { f: "score_a", at: 27.25, v: 0.75, from: 62.9, len: 10.6, fadeOut: 1.0 },
  { f: "score_a", at: 45.3, v: 0.62, from: 82.0, len: 32.0, fadeIn: 1.5, fadeOut: 2.0 },
  { f: "score_a", at: 79.3, v: 0.32, from: 112.0, len: 5.5, fadeIn: 0.4 },
];
const DUCKS: [number, number, number][] = [[2.3, 8.4, 0.55], [65.4, 69.6, 0.5]]; // under radio VO

const CueAudio: React.FC<{ c: Cue; duck?: boolean }> = ({ c, duck }) => {
  const len = c.len ?? 30;
  return (
    <Sequence from={s(c.at)} durationInFrames={s(len)} layout="none">
      <Audio
        src={staticFile(`race/audio/${c.f}.mp3`)}
        startFrom={s(c.from || 0)}
        volume={(fr) => {
          const t = fr / FPS;
          let v = c.v;
          if (c.fadeIn) v *= Math.min(1, t / c.fadeIn);
          if (c.fadeOut && c.len) v *= Math.min(1, Math.max(0, (c.len - t) / c.fadeOut));
          if (duck) for (const [a, b, k] of DUCKS) { const g = c.at + t; if (g > a && g < b) v *= k; }
          return v;
        }}
      />
    </Sequence>
  );
};

export const FlavorRace: React.FC = () => {
  loadRaceFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((sh) => (
        <Sequence key={sh.clip} from={s(sh.at)} durationInFrames={s(sh.end - sh.at)} layout="none">
          <ShotLayer sh={sh} />
        </Sequence>
      ))}
      {/* a blink of white on ignition and on the fireball */}
      <Sequence from={s(8.6)} durationInFrames={8} layout="none"><Flash /></Sequence>
      <Sequence from={s(26.1)} durationInFrames={10} layout="none"><Flash warm /></Sequence>

      <Sequence from={s(11.4)} durationInFrames={s(3.5)} layout="none"><Title text="THE RACE FOR WHAT'S NEXT" dur={s(3.5)} y={-300} /></Sequence>
      <Sequence from={s(15.4)} durationInFrames={s(2.6)} layout="none"><Title text="NECK AND NECK" dur={s(2.6)} size={56} /></Sequence>
      <Sequence from={s(32.6)} durationInFrames={s(2.6)} layout="none"><Title text="DON'T FOLLOW THE MARKET." dur={s(2.6)} dark /></Sequence>
      <Sequence from={s(35.2)} durationInFrames={s(2.6)} layout="none"><Title text="GET THERE FIRST." dur={s(2.6)} size={88} dark slam /></Sequence>
      <Sequence from={s(48.6)} durationInFrames={s(4.2)} layout="none"><BrandCard dur={s(4.2)} /></Sequence>
      <Sequence from={s(58.6)} durationInFrames={s(6.7)} layout="none"><Ingredients dur={s(6.7)} /></Sequence>
      <Sequence from={s(60.2)} durationInFrames={s(5.0)} layout="none"><Title text="THE WORLD IS READY FOR WHAT'S NEXT." dur={s(5.0)} size={50} /></Sequence>
      <Sequence from={s(82.0)} durationInFrames={s(3.3)} layout="none"><Sign /></Sequence>
      <Sequence from={s(85.3)} durationInFrames={s(3.7)} layout="none"><EndCard /></Sequence>

      {SCORE.map((c, i) => <CueAudio key={`m${i}`} c={c} duck />)}
      {SFX.map((c, i) => <CueAudio key={`x${i}`} c={c} />)}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ warm?: boolean }> = ({ warm }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: warm ? "#FFB060" : "#fff", opacity: interpolate(f, [0, 2, 8], [0, 0.7, 0], { extrapolateRight: "clamp" }), mixBlendMode: "screen" }} />;
};

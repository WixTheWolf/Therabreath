import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BODY, DISPLAY, MONO, loadFonts } from "./theme";

/* The Future of Freshness · 30-second opening.
   Their world (oral care: clinical, cold, proven) → our world (flavor) → six new kinds of freshness → title. */
const FPS = 30;
export const OPENING_FRAMES = 30 * FPS;
const X = 12; // cross-dissolve length

type Shot = { clip: string; from: number; dur: number; start?: number; kicker?: string; line?: string; big?: string; tint?: string };
const SHOTS: Shot[] = [
  { clip: "drop", from: 0, dur: 108, start: 0, kicker: "Your world", line: "Freshness is a science." },
  { clip: "rinse", from: 96, dur: 96, start: 20, line: "Clean. Cold. Proven." },
  { clip: "mint", from: 180, dur: 102, start: 10, line: "For decades, it has meant one thing." },
  { clip: "bench", from: 270, dur: 102, start: 0, kicker: "Our world", line: "Freshness is flavor." },
  { clip: "yuzu", from: 360, dur: 84, start: 18, big: "Brightness", kicker: "Arctic Yuzu" },
  { clip: "cucumber", from: 432, dur: 84, start: 12, big: "Calm", kicker: "Green Tea Cucumber" },
  { clip: "gingerlime", from: 504, dur: 84, start: 18, big: "Contrast", kicker: "Ginger Lime" },
  { clip: "grapefruit", from: 576, dur: 84, start: 12, big: "Beauty", kicker: "Grapefruit Rose Mint" },
  { clip: "night", from: 648, dur: 120, start: 6, big: "Rest", kicker: "Chamomile Vanilla Mint" },
];

const ease = Easing.bezier(0.2, 0.7, 0.1, 1);

const ShotLayer: React.FC<{ s: Shot; clean?: boolean }> = ({ s, clean }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, X, s.dur - X, s.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(f, [0, s.dur], [1.02, 1.09]);
  const tIn = interpolate(f, [10, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const tOut = interpolate(f, [s.dur - 20, s.dur - 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = Math.min(tIn, tOut);
  return (
    <AbsoluteFill style={{ opacity: s.from === 0 ? Math.min(1, f / 8) * (f > s.dur - X ? op : 1) : op }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo src={staticFile(`opening/${s.clip}.mp4`)} muted startFrom={s.start || 0} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(6,19,31,.55), rgba(6,19,31,0) 55%), linear-gradient(0deg, rgba(6,19,31,.45), rgba(6,19,31,0) 40%)" }} />
      {!clean && <div style={{ position: "absolute", left: 140, bottom: s.big ? 150 : 170, color: "#fff", opacity: t, transform: `translateY(${(1 - tIn) * 26}px)`, filter: `blur(${(1 - tIn) * 6}px)` }}>
        {s.kicker && <div style={{ font: `600 22px ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.8, marginBottom: 18 }}>{s.kicker}</div>}
        {s.line && <div style={{ font: `300 84px/1.05 ${DISPLAY}`, letterSpacing: "-0.02em", maxWidth: 1300, textShadow: "0 6px 40px rgba(0,0,0,.35)" }}>{s.line}</div>}
        {s.big && <div style={{ font: `200 190px/1 ${DISPLAY}`, letterSpacing: "-0.04em", textShadow: "0 6px 50px rgba(0,0,0,.3)" }}>{s.big}.</div>}
      </div>}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame(); // 0 at frame 750
  const bg = interpolate(f, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: ease });
  const a = interpolate(f, [10, 30, 58, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = interpolate(f, [66, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const c = interpolate(f, [92, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(255,255,255,${bg}) 0%, rgba(238,245,247,${bg}) 55%, rgba(220,233,238,${bg}) 100%)`, alignItems: "center", justifyContent: "center", textAlign: "center", color: "#0B2236" }}>
      <div style={{ position: "absolute", font: `300 96px ${DISPLAY}`, letterSpacing: "-0.02em", color: "#0B6B4F", opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>Freshness is evolving.</div>
      <div style={{ opacity: b, transform: `translateY(${(1 - b) * 24}px)` }}>
        <div style={{ font: `600 22px ${MONO}`, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(11,34,54,.5)" }}>TheraBreath × The Flavor Factory</div>
        <div style={{ font: `200 168px/1 ${DISPLAY}`, letterSpacing: "-0.035em", marginTop: 26 }}>The Future of Freshness</div>
      </div>
      <div style={{ position: "absolute", bottom: 130, display: "flex", alignItems: "center", gap: 26, opacity: c, font: `500 24px ${BODY}`, color: "rgba(11,34,54,.5)" }}>
        <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 50, mixBlendMode: "multiply" }} />
        <span>×</span>
        <Img src={staticFile("img/tff-logo.png")} style={{ height: 56 }} />
        <span style={{ marginLeft: 22, paddingLeft: 26, borderLeft: "1px solid rgba(11,34,54,.2)", font: `600 20px ${MONO}`, letterSpacing: "0.14em" }}>NOVEMBER 9, 2026</span>
      </div>
    </AbsoluteFill>
  );
};

export const LOOP_FRAMES = 768;
export const Opening: React.FC<{ clean?: boolean }> = ({ clean }) => {
  loadFonts();
  const f = useCurrentFrame();
  const vol = interpolate(f, [0, 12, OPENING_FRAMES - 30, OPENING_FRAMES], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#06131F" }}>
      {SHOTS.map((s) => (
        <Sequence key={s.clip} from={s.from} durationInFrames={s.dur} layout="none">
          <ShotLayer s={s} clean={clean} />
        </Sequence>
      ))}
      {!clean && <Sequence from={750} durationInFrames={150}>
        <EndCard />
      </Sequence>}
      {!clean && <Audio src={staticFile("opening/score.mp3")} volume={vol} />}
    </AbsoluteFill>
  );
};

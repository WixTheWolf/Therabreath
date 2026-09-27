import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { BEAT, C, DISPLAY } from "../theme";

// 45-135 (local 0-90): "Fresh can feel ..." one word per beat, each with its own colour field.
export const WORDS = [
  { w: "cool.", bg: C.blue, fg: "#fff" },
  { w: "bright.", bg: "#E2EE4A", fg: C.ink },
  { w: "calm.", bg: "#3E9A6A", fg: "#fff" },
  { w: "warm.", bg: C.orange, fg: "#fff" },
  { w: "layered.", bg: "#E86F7A", fg: "#fff" },
  { w: "new.", bg: C.green, fg: C.mint },
];
const out = Easing.bezier(0.16, 1, 0.3, 1);

export const Fresh: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(WORDS.length - 1, Math.floor(f / BEAT));
  const local = f - i * BEAT;
  return (
    <AbsoluteFill name="Fresh" style={{ background: C.green, overflow: "hidden" }}>
      {/* colour fields wipe in diagonally, stacking */}
      {WORDS.map((w, k) => {
        const p = interpolate(f - k * BEAT, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
        const e = -20 + p * 260;
        return (
          <div key={k} style={{ position: "absolute", inset: 0, background: w.bg,
            clipPath: `polygon(0% 100%, ${e}% 100%, ${e - 60}% 0%, 0% 0%)`, display: p > 0 ? "block" : "none" }} />
        );
      })}
      {/* moving stripe texture */}
      <div style={{ position: "absolute", inset: -200, opacity: 0.08, rotate: "-18deg",
        backgroundImage: "repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 60px)",
        translate: `${-f * 6}px 0px` }} />
      <Interactive.Div
        name="Kicker"
        style={{
          position: "absolute", left: 140, top: 250, fontFamily: DISPLAY, fontWeight: 800, fontStretch: "112%",
          fontSize: 120, letterSpacing: "-0.035em", lineHeight: 1, color: WORDS[i].fg,
          translate: interpolate(f, [0, 8], ["-80px 0px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }),
          opacity: interpolate(f, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Fresh can feel
      </Interactive.Div>
      {/* the word, masked, rising in on the beat */}
      <div style={{ position: "absolute", left: 130, top: 390, height: 360, overflow: "hidden", paddingRight: 80 }}>
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: 900, fontStretch: "118%", fontSize: 330, letterSpacing: "-0.05em", lineHeight: 1.05,
            color: WORDS[i].fg, whiteSpace: "nowrap",
            translate: `0px ${interpolate(local, [0, 6], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}%`,
            transform: `skewX(${interpolate(local, [0, 6], [-12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}deg)`,
          }}
        >
          {WORDS[i].w}
        </div>
      </div>
      {/* beat counter */}
      <div style={{ position: "absolute", left: 140, bottom: 110, display: "flex", gap: 14 }}>
        {WORDS.map((_, k) => (
          <div key={k} style={{ height: 10, borderRadius: 99, background: WORDS[i].fg, opacity: k <= i ? 1 : 0.3,
            width: k === i ? interpolate(local, [0, 8], [10, 70], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }) : 10 }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

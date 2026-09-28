import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, DISPLAY } from "../theme";

// 0-45: a single drop falls, hits, and the colour floods the frame.
const IMPACT = 26;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const drops = Array.from({ length: 14 }, (_, i) => {
  const a = -Math.PI * (0.08 + (0.84 * i) / 13) + (i % 2 ? 0.05 : -0.05);
  return { a, v: 16 + ((i * 37) % 11), r: 7 + ((i * 13) % 9) };
});

export const Drop: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - IMPACT;
  return (
    <AbsoluteFill name="Drop" style={{ background: `radial-gradient(circle at 50% 55%, #10345F 0%, ${C.ink} 70%)`, overflow: "hidden" }}>
      {/* flood: a circle of liquid colour growing from the impact point */}
      <Interactive.Div
        name="Flood"
        style={{
          position: "absolute", left: 960, top: 600, width: 10, height: 10, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blue} 0%, #0A86C8 45%, ${C.green} 100%)`,
          translate: "-50% -50%",
          scale: interpolate(f, [IMPACT + 1, 40], [0, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.5, 0, 0.75, 0) }),
        }}
      />
      {/* ripples */}
      {[0, 5, 10].map((d) => (
        <div
          key={d}
          style={{
            position: "absolute", left: 960, top: 600, width: 200, height: 70, borderRadius: "50%",
            border: `4px solid ${C.mint}`, translate: "-50% -50%",
            scale: interpolate(t - d, [0, 20], [0.1, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }),
            opacity: interpolate(t - d, [0, 2, 20], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        />
      ))}
      {/* the drop */}
      <Interactive.Div
        name="Falling drop"
        style={{
          position: "absolute", left: 960, width: 90, height: 124,
          translate: "-50% -100%",
          top: interpolate(f, [0, IMPACT], [-40, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.55, 0, 1, 0.45) }),
          scale: interpolate(f, [0, IMPACT - 6, IMPACT], [0.8, 1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          opacity: f < IMPACT ? 1 : 0,
        }}
      >
        <svg viewBox="0 0 90 124" width="90" height="124">
          <defs>
            <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.mint} /><stop offset="1" stopColor={C.blue} /></linearGradient>
          </defs>
          <path d="M45 0 C45 0 88 58 88 80 A43 43 0 0 1 2 80 C2 58 45 0 45 0 Z" fill="url(#dg)" />
          <ellipse cx="30" cy="78" rx="9" ry="16" fill="#fff" opacity=".55" />
        </svg>
      </Interactive.Div>
      {/* splash droplets */}
      {drops.map((d, i) => {
        const tt = Math.max(0, t) / 30;
        const x = 960 + Math.cos(d.a) * d.v * tt * 30;
        const y = 600 + Math.sin(d.a) * d.v * tt * 30 + 0.5 * 2400 * tt * tt;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: d.r * 2, height: d.r * 2, borderRadius: "50%", background: C.mint, translate: "-50% -50%",
            opacity: interpolate(t, [0, 1, 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
        );
      })}
      {/* lockup */}
      <Interactive.Div
        name="Lockup"
        style={{
          position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", color: "#fff",
          fontFamily: DISPLAY, fontWeight: 800, fontStretch: "90%", fontSize: 64, letterSpacing: "-0.02em",
          opacity: interpolate(f, [34, 39], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(f, [34, 45], ["0px 40px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }),
        }}
      >
        The Flavor Factory <span style={{ color: C.mint, fontWeight: 400 }}>×</span> TheraBreath
      </Interactive.Div>
    </AbsoluteFill>
  );
};

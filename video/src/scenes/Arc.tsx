import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, DISPLAY, BODY } from "../theme";

// 315-390 (local 0-75): the four objectives from the invite stamp in on the beat, then liquid rises into the end card.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const ROWS = [
  { w: "Trends.", at: 0, col: C.ink, note: "flavor · sensory · consumer" },
  { w: "Territories.", at: 15, col: C.blue, note: "new sensory worlds" },
  { w: "Concepts.", at: 30, col: C.green, note: "new occasions & consumers" },
  { w: "Pipeline.", at: 45, col: C.orange, note: "near-term to long-term" },
];

export const Arc: React.FC = () => {
  const f = useCurrentFrame();
  const shake = ROWS.reduce((s, r) => (f >= r.at ? s + 16 * Math.exp(-(f - r.at) / 3) : s), 0);
  const rise = interpolate(f, [67, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.6, 0, 0.9, 0.4) });
  return (
    <AbsoluteFill name="Arc" style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, translate: `${Math.sin(f * 2.1) * shake}px ${Math.cos(f * 2.7) * shake}px` }}>
        {ROWS.map((r, i) => {
          const l = f - r.at;
          return (
            <div key={r.w} style={{ position: "absolute", left: 140, right: 140, top: 70 + i * 238, height: 220, display: "flex", alignItems: "center", gap: 48,
              opacity: l >= 0 ? 1 : 0 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "90%", fontSize: 176, letterSpacing: "-0.03em", lineHeight: 1, color: r.col,
                scale: `${interpolate(l, [0, 6], [1.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}`,
                rotate: `${interpolate(l, [0, 6], [-6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}deg`, transformOrigin: "0 60%" }}>
                {r.w}
              </div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 42, marginLeft: "auto", whiteSpace: "nowrap", color: C.ink, display: "flex", alignItems: "center", gap: 22,
                opacity: interpolate(l, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: `${interpolate(l, [4, 12], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}px 0px` }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: r.col }}>0{i + 1}</span>
                {r.note}
              </div>
            </div>
          );
        })}
      </div>
      {/* liquid rising into the end card */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${rise * 118}%`, opacity: f >= 66 ? 1 : 0,
        background: `linear-gradient(180deg, #1A9BE0 0%, #0072BC 55%, ${C.green} 100%)` }}>
        <svg viewBox="0 0 3840 80" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: -78, width: 3840, height: 80, translate: `${-f * 40}px 0` }}>
          <path d={`M0,40 ${Array.from({ length: 16 }, (_, k) => `q120,-${k % 2 ? 30 : 40} 240,0`).join(" ")} V80 H0 Z`} fill="#1A9BE0" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, DISPLAY, BODY } from "../theme";

// 390-450 (local 0-60): the hit. "See you November 9." with bubbles rising through the liquid.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const BUBBLES = Array.from({ length: 34 }, (_, i) => ({ x: (i * 53) % 1920, s: 8 + ((i * 29) % 30), sp: 6 + ((i * 17) % 9), d: (i * 41) % 900 }));
const LINE = "November 9.".split("");

export const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill name="End" style={{ background: `linear-gradient(180deg, #1A9BE0 0%, #0072BC 50%, ${C.green} 100%)`, overflow: "hidden" }}>
      {BUBBLES.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x, top: 1100 + b.d - f * b.sp, width: b.s, height: b.s, borderRadius: "50%",
          background: "rgba(255,255,255,.28)", border: "2px solid rgba(255,255,255,.45)" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        scale: `${interpolate(f, [0, 60], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "110%", fontSize: 110, letterSpacing: "-0.035em", color: "#fff", lineHeight: 1,
          opacity: interpolate(f, [2, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: `0px ${interpolate(f, [2, 12], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}px` }}>
          See you on
        </div>
        <div style={{ display: "flex", marginTop: 6 }}>
          {LINE.map((ch, i) => (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 16 }}>
              <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 900, fontStretch: "118%", fontSize: 250, letterSpacing: "-0.05em", lineHeight: 1,
                color: C.mint, whiteSpace: "pre",
                translate: `0px ${interpolate(f - 4 - i * 1.5, [0, 10], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}%` }}>
                {ch}
              </span>
            </span>
          ))}
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 52, color: "#fff", marginTop: 24,
          opacity: interpolate(f, [18, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          Church &amp; Dwight HQ · Ewing, NJ
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center", alignItems: "center", gap: 26,
        opacity: interpolate(f, [24, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        translate: `0px ${interpolate(f, [24, 34], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}px` }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "12px 22px", display: "flex" }}>
          <Img src={staticFile("img/therabreath-logo.png")} style={{ height: 58 }} />
        </div>
        <span style={{ fontFamily: DISPLAY, fontSize: 46, color: "rgba(255,255,255,.7)" }}>×</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 50, color: "#fff", letterSpacing: "-0.01em" }}>The Flavor Factory</span>
      </div>
      {/* impact flash */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 8], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

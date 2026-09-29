import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { Grade, Shot } from "./Shot";
import { C, DISPLAY, MONO, BODY } from "../theme";

// 90-210: what TheraBreath asked for, in Ross's words, then the four objectives on the beat.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WORDS = "A flavor playbook for near-term innovation and long-term franchise growth.".split(" ");
const HOT = new Set(["flavor", "playbook"]);
const COLS = [C.orange, C.blue, C.mint, "#F7C3D0"];

export const Ask: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill name="Ask" style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 0.55 }}><Shot id="frost" push={0.1} dim={0.55} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(7,28,60,.92) 0%, rgba(7,28,60,.55) 70%, rgba(7,28,60,.3) 100%)" }} />
      <div style={{ position: "absolute", left: 150, top: 150, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: C.mint,
        opacity: interpolate(f, [0, 8], [0, 1], cl) }}>
        THE ASK · {TB.PLAYBOOK.from.toUpperCase()}
      </div>
      <div style={{ position: "absolute", left: 150, top: 230, width: 1500, display: "flex", flexWrap: "wrap", columnGap: 26, rowGap: 4 }}>
        {WORDS.map((w, i) => {
          const at = 4 + i * 3.2;
          const hot = HOT.has(w.toLowerCase());
          return (
            <span key={i} style={{ overflow: "hidden", paddingBottom: 8 }}>
              <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 800, fontStretch: "90%", fontSize: 96, letterSpacing: "-0.03em", lineHeight: 1.02,
                color: hot ? C.ink : "#fff", background: hot ? C.mint : "transparent", padding: hot ? "0 14px" : 0, borderRadius: 14,
                translate: `0px ${interpolate(f - at, [0, 8], [110, 0], { ...cl, easing: out })}%` }}>
                {w}
              </span>
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, bottom: 150, display: "flex", gap: 28 }}>
        {TB.OBJECTIVES.map((o, i) => {
          const at = 60 + i * 15;
          const p = interpolate(f - at, [0, 8], [0, 1], { ...cl, easing: Easing.bezier(0.34, 1.5, 0.64, 1) });
          return (
            <div key={o.k} style={{ flex: 1, borderRadius: 26, padding: "26px 30px", background: "rgba(255,255,255,.1)", border: `3px solid ${COLS[i]}`,
              backdropFilter: "blur(8px)", opacity: Math.min(1, p * 2), scale: `${0.7 + 0.3 * p}`, translate: `0px ${(1 - p) * 60}px` }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: COLS[i], letterSpacing: "0.12em" }}>{o.n}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{o.h}</div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,.8)", marginTop: 6 }}>{o.out}</div>
            </div>
          );
        })}
      </div>
      <Grade bars={120} />
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Grade, Shot } from "./Shot";
import { C, DISPLAY, MONO } from "../theme";

// 0-90: cold open. One drop in extreme macro, letterbox closes in, the question lands.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LINES = [{ w: "What does fresh", at: 34 }, { w: "taste like next?", at: 46, mint: true }];

export const Open: React.FC = () => {
  const f = useCurrentFrame();
  const bars = interpolate(f, [0, 24], [0, 120], { ...cl, easing: out });
  return (
    <AbsoluteFill name="Open" style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: interpolate(f, [0, 12], [0, 1], cl) }}>
        <Shot id="drop" push={0.14} dim={interpolate(f, [26, 40], [0, 0.35], cl)} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 150, top: 180, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: "#fff",
        opacity: interpolate(f, [16, 26], [0, 0.9], cl) }}>
        THE FLAVOR FACTORY · FOR THERABREATH
      </div>
      <div style={{ position: "absolute", left: 150, bottom: 220 }}>
        {LINES.map((l) => (
          <div key={l.w} style={{ overflow: "hidden", paddingBottom: 12 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 150, letterSpacing: "-0.035em", lineHeight: 0.95,
              color: l.mint ? C.mint : "#fff", translate: `0px ${interpolate(f - l.at, [0, 10], [110, 0], { ...cl, easing: out })}%` }}>
              {l.w}
            </div>
          </div>
        ))}
      </div>
      <Grade bars={bars} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [84, 90], [0, 0.9], cl) }} />
    </AbsoluteFill>
  );
};

import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { Grade, Shot } from "./Shot";
import { DISPLAY, MONO, BODY } from "../theme";

// 570-750: nine wildcards from around the world, stamped like a passport, one every 20 frames.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const WILD_LEN = 20;
const HZ: Record<string, string> = { near: "NOW", next: "NEXT", long: "LATER" };

const Stamp: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const w = TB.WILD[i];
  const slam = interpolate(f, [0, 5], [1.7, 1], { ...cl, easing: out });
  const rot = (i % 2 ? 1 : -1) * (4 + (i % 3) * 2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: `${interpolate(f, [0, 5], [1.12, 1], { ...cl, easing: out })}` }}>
        <Shot id={w.id} push={0.05} start={40} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 52%, rgba(4,14,32,.25) 0%, rgba(4,14,32,.7) 100%)" }} />
      <div style={{ position: "absolute", left: 960, top: 560, translate: "-50% -50%", rotate: `${rot}deg`, scale: `${slam}`, opacity: interpolate(f, [0, 2], [0, 1], cl),
        border: `8px solid #fff`, outline: `3px solid #fff`, outlineOffset: 10, borderRadius: 36, padding: "34px 64px 38px", textAlign: "center",
        background: `linear-gradient(135deg, ${w.acc}E6, ${w.acc}B3)`, color: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,.45)", minWidth: 900 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: "0.22em" }}>WILDCARD {String(i + 1).padStart(2, "0")}/09 · {HZ[w.horizon]}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 150, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 10, textTransform: "uppercase" }}>{w.name}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", marginTop: 12 }}>✈ {w.origin.toUpperCase()}</div>
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, bottom: 160, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 38, color: "#fff",
        opacity: interpolate(f, [5, 9], [0, 1], cl) }}>
        {w.trend}
      </div>
    </AbsoluteFill>
  );
};

export const Wildcards: React.FC = () => (
  <AbsoluteFill name="Wildcards" style={{ background: "#000", overflow: "hidden" }}>
    {TB.WILD.map((_, i) => (
      <Sequence key={i} from={i * WILD_LEN} durationInFrames={WILD_LEN}><Stamp i={i} /></Sequence>
    ))}
    <div style={{ position: "absolute", left: 150, top: 150, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: "#fff" }}>
      NINE WILDCARDS · FROM AROUND THE WORLD
    </div>
    <Grade bars={120} />
  </AbsoluteFill>
);

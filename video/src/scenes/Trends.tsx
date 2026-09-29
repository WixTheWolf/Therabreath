import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { Grade, Shot } from "./Shot";
import { BEAT, DISPLAY, MONO, BODY } from "../theme";

// 210-390: twelve trends, one per beat, each over its own shot, with its lens and stage.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SHOT: Record<string, string> = {
  pantry: "cardamom", swicy: "mangochili", floral: "hibiscus", indulgent: "pistachio",
  proof: "frost", gentle: "coastal", layered: "rosewater", texture: "coconut",
  selfcare: "lychee", dayparts: "orchard", social: "matcha", sober: "birch",
};

const Card: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const t = TB.TREND_DEEP[i];
  const lens = TB.LENSES[t.lens];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: `${interpolate(f, [0, 6], [1.18, 1], { ...cl, easing: out })}` }}>
        <Shot id={SHOT[t.id]} push={0.05} start={30 + i * 7} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(4,14,32,.88) 0%, rgba(4,14,32,.3) 50%, rgba(4,14,32,.2) 78%, rgba(4,14,32,.6) 100%)" }} />
      <div style={{ position: "absolute", left: 150, bottom: 260, display: "flex", gap: 16, alignItems: "center",
        opacity: interpolate(f, [0, 3], [0, 1], cl) }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", color: "#fff", background: lens.c, borderRadius: 99, padding: "10px 20px" }}>
          {lens.h.toUpperCase()}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", color: "#fff", border: "2px solid rgba(255,255,255,.6)", borderRadius: 99, padding: "8px 18px" }}>
          {TB.STAGES[t.stage].toUpperCase()}
        </span>
      </div>
      <div style={{ position: "absolute", left: 150, right: 150, bottom: 150, overflow: "hidden", paddingBottom: 8 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 112, letterSpacing: "-0.035em", lineHeight: 1, color: "#fff",
          translate: `${interpolate(f, [0, 5], [-40, 0], { ...cl, easing: out })}px ${interpolate(f, [0, 5], [100, 0], { ...cl, easing: out })}%` }}>
          {t.h}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Trends: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.min(11, Math.floor(f / BEAT));
  return (
    <AbsoluteFill name="Trends" style={{ background: "#000", overflow: "hidden" }}>
      {TB.TREND_DEEP.map((_, i) => (
        <Sequence key={i} from={i * BEAT} durationInFrames={BEAT}><Card i={i} /></Sequence>
      ))}
      <div style={{ position: "absolute", left: 150, top: 150, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: "#fff" }}>
        TWELVE TRENDS · <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30 }}>{String(k + 1).padStart(2, "0")}</span>/12
      </div>
      <div style={{ position: "absolute", right: 150, top: 146, display: "flex", gap: 8 }}>
        {TB.TREND_DEEP.map((t, i) => (
          <div key={t.id} style={{ width: 34, height: 10, borderRadius: 99, background: i <= k ? TB.LENSES[t.lens].c : "rgba(255,255,255,.3)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: 150, bottom: 160, fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,.85)", textAlign: "right" }}>
        Flavor · Sensory · Consumer
      </div>
      <Grade bars={120} />
    </AbsoluteFill>
  );
};

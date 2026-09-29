import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { TB, bottleSvg } from "../core";
import { Grade, Shot } from "./Shot";
import { C, DISPLAY, MONO, BODY } from "../theme";

// 390-570: six flavor worlds, two beats each. Every world pours in from the
// bottom over the last, and the bottle refills in its colors.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const WORLD_LEN = 30;

const Pour: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const c = TB.CONCEPTS[i];
  const rise = i === 0 ? 1 : interpolate(f, [0, 8], [0, 1], { ...cl, easing: out });
  return (
    <AbsoluteFill style={{ clipPath: `inset(${(1 - rise) * 100}% 0 0 0)` }}>
      <Shot id={c.id} push={0.06} start={20} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,14,32,.75) 0%, rgba(4,14,32,.25) 55%, rgba(4,14,32,0) 100%)" }} />
      {i > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - rise) * 100}%`, height: 6, background: "rgba(255,255,255,.9)", opacity: rise < 1 ? 1 : 0 }} />}
    </AbsoluteFill>
  );
};

const Name: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const c = TB.CONCEPTS[i];
  const [w1, ...rest] = c.name.split(" ");
  const up = (d: number) => `0px ${interpolate(f - d, [0, 7], [110, 0], { ...cl, easing: out })}%`;
  return (
    <div style={{ position: "absolute", left: 150, top: 250, color: "#fff" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.16em", display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 99, background: C.orange, fontSize: 22 }}>0{i + 1}</span>
        FLAVOR WORLD · No. {c.code}
      </div>
      <div style={{ overflow: "hidden", marginTop: 22, paddingBottom: 8 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 210, letterSpacing: "-0.03em", lineHeight: 0.86, textTransform: "uppercase", translate: up(2) }}>{w1}</div>
      </div>
      <div style={{ overflow: "hidden", paddingBottom: 8 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: 210, letterSpacing: "0.01em", lineHeight: 0.86, textTransform: "uppercase",
          color: "transparent", WebkitTextStroke: "4px #fff", translate: up(4) }}>{rest.join(" ")}</div>
      </div>
      <div style={{ height: 12, width: 260, borderRadius: 99, background: c.hi, marginTop: 28, scale: `${interpolate(f, [2, 10], [0, 1], { ...cl, easing: out })} 1`, transformOrigin: "0 50%" }} />
      <div style={{ marginTop: 22, fontFamily: BODY, fontWeight: 700, fontSize: 44, opacity: interpolate(f, [6, 11], [0, 1], cl) }}>{c.tag}</div>
    </div>
  );
};

export const Worlds: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.min(5, Math.floor(f / WORLD_LEN));
  const local = f - k * WORLD_LEN;
  const c = TB.CONCEPTS[k];
  const svg = useMemo(() => bottleSvg(TB.conceptBottleOpts(c)), [c]);
  const wob = Math.sin(local * 0.9) * 7 * Math.exp(-local / 6);
  return (
    <AbsoluteFill name="Worlds" style={{ background: "#000", overflow: "hidden" }}>
      {TB.CONCEPTS.map((_, i) => (
        <Sequence key={i} from={i * WORLD_LEN} durationInFrames={i === 5 ? WORLD_LEN : WORLD_LEN + 8}><Pour i={i} /></Sequence>
      ))}
      {TB.CONCEPTS.map((_, i) => (
        <Sequence key={`n${i}`} from={i * WORLD_LEN} durationInFrames={WORLD_LEN}><Name i={i} /></Sequence>
      ))}
      <div style={{ position: "absolute", left: 1450, top: 560, width: 300, height: 750, translate: "-50% -50%",
        rotate: `${interpolate(f, [0, 12], [-30, 0], { ...cl, easing: Easing.bezier(0.34, 1.56, 0.64, 1) }) + wob}deg`,
        marginTop: interpolate(f, [0, 12], [800, 0], { ...cl, easing: out }),
        scale: `${interpolate(local, [0, 3, 10], [1, 1.06, 1], cl)}`, filter: "drop-shadow(0 40px 50px rgba(0,0,0,.45))" }}>
        <div style={{ width: 300, height: 750 }} dangerouslySetInnerHTML={{ __html: svg.replace('class="bottle"', 'width="300" height="750"') }} />
      </div>
      <div style={{ position: "absolute", left: 150, top: 150, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: "0.2em", color: "#fff" }}>
        SIX NEW WORLDS · BUILT FOR SODIUM CHLORITE
      </div>
      <Grade bars={120} />
    </AbsoluteFill>
  );
};

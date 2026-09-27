import { useMemo } from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TB, bottleSvg } from "../core";
import { BEAT, C, DISPLAY } from "../theme";

// 135-240 (local 0-105): the bottle lands, then refills through all six flavors on the beat.
const ICONIC = { liq: ["#4FB3E6", "#1A78C0"] as [string, string], band: "#6CC3EA", flavor: "Invigorating Icy Mint" };
const out = Easing.bezier(0.16, 1, 0.3, 1);
const FIRST = 15;

export const Bottle: React.FC = () => {
  const f = useCurrentFrame();
  const k = f < FIRST ? -1 : Math.min(5, Math.floor((f - FIRST) / BEAT));
  const c = k >= 0 ? TB.CONCEPTS[k] : null;
  const local = k >= 0 ? f - FIRST - k * BEAT : f;
  const svg = useMemo(
    () => (c ? bottleSvg({ liq: c.liquid, band: c.acc, flavor: "Revealed Nov 9", sub: c.flavor }) : bottleSvg(ICONIC)),
    [c],
  );
  const logo = useMemo(() => TB.logoSymbol(staticFile("img/therabreath-logo.png")), []);
  const bg = c ? c.bg : "#E6F6FD";
  const acc = c ? c.acc : C.blue;
  // wobble on every refill
  const wob = k >= 0 ? Math.sin(local * 0.9) * 7 * Math.exp(-local / 5) : 0;
  return (
    <AbsoluteFill name="Bottle" style={{ background: bg, overflow: "hidden" }}>
      <div dangerouslySetInnerHTML={{ __html: logo }} />
      {/* glow */}
      <div style={{ position: "absolute", left: 1330, top: 560, width: 1100, height: 1100, borderRadius: "50%", translate: "-50% -50%",
        background: `radial-gradient(circle, #fff 0%, ${acc}55 38%, transparent 68%)`,
        scale: interpolate(local, [0, 8], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }) }} />
      {/* rotating ring text */}
      <svg viewBox="0 0 1000 1000" style={{ position: "absolute", left: 1330, top: 560, width: 980, height: 980, translate: "-50% -50%", rotate: `${f * 0.9}deg`, opacity: 0.55 }}>
        <defs><path id="ring" d="M500,500 m-420,0 a420,420 0 1,1 840,0 a420,420 0 1,1 -840,0" /></defs>
        <text fontFamily={DISPLAY} fontWeight={800} fontSize={38} letterSpacing={14} fill={C.ink}>
          <textPath href="#ring">SIX FLAVORS · ONE ORANGE CAP · SIX FLAVORS · ONE ORANGE CAP · SIX FLAVORS · </textPath>
        </text>
      </svg>
      {/* bubbles burst on each change */}
      {k >= 0 && Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + k;
        const d = interpolate(local, [0, 12], [60, 330 + (i % 3) * 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
        return <div key={i} style={{ position: "absolute", left: 1330 + Math.cos(a) * d, top: 600 + Math.sin(a) * d * 0.9, width: 18 + (i % 4) * 8, height: 18 + (i % 4) * 8,
          borderRadius: "50%", border: `3px solid ${acc}`, background: "rgba(255,255,255,.5)", translate: "-50% -50%",
          opacity: interpolate(local, [0, 2, 13], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
      })}
      {/* the bottle */}
      <Interactive.Div
        name="Bottle"
        style={{
          position: "absolute", left: 1330, top: 575, width: 340, height: 850, translate: "-50% -50%",
          rotate: `${interpolate(f, [0, FIRST], [-38, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) }) + wob}deg`,
          marginTop: interpolate(f, [0, FIRST], [900, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }),
          scale: k >= 0 ? interpolate(local, [0, 3, 10], [1, 1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
          filter: "drop-shadow(0 50px 50px rgba(0,40,80,.28))",
        }}
      >
        <div style={{ width: 340, height: 850 }} dangerouslySetInnerHTML={{ __html: svg.replace('class="bottle"', 'width="340" height="850"') }} />
      </Interactive.Div>
      {/* flavor name */}
      <div style={{ position: "absolute", left: 140, top: 250, width: 900 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: "0.14em", textTransform: "uppercase", color: C.green,
          opacity: interpolate(f, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {k >= 0 ? `Flavor 0${k + 1} / 06` : "One orange cap"}
        </div>
        <div style={{ overflow: "hidden", marginTop: 20, paddingBottom: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontStretch: "112%", fontSize: 150, letterSpacing: "-0.045em", lineHeight: 0.95, color: C.ink,
            translate: `0px ${interpolate(local, [0, 6], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}%` }}>
            {c ? c.flavor : "Six new flavors."}
          </div>
        </div>
        <div style={{ height: 12, width: 260, borderRadius: 99, background: acc, marginTop: 24,
          scale: `${interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })} 1`, transformOrigin: "0 50%" }} />
      </div>
    </AbsoluteFill>
  );
};

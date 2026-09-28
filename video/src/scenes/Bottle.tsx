import { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TB, bottleSvg } from "../core";
import { BEAT, C, DISPLAY, MONO } from "../theme";

// 135-240 (local 0-105): the bottle lands, then refills through all six flavor
// worlds on the beat. Each refill pours a new world in behind it.
const ICONIC = { liq: ["#4FB3E6", "#1A78C0"] as [string, string], band: "#6CC3EA", flavor: "Invigorating Icy Mint" };
const out = Easing.bezier(0.16, 1, 0.3, 1);
const FIRST = 15;

const World: React.FC<{ id: string; t: number }> = ({ id, t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const art = TB.ART[id];
    art.draw(ctx, 1920, 1080, t, art.init(TB.rng(7)), 0.4); // pure function of t = deterministic
  }, [id, t]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />;
};

export const Bottle: React.FC = () => {
  const f = useCurrentFrame();
  const k = f < FIRST ? -1 : Math.min(5, Math.floor((f - FIRST) / BEAT));
  const c = k >= 0 ? TB.CONCEPTS[k] : null;
  const local = k >= 0 ? f - FIRST - k * BEAT : f;
  const svg = useMemo(() => (c ? bottleSvg(TB.conceptBottleOpts(c)) : bottleSvg(ICONIC)), [c]);
  const logo = useMemo(() => TB.logoSymbol(staticFile("img/therabreath-logo.png")), []);
  // text colour follows the world that is filling the frame
  const dark = c && local >= 2 ? c.tone === "dark" : k > 0 ? TB.CONCEPTS[k - 1].tone === "dark" : false;
  const fg = dark ? "#fff" : C.ink;
  const acc = c ? c.hi : C.blue;
  const [w1, ...rest] = (c ? c.name : "Six new worlds").split(" ");
  const big = w1.length > 7 ? 184 : 224;
  // wobble on every refill
  const wob = k >= 0 ? Math.sin(local * 0.9) * 7 * Math.exp(-local / 5) : 0;
  // the new world pours in from the bottom on each beat
  const pour = k >= 0 ? interpolate(local, [0, 5], [1080, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }) : 1080;
  const prevId = k > 0 ? TB.CONCEPTS[k - 1].id : "oxygen";
  const t = 6 + f / 30;
  return (
    <AbsoluteFill name="Bottle" style={{ background: "#E6F6FD", overflow: "hidden" }}>
      <div dangerouslySetInnerHTML={{ __html: logo }} />
      <World id={prevId} t={t} />
      {k >= 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1080 - pour, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920, height: 1080 }}>
            <World id={c!.id} t={t} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: "rgba(255,255,255,.85)" }} />
        </div>
      )}
      {/* rotating ring text */}
      <svg viewBox="0 0 1000 1000" style={{ position: "absolute", left: 1420, top: 560, width: 940, height: 940, translate: "-50% -50%", rotate: `${f * 0.9}deg`, opacity: 0.55 }}>
        <defs><path id="ring" d="M500,500 m-420,0 a420,420 0 1,1 840,0 a420,420 0 1,1 -840,0" /></defs>
        <text fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={11} fill={fg}>
          <textPath href="#ring">SIX NEW WORLDS · BUILT FOR SODIUM CHLORITE · SIX NEW WORLDS · BUILT FOR SODIUM CHLORITE · </textPath>
        </text>
      </svg>
      {/* bubbles burst on each change */}
      {k >= 0 && Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + k;
        const d = interpolate(local, [0, 12], [60, 330 + (i % 3) * 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out });
        return <div key={i} style={{ position: "absolute", left: 1420 + Math.cos(a) * d, top: 600 + Math.sin(a) * d * 0.9, width: 18 + (i % 4) * 8, height: 18 + (i % 4) * 8,
          borderRadius: "50%", border: "3px solid #fff", background: "rgba(255,255,255,.35)", translate: "-50% -50%",
          opacity: interpolate(local, [0, 2, 13], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />;
      })}
      {/* the bottle */}
      <Interactive.Div
        name="Bottle"
        style={{
          position: "absolute", left: 1420, top: 575, width: 340, height: 850, translate: "-50% -50%",
          rotate: `${interpolate(f, [0, FIRST], [-38, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) }) + wob}deg`,
          marginTop: interpolate(f, [0, FIRST], [900, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out }),
          scale: k >= 0 ? interpolate(local, [0, 3, 10], [1, 1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1,
          filter: "drop-shadow(0 50px 50px rgba(0,30,70,.32))",
        }}
      >
        <div style={{ width: 340, height: 850 }} dangerouslySetInnerHTML={{ __html: svg.replace('class="bottle"', 'width="340" height="850"') }} />
      </Interactive.Div>
      {/* flavor name */}
      <div style={{ position: "absolute", left: 130, top: 200, width: 1060, color: fg }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 16,
          opacity: interpolate(f, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 99, background: C.orange, color: "#fff", fontSize: 22 }}>{k >= 0 ? `0${k + 1}` : "TB"}</span>
          {k >= 0 ? "Flavor world" : "One orange cap"}
        </div>
        <div style={{ overflow: "hidden", marginTop: 26, paddingBottom: 10 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: big, letterSpacing: "-0.03em", lineHeight: 0.86, textTransform: "uppercase",
            translate: `0px ${interpolate(local, [0, 6], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}%` }}>
            {w1}
          </div>
        </div>
        <div style={{ overflow: "hidden", paddingBottom: 10 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontStretch: "88%", fontSize: big, letterSpacing: "0.01em", lineHeight: 0.86, textTransform: "uppercase",
            color: "transparent", WebkitTextStroke: `4px ${fg}`,
            translate: `0px ${interpolate(local, [1, 7], [110, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}%` }}>
            {rest.join(" ")}
          </div>
        </div>
        <div style={{ height: 14, width: 280, borderRadius: 99, background: acc, marginTop: 30,
          scale: `${interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })} 1`, transformOrigin: "0 50%" }} />
        {c && <div style={{ marginTop: 24, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: "-0.02em",
          opacity: interpolate(local, [3, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{c.tag}</div>}
      </div>
    </AbsoluteFill>
  );
};

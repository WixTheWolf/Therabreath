import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/* Trailer titles for THE FLAVOR RACE: condensed metallic letters that slam in from wide tracking, a light sweep
   across the face, an anamorphic flare on the hit, drifting embers and a slow push. Used on black or over picture. */
const MONUMENT = '"Archivo", "Arial Narrow", sans-serif';
const SANS = '"Geist", "Helvetica Neue", Arial, sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const METAL = "linear-gradient(180deg, #FFFFFF 0%, #F7EEDD 34%, #C9A46A 50%, #FFF4DE 62%, #A7834F 100%)";

// deterministic embers
const EMBERS = Array.from({ length: 28 }, (_, i) => {
  const r = (k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1) * 1920, y: 300 + r(2) * 780, s: 1.5 + r(3) * 3.5, v: 0.4 + r(4) * 1.2, ph: r(5) * 6.28 };
});

export const EpicTitle: React.FC<{
  lines: string[];
  dur: number; // frames
  size?: number;
  over?: boolean; // over picture instead of black
  kicker?: string; // small line above
  y?: number;
  hold?: boolean; // no fade out (hard cut)
  soft?: boolean; // eases in slowly with no slam, and fades out slowly
}> = ({ lines, dur, size = 200, over, kicker, y = 0, hold, soft }) => {
  const fr = useCurrentFrame();
  const intro = interpolate(fr, [0, soft ? 45 : 16], [0, 1], { ...clamp, easing: out });
  const fadeOut = hold ? 1 : interpolate(fr, [dur - (soft ? 50 : 9), dur], [1, 0], clamp);
  const scale = interpolate(intro, [0, 1], [soft ? 1.04 : 1.16, 1]) * interpolate(fr, [0, dur], [1, 1.045]);
  const track = interpolate(fr, [0, soft ? 70 : 26], [soft ? 0.16 : 0.42, 0.06], { ...clamp, easing: out });
  const blur = interpolate(fr, [0, soft ? 30 : 10], [soft ? 6 : 14, 0], clamp);
  const sweep = interpolate(fr, [4, 34], [-60, 160], clamp);
  const flare = soft ? 0 : interpolate(fr, [0, 6, 18, dur], [0, 0.28, 0.1, 0.05], clamp); // a soft glint, not a wipe
  const kick = interpolate(fr, [8, 22], [0, 1], clamp);
  const text = (fill: React.CSSProperties) => (
    <div style={{ textAlign: "center", transform: `translateY(${y}px) scale(${scale})`, filter: `blur(${blur}px)` }}>
      {lines.map((l) => (
        <div key={l} style={{ font: `800 ${size}px/0.9 ${MONUMENT}`, fontStretch: "66%", letterSpacing: `${track}em`, paddingLeft: `${track}em`, whiteSpace: "nowrap", ...fill }}>{l}</div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: fadeOut, background: over ? "radial-gradient(ellipse 80% 55% at 50% 50%, rgba(0,0,0,.55), rgba(0,0,0,.15))" : "#000" }}>
      {!over && (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at ${50 + Math.sin(fr / 40) * 6}% 55%, rgba(120,70,30,.22), rgba(0,0,0,0) 70%)` }} />
      )}
      {EMBERS.map((e, i) => {
        const yy = e.y - fr * e.v * 1.6;
        const o = (0.25 + 0.35 * Math.sin(fr / 7 + e.ph)) * intro * (over ? 0.6 : 1);
        return <div key={i} style={{ position: "absolute", left: e.x + Math.sin(fr / 30 + e.ph) * 12, top: ((yy % 1080) + 1080) % 1080, width: e.s, height: e.s, borderRadius: 9, background: "#FFB46A", opacity: o, boxShadow: "0 0 8px #FF8A3D" }} />;
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {kicker && (
          <div style={{ position: "absolute", top: 540 - size * lines.length * 0.45 - 70 + y, opacity: kick, font: `500 30px ${SANS}`, letterSpacing: "0.6em", paddingLeft: "0.6em", color: "#E9D9BC" }}>{kicker}</div>
        )}
        <div style={{ position: "relative", filter: "drop-shadow(0 0 26px rgba(255,170,90,.35)) drop-shadow(0 8px 30px rgba(0,0,0,.7))", opacity: intro }}>
          {text({ background: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" })}
          <div style={{ position: "absolute", inset: 0 }}>
            {text({
              background: `linear-gradient(105deg, rgba(255,240,215,0) ${sweep - 18}%, rgba(255,240,215,.28) ${sweep}%, rgba(255,240,215,0) ${sweep + 18}%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            })}
          </div>
        </div>
      </AbsoluteFill>
      {/* anamorphic flare */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none", mixBlendMode: "screen", opacity: flare }}>
        <div style={{ position: "absolute", top: 540 + y - 1, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, rgba(255,140,60,0), rgba(255,190,120,.9) 35%, #fff 50%, rgba(255,190,120,.9) 65%, rgba(255,140,60,0))" }} />
        <div style={{ position: "absolute", top: 540 + y - 40, left: "10%", right: "10%", height: 80, background: "radial-gradient(ellipse at center, rgba(255,170,90,.45), rgba(255,170,90,0) 70%)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

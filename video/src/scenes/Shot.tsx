import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { HAVE } from "../clips";

// One full-bleed "shot": Higgsfield b-roll when it has been fetched into
// public/clips, otherwise the matching generative canvas world, so the reel
// always renders. A slow push-in makes both read as camera moves.
const FALLBACK: Record<string, string> = { drop: "oxygen" };

const World: React.FC<{ id: string; t: number }> = ({ id, t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    const art = TB.ART[FALLBACK[id] ?? id] ?? TB.ART.oxygen;
    if (ctx) art.draw(ctx, 1920, 1080, t, art.init(TB.rng(7)), 0.4);
  }, [id, t]);
  return <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />;
};

export const Shot: React.FC<{ id: string; push?: number; start?: number; dim?: number }> = ({ id, push = 0.08, start = 0, dim = 0 }) => {
  const f = useCurrentFrame();
  const scale = 1 + push * Math.min(1, f / 150);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#071C3C" }}>
      <AbsoluteFill style={{ scale: `${scale}` }}>
        {HAVE.includes(id) ? (
          <OffthreadVideo src={staticFile(`clips/${id}.mp4`)} muted startFrom={start} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
        ) : (
          <World id={id} t={6 + (f + start) / 30} />
        )}
      </AbsoluteFill>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(4,16,36,${dim})` }} />}
    </AbsoluteFill>
  );
};

// Cinematic finish over everything: letterbox, vignette and moving film grain.
export const Grade: React.FC<{ bars?: number }> = ({ bars = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,8,24,.5) 100%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
      {bars > 0 && <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#000" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#000" }} />
      </>}
    </AbsoluteFill>
  );
};

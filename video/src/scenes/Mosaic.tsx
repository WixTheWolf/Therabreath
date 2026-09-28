import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { TB } from "../core";
import { C, DISPLAY } from "../theme";

// 240-315 (local 0-75): the six flavor artworks fly into a grid, hang, then collapse into a white flash.
const out = Easing.bezier(0.16, 1, 0.3, 1);
const SIZE = 330;

const Art: React.FC<{ id: string; t: number; seed: number }> = ({ id, t, seed }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const art = TB.ART[id];
    art.draw(ctx, SIZE, SIZE, t, art.init(TB.rng(seed))); // fresh state every frame = deterministic
  }, [id, t, seed]);
  return <canvas ref={ref} width={SIZE} height={SIZE} style={{ width: SIZE, height: SIZE, borderRadius: "50%", display: "block" }} />;
};

export const Mosaic: React.FC = () => {
  const f = useCurrentFrame();
  const collapse = interpolate(f, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.84, 0) });
  return (
    <AbsoluteFill name="Mosaic" style={{ background: `radial-gradient(circle at 50% 50%, #123B6E 0%, ${C.ink} 75%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, scale: interpolate(f, [0, 60], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        {TB.CONCEPTS.map((c, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const x = 960 + (col - 1) * 480, y = 520 + (row - 0.5) * 480;
          const start = i * 4;
          const p = interpolate(f - start, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.4, 0.64, 1) });
          const fromX = [-900, 0, 900][col] + (row ? 200 : -200), fromY = row ? 800 : -800;
          const cx = x + (1 - p) * fromX, cy = y + (1 - p) * fromY;
          const fx = cx + (960 - cx) * collapse, fy = cy + (540 - cy) * collapse;
          return (
            <div key={c.id} style={{ position: "absolute", left: fx, top: fy, translate: "-50% -50%",
              rotate: `${(1 - p) * (i % 2 ? 90 : -90) + f * (i % 2 ? 0.25 : -0.25)}deg`,
              scale: `${(0.4 + 0.6 * p) * (1 - collapse)}`, opacity: Math.min(1, p * 2) }}>
              <div style={{ borderRadius: "50%", boxShadow: `0 30px 80px rgba(0,0,0,.45), 0 0 0 6px ${c.acc}` }}>
                <Art id={c.id} t={8 + f / 20} seed={101 + i * 17} />
              </div>
              <div style={{ position: "absolute", left: "50%", bottom: -58, translate: "-50% 0", whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 800,
                fontSize: 32, color: "#fff", rotate: `${-((1 - p) * (i % 2 ? 90 : -90) + f * (i % 2 ? 0.25 : -0.25))}deg`,
                opacity: interpolate(f - start, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                {c.name}
              </div>
            </div>
          );
        })}
      </div>
      {/* headline slams across the middle */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, translate: "0 -50%", textAlign: "center", pointerEvents: "none",
        opacity: interpolate(f, [34, 38, 58, 62], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <span style={{ display: "inline-block", background: C.orange, color: "#fff", padding: "18px 44px", borderRadius: 18,
          fontFamily: DISPLAY, fontWeight: 800, fontStretch: "90%", fontSize: 110, letterSpacing: "-0.028em",
          rotate: "-3deg", scale: `${interpolate(f, [34, 42], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: out })}`,
          boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}>
          Tasted blind.
        </span>
      </div>
      {/* white flash grows from the centre */}
      <div style={{ position: "absolute", left: 960, top: 540, width: 20, height: 20, borderRadius: "50%", background: C.paper, translate: "-50% -50%",
        scale: interpolate(f, [62, 72], [0, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.84, 0) }) }} />
    </AbsoluteFill>
  );
};

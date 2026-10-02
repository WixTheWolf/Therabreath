'use client';
// Live WebGL light: the drop or the two glasses. Adapts its resolution to hold frame rate,
// pauses when hidden, and falls back to a still image if WebGL2 is unavailable.
import { useEffect, useRef, useState } from 'react';
import { createLight } from '@/lib/light';

type Props = {
  scene: 'drop' | 'glasses';
  theme: 'a' | 'b';
  camera: any;
  width?: number; height?: number;
  frame?: (t: number) => any; // per-frame render options (fill, glow, rot...)
  className?: string; style?: React.CSSProperties;
  fallback?: string;
  quality?: number;
  still?: boolean;
  extra?: any;
};

export default function Light({ scene, theme, camera, width = 1920, height = 1080, frame, className, style, fallback, quality = 0.75, still, extra }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    let scale = quality;
    const size = () => { c.width = Math.round(width * scale); c.height = Math.round(height * scale); };
    size();
    let L: any;
    try { L = createLight(c, { scene, theme, camera, ...(extra || {}) }); } catch { setFailed(true); return; }
    let raf = 0, t0 = performance.now(), last = t0, slow = 0, fast = 0;
    const loop = (now: number) => {
      const dt = now - last; last = now;
      if (dt > 45) { slow++; fast = 0; } else if (dt < 20) { fast++; slow = 0; }
      if (slow > 20 && scale > 0.35) { scale = Math.max(0.35, scale * 0.8); size(); L = createLight(c, { scene, theme, camera, ...(extra || {}) }); slow = 0; }
      if (fast > 240 && scale < quality) { scale = Math.min(quality, scale * 1.15); size(); L = createLight(c, { scene, theme, camera, ...(extra || {}) }); fast = 0; }
      const t = (now - t0) / 1000;
      L.render(t, { strips: 1, ...(frameRef.current?.(t) || {}) });
      if (!still) raf = requestAnimationFrame(loop);
    };
    const vis = () => { cancelAnimationFrame(raf); if (document.visibilityState === 'visible') raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); };
  }, [scene, theme, width, height, quality, still, JSON.stringify(camera), JSON.stringify(extra)]);

  if (failed && fallback) return <img src={fallback} alt="" className={className} style={{ width, height, objectFit: 'cover', ...style }} />;
  return <canvas ref={ref} className={className} style={{ width, height, display: 'block', ...style }} />;
}

// Project a world point to stage pixels, matching the shader camera.
export function project(P: number[], cam: any, W = 1920, H = 1080) {
  const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
  const norm = (v: number[]) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const f = norm(sub(cam.target, cam.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), d = sub(P, cam.pos);
  const tf = Math.tan(cam.fov * Math.PI / 360), asp = W / H;
  const nx = dot(d, r) / (dot(d, f) * tf * asp) + cam.shift[0], ny = dot(d, u) / (dot(d, f) * tf) + cam.shift[1];
  return [(nx + 1) / 2 * W, (1 - (ny + 1) / 2) * H];
}

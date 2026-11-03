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
  onStart?: () => void; // called on the first drawn frame
};

export default function Light({ scene, theme, camera, width = 1920, height = 1080, frame, className, style, fallback, quality = 0.75, still, extra, onStart }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const startRef = useRef(onStart);
  startRef.current = onStart;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    let scale = quality;
    const size = () => { c.width = Math.round(width * scale); c.height = Math.round(height * scale); };
    size();
    // Hidden until the first frame lands: the program compiles in the background, and an undrawn canvas is black.
    c.style.opacity = '0';
    let L: any;
    try { L = createLight(c, { scene, theme, camera, ...(extra || {}) }); } catch { setFailed(true); return; }
    let raf = 0, t0 = 0, last = 0, slow = 0, fast = 0, shown = false;
    const loop = (now: number) => {
      let drawn = false;
      try { drawn = L.render(t0 ? (now - t0) / 1000 : 0, { strips: 1, ...(frameRef.current?.(t0 ? (now - t0) / 1000 : 0) || {}) }); } catch { setFailed(true); return; }
      if (drawn) {
        // The scene's clock starts on the first real frame, so fills and builds are not skipped while compiling.
        if (!t0) { t0 = now; last = now; }
        if (!shown) { shown = true; c.style.transition = 'opacity .5s ease'; c.style.opacity = '1'; startRef.current?.(); }
        const dt = now - last; last = now;
        if (dt > 45) { slow++; fast = 0; } else if (dt < 20) { fast++; slow = 0; }
        // Resizing keeps the same program; render() reads the new size every frame.
        if (slow > 20 && scale > 0.35) { scale = Math.max(0.35, scale * 0.8); size(); slow = 0; }
        if (fast > 240 && scale < quality) { scale = Math.min(quality, scale * 1.15); size(); fast = 0; }
        if (still) return;
      }
      raf = requestAnimationFrame(loop);
    };
    const vis = () => { cancelAnimationFrame(raf); if (document.visibilityState === 'visible') raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', vis);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis); (L?.gl?.getExtension('WEBGL_lose_context') as any)?.loseContext(); };
  }, [scene, theme, width, height, quality, still, JSON.stringify(camera), JSON.stringify(extra)]);

  if (failed && fallback) return <img src={fallback} alt="" className={className} style={{ width, height, objectFit: 'cover', ...style }} />;
  return <canvas ref={ref} className={className} style={{ width, height, display: 'block', ...style }} />;
}

// Compile both light programs once, off screen and in the background, when the Stage opens. The GPU process
// caches compiled programs, so the drop and the glasses appear at once later instead of compiling on a key press.
export function prewarmLight() {
  for (const scene of ['drop', 'glasses'] as const) {
    try {
      const c = document.createElement('canvas'); c.width = 8; c.height = 8;
      const L: any = createLight(c, { scene, theme: 'a', camera: {} });
      const done = () => (L.gl.getExtension('WEBGL_lose_context') as any)?.loseContext();
      const poll = () => { try { if (L.render(0, { strips: 1 })) return done(); } catch { return done(); } setTimeout(poll, 250); };
      setTimeout(poll, 250);
    } catch {}
  }
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

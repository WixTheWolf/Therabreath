'use client';
// A living orb whose colour, softness and shape come from a freshness profile.
// Profile keys, each 1 to 5: adv (familiar to adventurous), cool (cooling to soft), bot (classic to botanical),
// exp (functional to experiential), occ (everyday to occasion-based).
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export const PROFILE = [
  { id: 'adv', l: 'More familiar', r: 'More adventurous' },
  { id: 'cool', l: 'Cooling', r: 'Soft' },
  { id: 'bot', l: 'Classic freshness', r: 'Botanical freshness' },
  { id: 'exp', l: 'Functional', r: 'Experiential' },
  { id: 'occ', l: 'Everyday', r: 'Occasion-based' },
];
export const DEFAULT_PROFILE: Record<string, number> = { adv: 3, cool: 3, bot: 3, exp: 3, occ: 3 };

export function describe(p: Record<string, number>, who = 'Your freshness is') {
  const w = (id: string, lo: string, hi: string) => (p[id] <= 2 ? lo : p[id] >= 4 ? hi : '');
  const words = [w('adv', 'familiar', 'adventurous'), w('cool', 'cold', 'soft'), w('bot', 'classic', 'botanical'), w('exp', 'functional', 'experiential'), w('occ', 'everyday', 'made for moments')].filter(Boolean);
  return words.length ? `${who} ${words.join(', ')}.` : `${who} beautifully balanced.`;
}

const Orb = forwardRef<HTMLCanvasElement, { profile: Record<string, number>; size?: number; className?: string }>(function Orb({ profile, size = 320, className }, fref) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pr = useRef(profile); pr.current = profile;
  useImperativeHandle(fref, () => ref.current!);
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!; let raf = 0; const t0 = performance.now();
    const S = c.width, cx = S / 2, cy = S / 2;
    const f = (now: number) => {
      const t = (now - t0) / 1000, p = pr.current;
      const n = (id: string) => ((p[id] ?? 3) - 1) / 4; // 0..1
      g.clearRect(0, 0, S, S);
      // colours: cool blue to soft lavender, classic mint to botanical green, familiar to adventurous warmth
      const hueA = 190 - n('cool') * 60 + n('adv') * 150; // 190 (glacier) to 280 (lavender) to warm
      const hueB = 170 - n('bot') * 60; // mint to leaf green
      const sat = 45 + n('exp') * 40;
      const lobes = 3 + Math.round(n('occ') * 4);
      const wob = 0.04 + n('adv') * 0.1 + n('exp') * 0.05;
      const soft = 0.5 + n('cool') * 0.4;
      for (let layer = 0; layer < 3; layer++) {
        g.beginPath();
        const R = S * (0.34 - layer * 0.05);
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
          const r = R * (1 + wob * Math.sin(a * lobes + t * (0.6 + layer * 0.3)) + 0.03 * Math.sin(a * 2 - t));
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        const grd = g.createRadialGradient(cx - S * 0.1, cy - S * 0.12, S * 0.02, cx, cy, R * 1.1);
        grd.addColorStop(0, `hsla(${hueA % 360},${sat}%,96%,.95)`);
        grd.addColorStop(soft, `hsla(${(hueA + layer * 30) % 360},${sat}%,${72 - layer * 6}%,.75)`);
        grd.addColorStop(1, `hsla(${hueB},${sat}%,${60 - layer * 5}%,${0.35 - layer * 0.08})`);
        g.fillStyle = grd; g.shadowColor = `hsla(${hueA % 360},${sat}%,70%,.6)`; g.shadowBlur = 40;
        g.fill();
      }
      g.shadowBlur = 0;
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={size * 2} height={size * 2} className={className} style={{ width: size, height: size }} />;
});
export default Orb;

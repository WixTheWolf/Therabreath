'use client';
import { useEffect, useRef } from 'react';
import { R, Enter, SceneProps, Src } from './ui';
import { MOLECULES } from '@/lib/content';

// 18. What flavor really is
export function School({ step }: SceneProps) {
  const parts = [
    { t: 'Taste', w: 'The tongue', d: 'Sweet, sour, salty, bitter, umami.' },
    { t: 'Aroma', w: 'The nose, both ways', d: 'Sniffed in, and rising from the back of the mouth as you swallow.' },
    { t: 'Feel', w: 'The trigeminal nerve', d: 'Cooling, tingling, warming. What mint really is.' },
  ];
  return (
    <div className="pad school">
      <Enter i={0}><div className="k">Flavor School · with Alex</div></Enter>
      <Enter i={1}><h2 className="h1" style={{ maxWidth: 1300 }}>Most of what we call flavor is actually smell. <span className="it">The rest is feeling.</span></h2></Enter>
      <div className="venn">
        {parts.map((p, i) => (
          <R key={p.t} b={i + 1} step={step} className={'vc vc' + i}><div className="vc-in"><b className="h3">{p.t}</b><span className="k">{p.w}</span><p>{p.d}</p></div></R>
        ))}
      </div>
      <Src k="pf" extra="Wording to be confirmed with Alex" style={{ position: 'absolute', left: 120, bottom: 118 }} />
    </div>
  );
}

// 19. How cool works (illustrative curves)
export function Cooling({ step }: SceneProps) {
  const W = 1080, H = 640, ml = 90, mb = 90, mt = 40, mr = 40;
  const X = (v: number) => ml + v * (W - ml - mr), Y = (v: number) => H - mb - v * (H - mb - mt);
  const curves = [
    { id: 'Classic menthol', col: '#9FE6F4', w: 3, dash: '', pts: [[0, .02], [.12, .55], [.25, .95], [.38, .70], [.50, .30], [.62, .08], [.80, .02], [1, .01]], lab: [.27, .97] },
    { id: 'Long-lasting cooler', col: '#C9B8FF', w: 3, dash: '10 8', pts: [[0, 0], [.20, .12], [.40, .45], [.55, .60], [.70, .50], [.85, .32], [1, .20]], lab: [.60, .44] },
    { id: 'A signature curve', col: '#FFFFFF', w: 5, dash: '', pts: [[0, .02], [.12, .50], [.25, .86], [.40, .74], [.55, .62], [.70, .52], [.85, .42], [1, .32]], lab: [.80, .52] },
  ];
  const path = (pts: number[][]) => { const P = pts.map(([a, b]) => [X(a), Y(b)]); let d = `M${P[0][0]} ${P[0][1]}`; for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`; } return d; };
  const ticks: [string, number][] = [['1 sec', 0], ['10 sec', .24], ['1 min', .428], ['10 min', .668], ['1 hr', .855], ['4 hr', 1]];
  const sig = curves[2].pts;
  const frost = Array.from({ length: 24 }, (_, i) => { const x = 0.06 + i * 0.038; let y = 0; for (let k = 0; k < sig.length - 1; k++) if (x >= sig[k][0] && x <= sig[k + 1][0]) y = sig[k][1] + (sig[k + 1][1] - sig[k][1]) * ((x - sig[k][0]) / (sig[k + 1][0] - sig[k][0])); return { x: X(x), y: Y(y) - 30 - ((i * 37) % 11) * 2, r: 6 + y * 14, i }; });
  const crystal = (cx: number, cy: number, r: number) => { let d = ''; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a); d += `M${cx} ${cy}L${cx + ca * r} ${cy + sa * r}`; for (const f of [0.45, 0.72]) { const bx = cx + ca * r * f, by = cy + sa * r * f, bl = r * 0.28 * (1.1 - f); for (const sgn of [-1, 1]) { const b = a + sgn * Math.PI / 4; d += `M${bx} ${by}L${bx + Math.cos(b) * bl} ${by + Math.sin(b) * bl}`; } } } return d; };
  return (
    <div className="pad cooling">
      <div className="cool-copy">
        <Enter i={0}><div className="k">Flavor School · How cool works</div></Enter>
        <Enter i={1}><h2 className="h1">Cooling has<br />two jobs.</h2></Enter>
        <R b={3} step={step}><p className="h3 it accent">The first impression and the last impression. We design both.</p></R>
        <div className="src" style={{ marginTop: 40 }}>Illustrative curves for teaching, not measured data. [CONFIRM with Alex]</div>
      </div>
      <svg className="cool-plot" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs><filter id="cglow"><feGaussianBlur stdDeviation="7" /></filter></defs>
        {ticks.map(([t, v]) => <g key={t}><line x1={X(v)} x2={X(v)} y1={Y(0)} y2={Y(1)} stroke="var(--rule2)" /><text x={X(v)} y={Y(0) + 36} textAnchor="middle" className="axis">{t.toUpperCase()}</text></g>)}
        <line x1={X(0)} x2={X(1)} y1={Y(0)} y2={Y(0)} stroke="var(--fg3)" strokeWidth={1.4} /><line x1={X(0)} x2={X(0)} y1={Y(0)} y2={Y(1)} stroke="var(--fg3)" strokeWidth={1.4} />
        <text x={(X(0) + X(1)) / 2} y={Y(0) + 72} textAnchor="middle" className="axis strong">TIME AFTER RINSING</text>
        <text transform={`translate(${X(0) - 34} ${(Y(0) + Y(1)) / 2}) rotate(-90)`} textAnchor="middle" className="axis strong">PERCEIVED COOLING</text>
        {curves.map((c, i) => step >= i && (
          <g key={c.id} className="cc">
            <path d={path(c.pts)} stroke={c.col} strokeWidth={c.w * 3} fill="none" opacity={0.35} filter="url(#cglow)" className="draw" />
            <path d={path(c.pts)} stroke={c.col} strokeWidth={c.w} fill="none" strokeDasharray={c.dash || undefined} strokeLinecap="round" className={c.dash ? 'fade' : 'draw'} />
            <text x={X(c.lab[0]) + 14} y={Y(c.lab[1]) - 14} fill={c.col} className="clab">{c.id}</text>
          </g>
        ))}
        {step >= 2 && frost.map((f) => <path key={f.i} d={crystal(f.x, f.y, f.r)} stroke="rgba(220,246,252,.8)" strokeWidth={1.6} fill="none" strokeLinecap="round" className="frost" style={{ ['--i' as any]: f.i }} />)}
      </svg>
    </div>
  );
}

// 20. Flavor in an oxidizing world: flavor molecules drifting through an oxygen-rich field.
export function Oxyd({ step }: SceneProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!; let raf = 0; const W = c.width, H = c.height;
    const ox = Array.from({ length: 220 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 0.2 + Math.random() * 0.6 }));
    const fl = Array.from({ length: 26 }, (_, i) => ({ x: -Math.random() * W * 0.6, y: 120 + Math.random() * (H - 240), s: 0.6 + Math.random(), keep: i % 3 !== 0, hue: [190, 28, 330, 140, 260][i % 5], ch: 0 }));
    const f = () => {
      g.clearRect(0, 0, W, H);
      for (const o of ox) { o.y -= o.v; if (o.y < 0) o.y = H; g.fillStyle = 'rgba(191,233,242,.28)'; g.beginPath(); g.arc(o.x, o.y, 2.2, 0, 7); g.fill(); }
      for (const m of fl) {
        m.x += m.s * 1.1; if (m.x > W + 60) { m.x = -60; m.ch = 0; }
        const inField = m.x > W * 0.45; if (inField && !m.keep) m.ch = Math.min(1, m.ch + 0.01);
        const r = 16;
        g.save(); g.translate(m.x, m.y);
        for (let k = 0; k < 5; k++) { const a = k * 1.256 + m.x * 0.004; const rr = r * (1 + (m.ch * Math.sin(k * 3 + m.x * 0.02)) * 0.8); g.fillStyle = m.keep ? `hsla(${m.hue},90%,78%,.9)` : `hsla(${m.hue},${90 - m.ch * 80}%,${78 - m.ch * 30}%,${0.9 - m.ch * 0.4})`; g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, 6, 0, 7); g.fill(); }
        if (m.keep && inField) { g.shadowBlur = 24; g.shadowColor = `hsl(${m.hue},90%,70%)`; g.fillStyle = `hsla(${m.hue},90%,85%,.9)`; g.beginPath(); g.arc(0, 0, 5, 0, 7); g.fill(); }
        g.restore();
      }
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, []);
  const levers = ['pH control', 'Protective solubilization', 'Choosing materials that hold up'];
  return (
    <div className="oxyd">
      <canvas ref={ref} width={1920} height={1080} className="oxyd-cv" />
      <div className="pad" style={{ position: 'relative' }}>
        <Enter i={0}><div className="k">Flavor School · Flavor in an oxidizing world</div></Enter>
        <Enter i={1}><h2 className="h2" style={{ maxWidth: 1000 }}>OXYD-8 is designed to be tough on odor-causing bacteria. That also makes it a demanding home for flavor.</h2></Enter>
        <div className="levers">{levers.map((l, i) => <R key={l} b={i + 1} step={step} className="lever"><span className="num">0{i + 1}</span>{l}</R>)}</div>
        <R b={3} step={step} className="oxyd-pay h1 it">We don&rsquo;t just make it taste good. We make it survive.</R>
      </div>
      <Src k="patent" extra="No TheraBreath or TFF formula details. [CONFIRM copy with Alex]" style={{ position: 'absolute', left: 120, bottom: 118 }} />
    </div>
  );
}

// 21. Anatomy of a TheraBreath flavor
export function Anatomy({ step }: SceneProps) {
  const layers = [
    { t: 'First impression', d: 'Aroma as the cap opens.' },
    { t: 'Heart', d: 'The character.' },
    { t: 'Finish', d: 'Clean cooling.' },
    { t: 'Linger', d: 'The long confidence.' },
  ];
  return (
    <div className="pad anatomy">
      <div className="an-copy">
        <Enter i={0}><div className="k">Flavor School · Anatomy of a TheraBreath flavor</div></Enter>
        <Enter i={1}><h2 className="h1">However adventurous it starts, <span className="it">it must finish fresh.</span></h2></Enter>
      </div>
      <div className="pyramid">
        {layers.map((l, i) => <R key={l.t} b={i + 1} step={step} className={'py py' + i} style={{ ['--w' as any]: `${40 + i * 20}%` }}><b>{l.t}</b><span>{l.d}</span></R>)}
      </div>
    </div>
  );
}

// 22. Molecule flight: guess the source on your phone, then reveal.
export function Molecules({ s, step }: SceneProps) {
  const m = Math.min(MOLECULES.length - 1, Math.floor(step / 2));
  const mol = MOLECULES[m];
  const reveal = step % 2 === 1;
  const g = s.guesses[mol.id] || {};
  const tally: Record<string, number> = {}; Object.values(g).forEach((a) => (tally[a] = (tally[a] || 0) + 1));
  const total = Object.values(g).length;
  const right = tally[mol.source] || 0;
  const formula: Record<string, string> = { menthol: 'C₁₀H₂₀O', anethole: 'C₁₀H₁₂O', eugenol: 'C₁₀H₁₂O₂', msal: 'C₈H₈O₃', limonene: 'C₁₀H₁₆', hexenol: 'C₆H₁₂O', linalool: 'C₁₀H₁₈O' };
  return (
    <div className="pad molecules">
      <Enter i={0}><div className="k">Molecule flight · vial {m + 1} of 7</div></Enter>
      <div className="mol-row">{MOLECULES.map((x, i) => <span key={x.id} className={i === m ? 'on' : i < m ? 'done' : ''}>{x.sym}</span>)}</div>
      <div className="mol-stage">
        <div className="mol-orb" key={mol.id}><span className="mol-sym">{mol.sym}</span>{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ ['--i' as any]: i }} />)}</div>
        <div className="mol-text">
          <div className={'mol-q h1' + (reveal ? ' out' : '')}>What do you think<br /><span className="it">this is?</span></div>
          <div className={'mol-a' + (reveal ? ' on' : '')}>
            <div className="k">{formula[mol.id]}</div>
            <div className="hero" style={{ fontSize: 132 }}>{mol.name}</div>
            <div className="h2 it accent">{mol.source}</div>
            <p className="lede">{mol.note}</p>
            <div className="mol-score">{total ? <><b className="num">{right}</b> of {total} guessed it</> : 'Guesses come from the phones'}</div>
          </div>
        </div>
      </div>
      <div className="src" style={{ position: 'absolute', left: 120, bottom: 118 }}>Molecule set to be confirmed with Alex.</div>
    </div>
  );
}

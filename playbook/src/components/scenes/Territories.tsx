'use client';
import { useEffect, useRef, useState } from 'react';
import Light from '../Light';
import { R, Enter, SceneProps, spectrumAt } from './ui';
import { TERRITORIES, SAMPLES, WHO_CHIPS } from '@/lib/content';
import { tallyPick, ranked, tasteSummary } from '@/lib/state';

// Map positions: x = character (familiar to adventurous), y = intensity (gentle to bold). Our perspective, illustrative.
const POS: Record<string, [number, number]> = { mint: [0.16, 0.55], botanical: [0.3, 0.3], fruit: [0.6, 0.4], warmcool: [0.78, 0.66], dessert: [0.7, 0.2], ladder: [0.3, 0.12], passport: [0.86, 0.42] };

// 23. The map
export function MapScene({ step }: SceneProps) {
  const W = 1160, H = 700;
  return (
    <div className="pad map">
      <div className="map-copy">
        <Enter i={0}><div className="k">The Territory Flight · the map</div></Enter>
        <Enter i={1}><h2 className="h1">Seven places<br />flavor <span className="it">can go.</span></h2></Enter>
        <R b={2} step={step}><p className="lede" style={{ maxWidth: 440, marginTop: 36 }}>The gentle, adventurous corner is where the next 86% live.</p></R>
        <div className="src" style={{ marginTop: 40 }}>Our perspective, illustrative.</div>
      </div>
      <div className="map-plot" style={{ width: W, height: H }}>
        <div className={'map-glow' + (step >= 2 ? ' on' : '')} />
        <div className="ax ax-x"><span>Familiar</span><span>Character</span><span>Adventurous</span></div>
        <div className="ax ax-y"><span>Bold</span><span>Intensity</span><span>Gentle</span></div>
        {TERRITORIES.map((t, i) => {
          const [x, y] = POS[t.id];
          return (
            <R key={t.id} b={1} d={i * 120} step={step} className="mp" style={{ left: x * W, top: (1 - y) * H, ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}>
              <i /><span className="num">0{t.n}</span><b>{t.name}</b>
            </R>
          );
        })}
      </div>
    </div>
  );
}

// 24 to 30. Territory worlds: twenty seconds of light in the territory palette, then the card.
function World({ t }: { t: (typeof TERRITORIES)[number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, g = c.getContext('2d')!; const W = c.width, H = c.height; let raf = 0; const t0 = performance.now();
    const motes = Array.from({ length: 90 }, (_, i) => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 3.5, s: 0.15 + Math.random() * 0.5, c: t.palette[i % t.palette.length], p: Math.random() * 7 }));
    const f = (now: number) => {
      const k = (now - t0) / 1000;
      g.clearRect(0, 0, W, H);
      // slow ribbons of the palette, warm territories drift upward, cool ones sideways
      for (let b = 0; b < 3; b++) {
        const grd = g.createLinearGradient(0, 0, W, H);
        grd.addColorStop(0, t.palette[b % t.palette.length] + '00');
        grd.addColorStop(0.5, t.palette[b % t.palette.length] + '55');
        grd.addColorStop(1, t.palette[(b + 1) % t.palette.length] + '00');
        g.fillStyle = grd; g.beginPath();
        const base = H * (0.35 + b * 0.18);
        g.moveTo(0, base);
        for (let x = 0; x <= W; x += 40) g.lineTo(x, base + Math.sin(x * 0.003 + k * (0.3 + b * 0.1) + b) * 90 - t.warmth * 40 * Math.sin(k * 0.2));
        g.lineTo(W, base + 260); g.lineTo(0, base + 260); g.closePath(); g.fill();
      }
      for (const m of motes) {
        m.y -= m.s * (0.4 + t.warmth); m.x += Math.sin(k * 0.5 + m.p) * (0.6 - t.warmth * 0.4);
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        g.globalAlpha = 0.35 + 0.35 * Math.sin(k * 1.3 + m.p); g.fillStyle = m.c; g.beginPath(); g.arc(m.x, m.y, m.r, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [t]);
  return <canvas ref={ref} width={1920} height={1080} className="world-cv" />;
}

export function Territory({ step, idx }: SceneProps) {
  const t = TERRITORIES[idx - 1];
  return (
    <div className={'territory' + (t.dark ? ' dark' : '')} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] }}>
      {t.image && <img className="terr-img" src={t.image} alt="" />}
      <World t={t} />
      <div className="terr-veil" />
      <div className="pad terr-in">
        <Enter i={0}><div className="k">Territory {t.n} of 7 · <span className="fit">{t.fit}</span></div></Enter>
        <Enter i={1}><h2 className="hero terr-name">{t.name}</h2></Enter>
        <Enter i={2}><p className="h3 it terr-promise">{t.promise}</p></Enter>
        <R b={1} step={step} className="terr-card">
          <div><span className="k">Why now</span><p>{t.why}</p></div>
          <div><span className="k">Flavors</span><ul>{t.flavors.map((f) => <li key={f}>{f}</li>)}</ul></div>
          <div><span className="k">Sensory signature</span><p>{t.signature}</p><span className="k" style={{ marginTop: 24, display: 'block' }}>Who</span><p>{t.who}</p>{t.fitNote && <p className="src" style={{ marginTop: 16 }}>{t.fitNote}</p>}</div>
        </R>
      </div>
    </div>
  );
}

// 31. Blind tasting: heat map fills as phones score, then the names flip in.
export function Tasting({ s, step }: SceneProps) {
  const rows = SAMPLES.map((x) => ({ ...x, sum: tasteSummary(s, x.code) }));
  const metrics: ['appeal' | 'feels' | 'newness', string][] = [['appeal', 'Appeal'], ['feels', 'Feels like TheraBreath'], ['newness', 'Newness']];
  const cell = (v: number) => { const a = Math.max(0, Math.min(1, (v - 1) / 4)); return { background: `color-mix(in oklab, var(--accent) ${Math.round(a * 85)}%, transparent)`, opacity: v ? 1 : 0.35 }; };
  const words = rows.flatMap((r) => r.sum.words.map((w) => ({ w, code: r.code })));
  return (
    <div className="pad tasting">
      <Enter i={0}><div className="k">Blind tasting · samples A to D · {Math.max(0, ...rows.map((r) => r.sum.n))} tasters</div></Enter>
      <Enter i={1}><h2 className="h2">Taste first. <span className="it">Names later.</span></h2></Enter>
      <div className="heat">
        <div className="hrow head"><span />{metrics.map(([, l]) => <span key={l}>{l}</span>)}<span>Who is it for</span></div>
        {rows.map((r) => (
          <div key={r.code} className="hrow">
            <div className={'hname' + (step >= 2 ? ' flip' : '')}><b className="num">{r.code}</b><span>{r.name}</span></div>
            {metrics.map(([k]) => <div key={k} className="hcell" style={cell(r.sum[k])}><b className="num">{r.sum[k] ? r.sum[k].toFixed(1) : ''}</b></div>)}
            <div className="hwho">{ranked(r.sum.who).slice(0, 3).map(([w, n]) => <span key={w}>{w} <b>{n}</b></span>)}</div>
          </div>
        ))}
      </div>
      <R b={1} step={step} className="words">{words.slice(-24).map((x, i) => <span key={i} style={{ ['--i' as any]: i, fontSize: 26 + ((i * 13) % 4) * 8 }}>{x.w}</span>)}{!words.length && <span className="empty">One word per sample arrives from the phones.</span>}</R>
    </div>
  );
}

// 32. Territory vote: five chips each. Territories grow as chips land.
export function Chips({ s, step }: SceneProps) {
  const t = tallyPick(s, 'territories');
  const v = s.votes.territories;
  const voters = Object.keys(v?.picks || {}).length;
  const max = Math.max(1, ...Object.values(t));
  const order = ranked(t).map((x) => x[0]);
  const revealed = v?.revealed || step >= 1;
  return (
    <div className="pad chips">
      <Enter i={0}><div className="k">Territory vote · {voters} {voters === 1 ? 'voter' : 'voters'} {v?.open ? '· open' : v?.locked ? '· locked' : ''}</div></Enter>
      <Enter i={1}><h2 className="h2">Five chips each. <span className="it">Where should TheraBreath go?</span></h2></Enter>
      <div className="orbs">
        {TERRITORIES.map((tr, i) => {
          const n = t[tr.id] || 0; const size = 120 + (n / max) * 100; const rank = order.indexOf(tr.id);
          return (
            <div key={tr.id} className={'orb' + (revealed && rank > -1 && rank < 3 ? ' top' : '')} style={{ ['--c1' as any]: tr.palette[0], ['--c2' as any]: tr.palette[1], ['--s' as any]: `${size}px`, ['--i' as any]: i }}>
              <div className="orb-ball"><b className="num">{n}</b></div>
              <span>{tr.name}</span>
              {revealed && rank > -1 && rank < 3 && <em className="k">No. {rank + 1}</em>}
            </div>
          );
        })}
      </div>
      {revealed && <div className="lock-note"><span className="k">Ranking locked into Chapter 2</span></div>}
    </div>
  );
}

export const TERRITORY_HUE = (id: string) => spectrumAt(TERRITORIES.findIndex((t) => t.id === id) / 6);
export { WHO_CHIPS };

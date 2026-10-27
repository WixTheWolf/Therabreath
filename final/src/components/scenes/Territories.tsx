'use client';
import { useEffect, useRef, useState } from 'react';
import Light from '../Light';
import { Compass } from './Hybrid';
import { R, Enter, Src, SceneProps, spectrumAt } from './ui';
import { PRIMARY_TERRITORIES as TERRITORIES, SAMPLES, WHO_CHIPS, ROSS_GOAL, MYSTERY } from '@/lib/content';
import { tallyPick, ranked, tasteSummary } from '@/lib/state';

// Map positions: x = character (familiar to adventurous), y = intensity (gentle to bold). Our perspective, illustrative.
const POS: Record<string, [number, number]> = { mint: [0.16, 0.58], bright: [0.5, 0.74], botanical: [0.3, 0.3], warmcool: [0.66, 0.6], fruit: [0.62, 0.42], night: [0.7, 0.16], ladder: [0.3, 0.1] };

// 23. The map
export function MapScene({ step }: SceneProps) {
  const W = 1160, H = 700;
  return (
    <div className="pad map">
      <div className="map-copy">
        <Enter i={0}><div className="k">Four directions</div></Enter>
        <Enter i={1}><h2 className="h1">Where we think <span className="it">flavor could go.</span></h2></Enter>
        <R b={2} step={step}><p className="lede" style={{ maxWidth: 460, marginTop: 36 }}>Two of these are in today&rsquo;s tasting. We want your opinion on the other two.</p></R>
        <div className="src" style={{ marginTop: 40 }}>Our view, not data.</div>
      </div>
      <div className={'map-cards' + (step >= 3 ? ' on' : '')}>
        {TERRITORIES.map((t, i) => {
          const tasted = SAMPLES.some((x) => x.territory === t.id);
          return (
            <div key={t.id} className="mc" style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--i' as any]: i }}>
              <div className="mc-top"><span className="num">0{t.n}</span><em className="k">{tasted ? 'In today’s tasting' : 'For discussion'}</em></div>
              <b>{t.name}</b>
              <p>{t.promise}</p>
              <div className="mc-q"><span className="k">Our question</span>{t.q}</div>
            </div>
          );
        })}
      </div>
      <div className={'map-plot' + (step >= 3 ? ' away' : '')} style={{ width: W, height: H }}>
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

export function Territory({ s, step, idx }: SceneProps) {
  const t = TERRITORIES[idx - 1];
  const [stage, setStage] = useState(0);
  useEffect(() => { const i = setInterval(() => setStage((x) => (x + 1) % 3), 2600); return () => clearInterval(i); }, []);
  return (
    <div className={'territory' + (t.dark ? ' dark' : '')} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1], ['--c3' as any]: t.palette[2] }}>
      {t.image ? <img className="terr-img" src={t.image} alt="" /> : <div className="terr-img terr-noimg" />}
      {!t.image && <World t={t} />}
      <div className="terr-veil" />
      <div className="pad terr-in">
        <Enter i={0}><div className="k">Direction {t.n} of 4 · {t.moment}</div></Enter>
        <Enter i={1}><h2 className="terr-name">{t.name}</h2></Enter>
        <Enter i={2}><div className="terr-hero it">{SAMPLES.some((x) => x.territory === t.id) ? 'In today’s tasting' : 'For discussion'}</div></Enter>
        <Enter i={3}><p className="terr-promise">{t.promise}</p></Enter>
        <Enter i={4}>
          <div className="terr-arc">
            {t.arc.map((a, i) => <div key={a} className={i === stage ? 'on' : ''}><span className="k">{['First', 'Then', 'Finish'][i]}</span><b>{a}</b><i style={{ height: `${20 + t.curve[i] * 70}px` }} /></div>)}
          </div>
        </Enter>
        <R b={0} d={1400} step={step} className="terr-q"><span className="k">Our question</span><b>{t.q}</b></R>
      </div>
      <div className={'terr-compass' + (step >= 1 ? ' up' : '')}>
        <Compass prof={t.prof[stage]} color={t.palette[1]} size={440} stage={['First impression', 'Main flavor', 'Finish'][stage] + ' · grey: your core mint'} />
      </div>
      <R b={1} step={step} className="terr-card">
        <div><span className="k">Where it stands</span><p>{t.why}</p>{t.fitNote && <p className="src" style={{ marginTop: 12 }}>{t.fitNote}</p>}</div>
        <div><span className="k">What it tastes like</span><p>{t.signature}</p>{SAMPLES.some((x) => x.territory === t.id) && <p>We will tell you which samples these are after the tasting.</p>}</div>
        <div><span className="k">Who it is for</span><p>{t.who}</p></div>
      </R>
    </div>
  );
}

// 31. Blind tasting: heat map fills as phones score, then the names flip in.
export function Tasting({ s, step }: SceneProps) {
  const rows = SAMPLES.map((x) => { const g = Object.values(s.ratings[x.code] || {}).map((r) => r.guess).filter(Boolean); return { ...x, sum: tasteSummary(s, x.code), guessN: g.length, right: g.filter((v) => v === x.territory).length }; });
  const metrics: ['appeal' | 'feels' | 'newness', string][] = [['appeal', 'Appeal'], ['feels', 'Feels like TheraBreath'], ['newness', 'Newness']];
  const cell = (v: number) => { const a = Math.max(0, Math.min(1, (v - 1) / 4)); return { background: `color-mix(in oklab, var(--accent) ${Math.round(a * 85)}%, transparent)`, opacity: v ? 1 : 0.35 }; };
  const mysteryGuesses = Object.values(s.ratings[MYSTERY] || {}).map(r => r.fruitGuess).filter(Boolean);
  const words = rows.flatMap((r) => r.sum.words.map((w) => ({ w, code: r.code })));
  return (
    <div className="pad tasting">
      <Enter i={0}><div className="k">Blind tasting · samples A to D, made in the TheraBreath bases you sent · {Math.max(0, ...rows.map((r) => r.sum.n))} tasters</div></Enter>
      <Enter i={1}><h2 className="h2">Taste first. <span className="it">Names later.</span></h2></Enter>
      <div className="heat">
        <div className="hrow head"><span />{metrics.map(([, l]) => <span key={l}>{l}</span>)}<span>Who is it for</span></div>
        {rows.map((r) => (
          <div key={r.code} className="hrow">
            <div className={'hname' + (step >= 2 ? ' flip' : '')}><b className="num">{r.code}</b><span>{r.name}{step >= 2 && <small style={{ display: 'block', fontSize: 15 }}>{r.note} · {r.base}</small>}{step >= 2 && r.guessN > 0 && <em className="hguess">{r.right} of {r.guessN} guessed {TERRITORIES.find((x) => x.id === r.territory)?.name}</em>}</span></div>
            {metrics.map(([k]) => <div key={k} className="hcell" style={cell(r.sum[k])}><b className="num">{r.sum[k] ? r.sum[k].toFixed(1) : ''}</b></div>)}
            <div className="hwho">{ranked(r.sum.who).slice(0, 3).map(([w, n]) => <span key={w}>{w} <b>{n}</b></span>)}</div>
          </div>
        ))}
      </div>
      <R b={1} step={step} className="words">{mysteryGuesses.length > 0 && <span style={{ fontSize: 20 }}>Mystery guesses: {mysteryGuesses.join(' · ')}</span>}{words.slice(-16).map((x, i) => <span key={i} style={{ ['--i' as any]: i, fontSize: 24 + ((i * 13) % 4) * 6 }}>{x.w}</span>)}{!words.length && <span className="empty">One word per sample arrives from the phones.</span>}</R>
    </div>
  );
}

// The growth matrix: Ross's two goals as two axes. Feels like TheraBreath (loyal users) across, newness (new consumers) up, appeal as size.
export function Matrix({ s, step }: SceneProps) {
  const pts = SAMPLES.map((x, i) => ({ ...x, sum: tasteSummary(s, x.code), c: spectrumAt(0.08 + i * 0.27) }));
  const scored = pts.filter((p) => p.sum.n > 0);
  const lead = scored.length ? scored.reduce((a, b) => (b.sum.feels + b.sum.newness > a.sum.feels + a.sum.newness ? b : a)) : null;
  // Axes run 1.5 to 4.5 so the midline sits at 3, the middle of the 1 to 5 scale; scores outside clamp to the edge.
  const at = (v: number) => Math.max(0, Math.min(1, (v - 1.5) / 3)) * 100;
  const out = step >= 1 && scored.length > 0;
  return (
    <div className="pad matrix">
      <Enter i={0}><div className="k">From your scores · {Math.max(0, ...pts.map((p) => p.sum.n))} {Math.max(0, ...pts.map((p) => p.sum.n)) === 1 ? 'person' : 'people'}</div></Enter>
      <Enter i={1}><h2 className="h2">Where each sample <span className="it">landed.</span></h2></Enter>
      <Enter i={2} className="mx-goal">
        <p>{ROSS_GOAL.lead} <mark className="mx-x">{ROSS_GOAL.loyal}</mark> {ROSS_GOAL.joiner} <mark className="mx-y">{ROSS_GOAL.fresh}</mark></p>
        <Src k={ROSS_GOAL.src} style={{ position: 'static' }} />
      </Enter>
      <div className="mx-plot">
        <i className="mx-mid v" /><i className="mx-mid h" />
        <span className="mx-q tr">Does both<b>Develop first</b></span>
        <span className="mx-q tl">New, but doesn&rsquo;t feel like TheraBreath yet<b>Work on the finish</b></span>
        <span className="mx-q br">Feels like TheraBreath<b>Could extend a line</b></span>
        <span className="mx-q bl">Neither yet<b>Rethink it</b></span>
        <span className="mx-ax x">Feels like TheraBreath <em>strengthens loyal users</em> →</span>
        <span className="mx-ax y">Newness <em>attracts new consumers</em> →</span>
        {pts.map((p, i) => {
          const x = out && p.sum.n ? at(p.sum.feels) : 50, y = out && p.sum.n ? at(p.sum.newness) : 50;
          const size = out && p.sum.n ? 70 + at(p.sum.appeal) * 1.3 : 56;
          return (
            <div key={p.code} className={'mx-b' + (out && lead?.code === p.code ? ' lead' : '') + (p.sum.n ? '' : ' none')} style={{ left: `${x}%`, top: `${100 - y}%`, ['--s' as any]: `${size}px`, ['--c' as any]: p.c, ['--i' as any]: i }}>
              <b className="num">{p.code}</b>
            </div>
          );
        })}
        {!scored.length && <span className="mx-empty">Your tasting scores show up here.</span>}
      </div>
      <R b={1} step={step} className="mx-legend">
        {[...pts].sort((x, y) => (y.sum.feels + y.sum.newness) - (x.sum.feels + x.sum.newness)).map((p) => (
          <div key={p.code} className={'mx-row' + (lead?.code === p.code ? ' lead' : '')} style={{ ['--c' as any]: p.c }}>
            <i className="num">{p.code}</i><b>{p.name}</b>
            <span>{p.sum.n ? <>Loyal {p.sum.feels.toFixed(1)} · New {p.sum.newness.toFixed(1)} · Appeal {p.sum.appeal.toFixed(1)}</> : 'Not scored'}</span>
          </div>
        ))}
        <p className="mx-take">{lead ? <><b>{lead.name}</b> came closest to doing both. </> : null}These are first reactions from this group, not consumer research.</p>
      </R>
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
